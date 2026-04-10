
CREATE TABLE public.booking_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking" ON public.booking_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all submissions" ON public.booking_submissions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions" ON public.booking_submissions
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete submissions" ON public.booking_submissions
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_booking_submissions_updated_at
  BEFORE UPDATE ON public.booking_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
