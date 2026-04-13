
-- Create custom field type enum
CREATE TYPE public.custom_field_type AS ENUM ('text', 'number', 'dropdown');

-- Custom field definitions per category
CREATE TABLE public.custom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  field_type public.custom_field_type NOT NULL DEFAULT 'text',
  dropdown_options TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom fields"
  ON public.custom_fields FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom fields"
  ON public.custom_fields FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom fields"
  ON public.custom_fields FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom fields"
  ON public.custom_fields FOR DELETE
  USING (auth.uid() = user_id);

-- Custom field values per item
CREATE TABLE public.custom_field_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.collection_items(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (item_id, field_id)
);

ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own field values"
  ON public.custom_field_values FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.collection_items WHERE id = item_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own field values"
  ON public.custom_field_values FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.collection_items WHERE id = item_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own field values"
  ON public.custom_field_values FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.collection_items WHERE id = item_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own field values"
  ON public.custom_field_values FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.collection_items WHERE id = item_id AND user_id = auth.uid()
  ));

CREATE INDEX idx_custom_fields_category ON public.custom_fields(category_id);
CREATE INDEX idx_custom_field_values_item ON public.custom_field_values(item_id);
CREATE INDEX idx_custom_field_values_field ON public.custom_field_values(field_id);
