import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code, Brain, Zap, Palette, Globe, Cpu, Sparkles, Rocket, Shield, Database, Terminal, Lightbulb } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ComponentType<any>> = {
  Code, Brain, Zap, Palette, Globe, Cpu, Sparkles, Rocket, Shield, Database, Terminal, Lightbulb,
};

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

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content } = useSiteContent("about");
  
  const photoPath = content?.photo_url;
  const photoUrl = photoPath ? supabase.storage.from("profile_photos").getPublicUrl(photoPath).data.publicUrl : null;

  let parsedCards: AboutCard[] = [];
  try {
    parsedCards = content?.cards ? JSON.parse(content.cards) : defaultCards;
    parsedCards = [...parsedCards].sort((a, b) => a.display_order - b.display_order);
  } catch(e) {
    parsedCards = defaultCards;
  }

  const cards = parsedCards.map(s => ({
    icon: iconMap[s.icon] || Code,
    title: s.title,
    description: s.description,
  }));

  return (
    <section id="about" className="py-24 md:py-32">
      <div ref={ref} className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }} className="relative">
            <div className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center glow-border">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-6xl md:text-7xl font-heading font-bold text-gradient">R</div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.15 }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {(content?.title ?? "About Me").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-gradient">{(content?.title ?? "About Me").split(" ").pop()}</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{content?.paragraph1 ?? ""}</p>
            <p className="text-muted-foreground leading-relaxed">{content?.paragraph2 ?? ""}</p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:glow-border transition-shadow duration-300">
              <card.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
