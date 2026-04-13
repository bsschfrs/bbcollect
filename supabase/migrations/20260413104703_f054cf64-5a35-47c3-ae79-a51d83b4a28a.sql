ALTER TABLE public.collection_items
  ADD COLUMN url text,
  ADD COLUMN estimated_value numeric,
  ADD COLUMN value_updated_at date;