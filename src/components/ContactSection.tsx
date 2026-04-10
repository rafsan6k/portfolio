import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Github, Linkedin, Twitter, Link as LinkIcon, MapPin, Phone } from "lucide-react";
import { useSocialLinks, useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = { Mail, Github, Linkedin, Twitter, Link: LinkIcon, Phone, MapPin };

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content } = useSiteContent("contact");
  const { data: links } = useSocialLinks();

  const photoUrl = content?.photo_url;
  const fullPhotoUrl = photoUrl
    ? `${supabase.storage.from("profile_photos").getPublicUrl(photoUrl).data.publicUrl}`
    : null;

  return (
    <section id="contact" className="py-24 md:py-32">
      <div ref={ref} className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {(content?.title ?? "Get in Touch").replace(/(\S+)$/, "")}
            <span className="text-gradient">{(content?.title ?? "Get in Touch").split(" ").pop()}</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">{content?.subtitle ?? ""}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              {fullPhotoUrl && (
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30 shrink-0 glow-primary">
                  <img src={fullPhotoUrl} alt={content?.name ?? "Rafsan"} className="w-full h-full object-cover" />
                </div>
              )}
              <div className={fullPhotoUrl ? "text-center sm:text-left" : "text-center w-full"}>
                <h3 className="text-2xl font-heading font-bold">{content?.name ?? "Rafsan"}</h3>
                <p className="text-primary text-sm font-medium">{content?.role ?? "Web Developer & AI Specialist"}</p>
                {content?.bio && <p className="text-muted-foreground text-sm mt-2 max-w-md">{content.bio}</p>}
              </div>
            </div>

            {/* Contact details */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {content?.email && (
                <a href={`mailto:${content.email}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-colors">
                  <Mail size={18} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground truncate">{content.email}</span>
                </a>
              )}
              {content?.phone && (
                <a href={`tel:${content.phone}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-colors">
                  <Phone size={18} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground">{content.phone}</span>
                </a>
              )}
              {content?.location && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border">
                  <MapPin size={18} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground">{content.location}</span>
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="flex justify-center gap-4 flex-wrap">
              {links?.map((link) => {
                const Icon = iconMap[link.icon] ?? LinkIcon;
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary border border-border hover:glow-border hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium">
                    <Icon size={18} className="text-primary" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
