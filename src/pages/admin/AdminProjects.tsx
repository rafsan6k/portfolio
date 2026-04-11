import { useState } from "react";
import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Save, Loader2, Upload, Image as ImageIcon, Link as LinkIcon, ExternalLink, Github } from "lucide-react";
import { toast } from "sonner";

interface ProjectForm {
  title: string;
  description: string;
  category: string;
  tags: string;
  live_url: string;
  github_url: string;
  image_url: string;
  display_order: number;
  visible: boolean;
}

const emptyForm: ProjectForm = {
  title: "", description: "", category: "Web Dev", tags: "",
  live_url: "", github_url: "", image_url: "", display_order: 0, visible: true,
};

const AdminProjects = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [showNew, setShowNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert({
        title: form.title, description: form.description, category: form.category,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        live_url: form.live_url || null, github_url: form.github_url || null,
        image_url: form.image_url || null,
        display_order: form.display_order, visible: form.visible,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowNew(false); setForm(emptyForm);
      toast.success("Project created!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").update({
        title: form.title, description: form.description, category: form.category,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        live_url: form.live_url || null, github_url: form.github_url || null,
        image_url: form.image_url || null,
        display_order: form.display_order, visible: form.visible,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null); setForm(emptyForm);
      toast.success("Project updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEdit = (project: any) => {
    setEditing(project.id);
    setShowNew(false);
    setForm({
      title: project.title, description: project.description, category: project.category,
      tags: project.tags?.join(", ") ?? "", live_url: project.live_url ?? "",
      github_url: project.github_url ?? "", image_url: project.image_url ?? "", display_order: project.display_order, visible: project.visible,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `projects/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("profile_photos").upload(fileName, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const publicUrl = supabase.storage.from("profile_photos").getPublicUrl(fileName).data.publicUrl;
    setForm(prev => ({ ...prev, image_url: publicUrl }));
    setUploading(false);
    toast.success("Image uploaded!");
    if (fileRef.current) fileRef.current.value = "";
  };

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="p-6 rounded-xl bg-card border border-border space-y-4 mb-6">
      
      {/* Image Upload Section */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary border border-border">
        {form.image_url ? (
          <img src={form.image_url} alt="Project Preview" className="w-20 h-20 rounded-md object-cover border border-border" />
        ) : (
          <div className="w-20 h-20 rounded-md bg-secondary border border-border flex items-center justify-center">
            <ImageIcon size={24} className="text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Project Image</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-60 whitespace-nowrap">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
            <input placeholder="Or enter image URL directly" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
              className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
      <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      {/* Project Links Section */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <LinkIcon size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Project Links</span>
          <span className="text-xs text-muted-foreground">(click করলে সরাসরি website এ redirect হবে)</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ExternalLink size={12} /> Live Website URL</label>
            <input placeholder="https://your-project-site.com" value={form.live_url} onChange={e => setForm({...form, live_url: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Github size={12} /> GitHub URL</label>
            <input placeholder="https://github.com/user/repo" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <input type="number" placeholder="Order" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})}
          className="w-24 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={form.visible} onChange={e => setForm({...form, visible: e.target.checked})} />
          Visible
        </label>
      </div>
      <div className="flex gap-3">
        <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> {submitLabel}
        </button>
        <button onClick={() => { setEditing(null); setShowNew(false); setForm(emptyForm); }} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Projects</h1>
        <button onClick={() => { setShowNew(true); setEditing(null); setForm(emptyForm); }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {showNew && renderForm(() => createMutation.mutate(), "Create")}

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Loading...</div>
      ) : (
        <div className="space-y-3">
          {projects?.map((project) => (
            <div key={project.id}>
              {editing === project.id ? (
                renderForm(() => updateMutation.mutate(project.id), "Update")
              ) : (
                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold">{project.title}</h3>
                    <p className="text-xs text-muted-foreground">{project.category} · Order: {project.display_order} {!project.visible && "· Hidden"}</p>
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                        <ExternalLink size={12} /> {project.live_url}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(project)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate(project.id); }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive">
                      <Trash2 size={16} />
                    </button>
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

export default AdminProjects;
