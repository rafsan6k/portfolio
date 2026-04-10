import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const sections = ["hero", "about", "skills", "projects", "booking", "contact", "footer", "navbar"];

const AdminContent = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin_content", activeSection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", activeSection)
        .order("key");
      if (error) throw error;
      return data;
    },
  });

  const [edits, setEdits] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
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

  const handleSave = (id: string, key: string) => {
    const value = edits[key];
    if (value !== undefined) {
      updateMutation.mutate({ id, value });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Site Content</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveSection(s); setEdits({}); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSection === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Loading...</div>
      ) : (
        <div className="space-y-4">
          {items?.map((item) => (
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
                  onClick={() => handleSave(item.id, item.key)}
                  disabled={updateMutation.isPending}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2"
                >
                  <Save size={14} /> Save
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
