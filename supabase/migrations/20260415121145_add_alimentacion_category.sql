-- Add Alimentación category
INSERT INTO public.categories (id, name, slug, icon, description, sort_order)
VALUES (
  gen_random_uuid(),
  'Alimentación',
  'alimentacion',
  '🍽️',
  'Catering, vending y suministros de alimentación para empresas',
  8
)
ON CONFLICT (slug) DO NOTHING;
