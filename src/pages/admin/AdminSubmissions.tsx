import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Eye, Loader2, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  new: "bg-primary/20 text-primary",
  read: "bg-muted text-muted-foreground",
  replied: "bg-accent/20 text-accent-foreground",
};

const AdminSubmissions = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("booking_submissions")
        .update({ status: "read" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_submissions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_submissions"] });
      setSelected(null);
      toast.success("Submission deleted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("booking_submissions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_submissions"] });
      toast.success("Status updated!");
    },
  });

  const newCount = submissions?.filter((s) => s.status === "new").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Form Submissions</h1>
          {newCount > 0 && (
            <p className="text-sm text-primary mt-1">{newCount} new submission{newCount > 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Loading...
        </div>
      ) : submissions?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No submissions yet</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-3">
            {submissions?.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelected(sub);
                  if (sub.status === "new") markReadMutation.mutate(sub.id);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selected?.id === sub.id
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-semibold truncate">{sub.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[sub.status] ?? statusColors.new}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 truncate">{sub.service}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                  <Calendar size={10} />
                  {new Date(sub.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="p-6 rounded-xl bg-card border border-border sticky top-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-heading font-semibold">{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
                </div>
                <button
                  onClick={() => { if (confirm("Delete this submission?")) deleteMutation.mutate(selected.id); }}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Service</span>
                  <p className="text-foreground">{selected.service || "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Message</span>
                  <p className="text-foreground whitespace-pre-wrap">{selected.message || "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Submitted</span>
                  <p className="text-foreground">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                {["new", "read", "replied"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatusMutation.mutate({ id: selected.id, status: s })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selected.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSubmissions;
