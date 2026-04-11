-- Specializations table (about section cards)
CREATE TABLE public.specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Code',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view specializations" ON public.specializations FOR SELECT USING (true);
CREATE POLICY "Admins can manage specializations" ON public.specializations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_specializations_updated_at BEFORE UPDATE ON public.specializations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
