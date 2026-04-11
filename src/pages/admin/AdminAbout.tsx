import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Save, Code, Brain, Zap, Palette, Globe, Cpu, Sparkles, Rocket, Shield, Database, Terminal, Lightbulb, Pencil, X } from "lucide-react";
import { toast } from "sonner";

const availableIcons = [
  { name: "Code", icon: Code },
  { name: "Brain", icon: Brain },
  { name: "Zap", icon: Zap },
  { name: "Palette", icon: Palette },
  { name: "Globe", icon: Globe },
  { name: "Cpu", icon: Cpu },
  { name: "Sparkles", icon: Sparkles },
  { name: "Rocket", icon: Rocket },
  { name: "Shield", icon: Shield },
  { name: "Database", icon: Database },
  { name: "Terminal", icon: Terminal },
  { name: "Lightbulb", icon: Lightbulb },
];

interface AboutCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

const defaultCards: AboutCard[] = [
  { id: "1", title: "Web Development", description: "Building responsive, performant, and scalable web applications.", icon: "Code", display_order: 1 },
  { id: "2", title: "Prompt Engineering", description: "Crafting optimized AI prompts to drive intelligent and accurate results.", icon: "Brain", display_order: 2 },
  { id: "3", title: "AI Automations", description: "Creating smart workflows and automations powered by LLM technologies.", icon: "Zap", display_order: 3 },
];

