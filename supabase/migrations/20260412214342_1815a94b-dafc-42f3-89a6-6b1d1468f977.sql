-- Make category_id nullable
ALTER TABLE public.collection_items ALTER COLUMN category_id DROP NOT NULL;

-- Drop the existing restrictive foreign key
ALTER TABLE public.collection_items DROP CONSTRAINT collection_items_category_id_fkey;

-- Re-add with SET NULL on delete
ALTER TABLE public.collection_items
  ADD CONSTRAINT collection_items_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id)
  ON DELETE SET NULL;