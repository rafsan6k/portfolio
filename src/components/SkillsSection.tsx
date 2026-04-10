import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useSkills, useSiteContent } from "@/hooks/useSiteContent";

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content } = useSiteContent("skills");
  const { data: skills } = useSkills();

  const categories = [...new Set(skills?.map(s => s.category) ?? [])];

  return (
    <section id="skills" className="py-24 md:py-32 bg-card/30">
      <div ref={ref} className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {(content?.title ?? "Skills & Tools").replace(/(\S+)$/, "")}
            <span className="text-gradient">{(content?.title ?? "Skills & Tools").split(" ").pop()}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{content?.subtitle ?? ""}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, ci) => (
            <motion.div key={cat} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: ci * 0.1 }}>
              <h3 className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">{cat}</h3>
              <div className="flex flex-wrap gap-2">
                {skills?.filter(s => s.category === cat).map((skill) => (
                  <span key={skill.id} className="px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground border border-border hover:border-primary/50 transition-colors cursor-default">
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