const AdminAbout = () => {
  const queryClient = useQueryClient();

  // ─── About Site Content ──────────────────────────────────────────
  const { data: items, isLoading: contentLoading } = useQuery({
    queryKey: ["admin_content", "about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", "about")
        .order("key");
      if (error) throw error;
      return data;
    },
  });

  const [edits, setEdits] = useState<Record<string, string>>({});

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase.from("site_content").update({ value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
      queryClient.invalidateQueries({ queryKey: ["admin_content"] });
      toast.success("Content updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const insertContentMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_content").insert({ section: "about", key, value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
      queryClient.invalidateQueries({ queryKey: ["admin_content"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSaveContent = (id: string, key: string) => {
    const value = edits[key];
    if (value !== undefined) {
      updateContentMutation.mutate({ id, value });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // ─── Cards Management (JSON in site_content) ────────────────────────────────────────────
  const cardsItem = items?.find(item => item.key === "cards");
  
  let cards: AboutCard[] = [];
  try {
    cards = cardsItem ? JSON.parse(cardsItem.value) : defaultCards;
    // ensure it's sorted by display order
    cards = [...cards].sort((a, b) => a.display_order - b.display_order);
  } catch (e) {
    cards = defaultCards;
  }

  const [newCard, setNewCard] = useState({ title: "", description: "", icon: "Code", display_order: 0 });
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardData, setEditCardData] = useState({ title: "", description: "", icon: "Code", display_order: 0 });

  const saveCardsConfig = async (updatedCards: AboutCard[]) => {
    const stringified = JSON.stringify(updatedCards);
    if (cardsItem) {
      return updateContentMutation.mutateAsync({ id: cardsItem.id, value: stringified });
    } else {
      return insertContentMutation.mutateAsync({ key: "cards", value: stringified });
    }
  };

  const handleAddCard = async () => {
    const id = Date.now().toString();
    const updatedCards = [...cards, { ...newCard, id }];
    await saveCardsConfig(updatedCards);
    setNewCard({ title: "", description: "", icon: "Code", display_order: 0 });
    toast.success("Card added!");
  };

  const handleUpdateCard = async (id: string) => {
    const updatedCards = cards.map(c => c.id === id ? { ...editCardData, id } : c);
    await saveCardsConfig(updatedCards);
    setEditingCardId(null);
    toast.success("Card updated!");
  };

  const handleDeleteCard = async (id: string) => {
    if(!window.confirm('Are you sure you want to delete this card?')) return;
    const updatedCards = cards.filter(c => c.id !== id);
    await saveCardsConfig(updatedCards);
    toast.success("Card deleted!");
  };

  const isLoading = contentLoading;

  // Filter out the 'cards' JSON key from the text content configuration
  const textContentItems = items?.filter(item => item.key !== "cards" && !item.key.startsWith('card1_') && !item.key.startsWith('card2_') && !item.key.startsWith('card3_'));

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">About Section</h1>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Loading...</div>
      ) : (
        <>
          {/* ─── Text Content ───────────────────────────────── */}
          <h2 className="text-lg font-heading font-semibold mb-4 text-primary">Text Content</h2>
          <div className="space-y-4 mb-10">
            {textContentItems?.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-card border border-border">
                <label className="block text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                  {item.key.replace(/_/g, " ")}
                </label>
                {(edits[item.key] ?? item.value).length > 80 ? (
                  <textarea
                    value={edits[item.key] ?? item.value}
                    onChange={(e) => setEdits({ ...edits, [item.key]: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={edits[item.key] ?? item.value}
                    onChange={(e) => setEdits({ ...edits, [item.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
                {edits[item.key] !== undefined && edits[item.key] !== item.value && (
                  <button
                    onClick={() => handleSaveContent(item.id, item.key)}
                    disabled={updateContentMutation.isPending}
                    className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2"
                  >
                    <Save size={14} /> Save
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ─── Cards ─────────────────────────────── */}
          <h2 className="text-lg font-heading font-semibold mb-4 text-primary">About Section Cards</h2>

          {/* Add card */}
          <div className="p-4 rounded-xl bg-card border border-border mb-6 space-y-3">
            <h3 className="text-sm font-heading font-semibold mb-2">Create New Card</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Title</label>
                <input placeholder="e.g. Web Development" value={newCard.title} onChange={e => setNewCard({...newCard, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Description</label>
                <input placeholder="Short description" value={newCard.description} onChange={e => setNewCard({...newCard, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="min-w-[160px]">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Icon</label>
                <select value={newCard.icon} onChange={e => setNewCard({...newCard, icon: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {availableIcons.map(ic => (
                    <option key={ic.name} value={ic.name}>{ic.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Order</label>
                <input type="number" placeholder="0" value={newCard.display_order} onChange={e => setNewCard({...newCard, display_order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button onClick={handleAddCard} disabled={!newCard.title || !newCard.description}
                className="px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
                <Plus size={16} /> Add Card
              </button>
            </div>
          </div>

          {/* Existing cards */}
          <div className="space-y-3">
            {cards.map(card => {
              const IconComp = availableIcons.find(ic => ic.name === card.icon)?.icon || Code;
              const isEditing = editingCardId === card.id;

              return (
                <div key={card.id} className="p-4 rounded-xl bg-card border border-border transition-all">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-heading font-semibold text-primary">Editing Card</h3>
                        <button onClick={() => setEditingCardId(null)} className="text-muted-foreground hover:text-foreground">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Title</label>
                          <input value={editCardData.title} onChange={e => setEditCardData({...editCardData, title: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Description</label>
                          <input value={editCardData.description} onChange={e => setEditCardData({...editCardData, description: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div className="min-w-[160px]">
                          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Icon</label>
                          <select value={editCardData.icon} onChange={e => setEditCardData({...editCardData, icon: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                            {availableIcons.map(ic => (
                              <option key={ic.name} value={ic.name}>{ic.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Order</label>
                          <input type="number" value={editCardData.display_order} onChange={e => setEditCardData({...editCardData, display_order: parseInt(e.target.value) || 0})}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <button onClick={() => handleUpdateCard(card.id)} disabled={!editCardData.title || !editCardData.description}
                          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
                          <Save size={16} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 group">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComp size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-semibold text-sm">{card.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{card.description || "No description"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">#{card.display_order}</span>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditCardData({ title: card.title, description: card.description, icon: card.icon, display_order: card.display_order });
                            setEditingCardId(card.id);
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {cards.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No cards configured yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAbout;
