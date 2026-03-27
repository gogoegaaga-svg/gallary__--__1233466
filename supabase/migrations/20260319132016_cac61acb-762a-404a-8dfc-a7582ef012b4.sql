
-- Create storage bucket for product and customer images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-images', 'customer-images', true);

-- Public read access for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admin upload/update/delete for product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Public read access for customer images
CREATE POLICY "Anyone can view customer images"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-images');

-- Admin upload/update/delete for customer images
CREATE POLICY "Admins can upload customer images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update customer images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'customer-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customer images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'customer-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Add image_url column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS image_url text;
