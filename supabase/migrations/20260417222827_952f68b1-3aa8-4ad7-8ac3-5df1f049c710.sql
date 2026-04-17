DROP POLICY IF EXISTS "Users can view collection images" ON storage.objects;

CREATE POLICY "Users can view their own collection images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'collection-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );