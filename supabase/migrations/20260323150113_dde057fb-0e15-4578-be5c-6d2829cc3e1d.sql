DROP POLICY IF EXISTS "Anyone can view customer images" ON storage.objects;

CREATE POLICY "Admins can view customer images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);