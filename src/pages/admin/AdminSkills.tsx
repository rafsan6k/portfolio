import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminSkills = () => {
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState({ name: "", category: "", display_order: 0 });

  const { data: skills, isLoading } = useQuery({
    queryKey: ["admin_skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("category").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("skills").insert(newSkill);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      setNewSkill({ name: "", category: "", display_order: 0 });
      toast.success("Skill added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill deleted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const categories = [...new Set(skills?.map(s => s.category) ?? [])];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Skills</h1>

      {/* Add skill */}
      <div className="p-4 rounded-xl bg-card border border-border mb-8 flex flex-wrap gap-3 items-end">
        <input placeholder="Skill name" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})}
          className="flex-1 min-w-[150px] px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <input placeholder="Category" value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})}
          className="flex-1 min-w-[150px] px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <input type="number" placeholder="Order" value={newSkill.display_order} onChange={e => setNewSkill({...newSkill, display_order: parseInt(e.target.value) || 0})}
          className="w-20 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <button onClick={() => createMutation.mutate()} disabled={!newSkill.name || !newSkill.category}
          className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
          <Plus size={16} /> Add
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Loading...</div>
      ) : (
        <div className="space-y-8">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">{cat}</h3>
              <div className="flex flex-wrap gap-2">
                {skills?.filter(s => s.category === cat).map(skill => (
                  <div key={skill.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm group">
                    {skill.name}
                    <button onClick={() => deleteMutation.mutate(skill.id)}
                      className="ml-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSkills;
