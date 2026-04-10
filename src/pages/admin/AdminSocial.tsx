import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LinkForm {
  platform: string; url: string; label: string; icon: string; display_order: number;
}

const emptyForm: LinkForm = { platform: "", url: "", label: "", icon: "Link", display_order: 0 };

const AdminSocial = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<LinkForm>(emptyForm);
  const [showNew, setShowNew] = useState(false);

  const { data: links, isLoading } = useQuery({
    queryKey: ["admin_social"],
    queryFn: async () => {
      const { data, error } = await supabase.from("social_links").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("social_links").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_social"] });
      queryClient.invalidateQueries({ queryKey: ["social_links"] });
      setShowNew(false); setForm(emptyForm);
      toast.success("Link added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_links").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_social"] });
      queryClient.invalidateQueries({ queryKey: ["social_links"] });
      setEditing(null); setForm(emptyForm);
      toast.success("Link updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_social"] });
      queryClient.invalidateQueries({ queryKey: ["social_links"] });
      toast.success("Link deleted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const renderForm = (onSubmit: () => void, label: string) => (
    <div className="p-4 rounded-xl bg-card border border-border space-y-3 mb-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <input placeholder="Platform (e.g. github)" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <input placeholder="Label (e.g. GitHub)" value={form.label} onChange={e => setForm({...form, label: e.target.value})}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <input placeholder="URL" value={form.url} onChange={e => setForm({...form, url: e.target.value})}
        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      <div className="flex gap-3 items-end">
        <input placeholder="Icon name (e.g. Mail, Github)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
          className="flex-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <input type="number" placeholder="Order" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})}
          className="w-20 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="flex gap-3">
        <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> {label}
        </button>
        <button onClick={() => { setEditing(null); setShowNew(false); setForm(emptyForm); }}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Social Links</h1>
        <button onClick={() => { setShowNew(true); setEditing(null); setForm(emptyForm); }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Plus size={16} /> New Link
        </button>
      </div>

      {showNew && renderForm(() => createMutation.mutate(), "Create")}

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Loading...</div>
      ) : (
        <div className="space-y-3">
          {links?.map((link) => (
            <div key={link.id}>
              {editing === link.id ? (
                renderForm(() => updateMutation.mutate(link.id), "Update")
              ) : (
                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold">{link.label}</h3>
                    <p className="text-xs text-muted-foreground">{link.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(link.id); setShowNew(false); setForm({ platform: link.platform, url: link.url, label: link.label, icon: link.icon, display_order: link.display_order }); }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(link.id); }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSocial;
