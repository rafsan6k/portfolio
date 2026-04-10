import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BookingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content } = useSiteContent("booking");
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const services = (content?.services ?? "Web Development,Prompt Engineering,AI Automation,Consultation,Other").split(",");
  const whatsappNumber = content?.whatsapp_number ?? "1234567890";
  const whatsappMessage = encodeURIComponent(content?.whatsapp_message ?? "Hi Rafsan, I'd like to discuss a project!");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("booking_submissions").insert({
      name: form.name,
      email: form.email,
      service: form.service,
      message: form.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success("Thanks! Your request has been submitted.");
    setForm({ name: "", email: "", service: "", message: "" });
  };

  return (
    <section id="booking" className="py-24 md:py-32 bg-card/30">
      <div ref={ref} className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {(content?.title ?? "Let's Work Together").replace(/(\S+)$/, "")}
            <span className="text-gradient">{(content?.title ?? "Let's Work Together").split(" ").pop()}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{content?.subtitle ?? ""}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }} className="space-y-5">
            <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="" disabled>Service Interested In</option>
              {services.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <textarea placeholder="Tell me about your project..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4}
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            <button type="submit" disabled={submitting} className="w-full px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity glow-primary flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {submitting ? "Sending..." : "Send Request"}
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col justify-center items-center text-center gap-6">
            <div className="p-8 rounded-xl bg-card border border-border w-full">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Prefer WhatsApp?</h3>
              <p className="text-sm text-muted-foreground mb-6">Skip the form — let's chat directly. Tap below to start a conversation.</p>
              <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(142,70%,45%)] text-[hsl(0,0%,100%)] font-medium hover:opacity-90 transition-opacity">
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
