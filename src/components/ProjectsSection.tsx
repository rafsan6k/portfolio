import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { useProjects, useSiteContent } from "@/hooks/useSiteContent";

const ProjectsSection = () => {
  const [active, setActive] = useState("All");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content } = useSiteContent("projects");
  const { data: projects } = useProjects();

  const visibleProjects = projects?.filter(p => p.visible) ?? [];
  const categories = ["All", ...new Set(visibleProjects.map(p => p.category))];
  const filtered = active === "All" ? visibleProjects : visibleProjects.filter(p => p.category === active);

  return (
    <section id="projects" className="py-24 md:py-32">
      <div ref={ref} className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {(content?.title ?? "Featured Projects").replace(/(\S+)$/, "")}
            <span className="text-gradient">{(content?.title ?? "Featured Projects").split(" ").pop()}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{content?.subtitle ?? ""}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === cat ? "bg-primary text-primary-foreground glow-primary" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}>
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div key={project.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group p-6 rounded-xl bg-card border border-border hover:glow-border hover:-translate-y-1 transition-all duration-300">
              <div className="h-40 rounded-lg bg-secondary mb-4 flex items-center justify-center overflow-hidden">
                {project.live_url ? (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="w-full h-full block group/img">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center group-hover/img:bg-primary/5 transition-colors">
                        <span className="text-2xl font-heading font-bold text-muted-foreground/30 group-hover/img:text-primary transition-colors">{project.title.charAt(0)}</span>
                      </div>
                    )}
                  </a>
                ) : project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-2xl font-heading font-bold text-muted-foreground/30">{project.title.charAt(0)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">{project.category}</span>
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2 group-hover:text-gradient transition-colors">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">{tag}</span>
                ))}
              </div>
              <div className="flex gap-3">
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                    <ExternalLink size={14} /> Live
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
                    <Github size={14} /> Code
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
