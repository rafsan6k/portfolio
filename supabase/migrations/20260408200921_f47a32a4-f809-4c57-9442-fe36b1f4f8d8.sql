
INSERT INTO storage.buckets (id, name, public) VALUES ('profile_photos', 'profile_photos', true);

CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile_photos');

CREATE POLICY "Admins can upload profile photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile_photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update profile photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile_photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete profile photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile_photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
