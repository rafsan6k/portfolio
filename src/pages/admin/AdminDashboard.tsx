import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Wrench, Share2, FileText, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: projectCount } = useQuery({
    queryKey: ["admin_project_count"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: skillCount } = useQuery({
    queryKey: ["admin_skill_count"],
    queryFn: async () => {
      const { count } = await supabase.from("skills").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: socialCount } = useQuery({
    queryKey: ["admin_social_count"],
    queryFn: async () => {
      const { count } = await supabase.from("social_links").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: contentCount } = useQuery({
    queryKey: ["admin_content_count"],
    queryFn: async () => {
      const { count } = await supabase.from("site_content").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: submissionCount } = useQuery({
    queryKey: ["admin_submission_count"],
    queryFn: async () => {
      const { count } = await supabase.from("booking_submissions").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const cards = [
    { label: "Submissions", count: submissionCount, icon: Inbox, path: "/admin/submissions", color: "text-primary" },
    { label: "Projects", count: projectCount, icon: FolderOpen, path: "/admin/projects", color: "text-primary" },
    { label: "Skills", count: skillCount, icon: Wrench, path: "/admin/skills", color: "text-primary" },
    { label: "Social Links", count: socialCount, icon: Share2, path: "/admin/social", color: "text-primary" },
    { label: "Content Items", count: contentCount, icon: FileText, path: "/admin/content", color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="p-6 rounded-xl bg-card border border-border hover:glow-border transition-shadow"
          >
            <card.icon className={`w-8 h-8 ${card.color} mb-3`} />
            <p className="text-3xl font-heading font-bold">{card.count ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
