import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const PhotoManager = ({ section, title }: { section: string, title: string }) => {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: content } = useQuery({
    queryKey: ["admin_content", section],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").eq("section", section);
      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((row) => { map[row.key] = row; });
      return map;
    },
  });

  const photoPath = content?.photo_url?.value;
  const publicUrl = photoPath
    ? supabase.storage.from("profile_photos").getPublicUrl(photoPath).data.publicUrl
    : null;

  const upsertContentMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (content?.[key]) {
        const { error } = await supabase.from("site_content").update({ value }).eq("id", content[key].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert({ section, key, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_content", section] });
      queryClient.invalidateQueries({ queryKey: ["site_content", section] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${section}_profile_${Date.now()}.${ext}`;

    // Delete old file if exists
    if (photoPath) {
      await supabase.storage.from("profile_photos").remove([photoPath]);
    }

    const { error } = await supabase.storage.from("profile_photos").upload(fileName, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    await upsertContentMutation.mutateAsync({ key: "photo_url", value: fileName });
    setUploading(false);
    toast.success(`${title} updated!`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!photoPath || !confirm(`Remove ${title}?`)) return;
    setUploading(true);
    await supabase.storage.from("profile_photos").remove([photoPath]);
    await upsertContentMutation.mutateAsync({ key: "photo_url", value: "" });
    setUploading(false);
    toast.success(`${title} removed!`);
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border text-center flex flex-col items-center">
      <h2 className="text-lg font-heading font-semibold mb-6">{title}</h2>
      {publicUrl && photoPath ? (
        <div className="relative inline-block mb-4">
          <img src={publicUrl} alt={title} className="w-40 h-40 rounded-full object-cover border-2 border-primary/30 mx-auto" />
          <button onClick={handleDelete} disabled={uploading}
            className="absolute -top-1 -right-1 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:opacity-90">
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div className="w-40 h-40 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
          <ImageIcon size={40} className="text-muted-foreground" />
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2 mx-auto disabled:opacity-60">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>
      <p className="text-xs text-muted-foreground mt-3">Max 5MB. JPG, PNG, or WebP.</p>
    </div>
  );
};

const AdminPhotos = () => {
  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Photos</h1>
      
      <div className="max-w-4xl">
        <p className="text-muted-foreground mb-8">Manage the photos displayed across different sections of your website.</p>
        <div className="grid md:grid-cols-2 gap-8">
          <PhotoManager section="about" title="About Section Photo" />
          <PhotoManager section="contact" title="Contact Section Photo" />
        </div>
      </div>
    </div>
  );
};

export default AdminPhotos;
