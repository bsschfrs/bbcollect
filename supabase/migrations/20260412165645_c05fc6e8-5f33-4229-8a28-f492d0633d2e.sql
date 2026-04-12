
CREATE TYPE public.item_condition AS ENUM ('mint', 'near_mint', 'good', 'fair', 'poor');
CREATE TYPE public.item_status AS ENUM ('collection', 'wishlist');
CREATE TYPE public.wishlist_priority AS ENUM ('low', 'medium', 'high');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📦',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  image_url TEXT,
  purchase_price NUMERIC(10,2),
  purchase_date DATE,
  condition item_condition,
  notes TEXT,
  status item_status NOT NULL DEFAULT 'collection',
  priority wishlist_priority,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own items" ON public.collection_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own items" ON public.collection_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON public.collection_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON public.collection_items FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_collection_items_updated_at BEFORE UPDATE ON public.collection_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_collection_items_user ON public.collection_items(user_id);
CREATE INDEX idx_collection_items_category ON public.collection_items(category_id);
CREATE INDEX idx_collection_items_status ON public.collection_items(status);

INSERT INTO storage.buckets (id, name, public) VALUES ('collection-images', 'collection-images', true);
CREATE POLICY "Users can view collection images" ON storage.objects FOR SELECT USING (bucket_id = 'collection-images');
CREATE POLICY "Users can upload collection images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collection-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their collection images" ON storage.objects FOR UPDATE USING (bucket_id = 'collection-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their collection images" ON storage.objects FOR DELETE USING (bucket_id = 'collection-images' AND auth.uid()::text = (storage.foldername(name))[1]);
