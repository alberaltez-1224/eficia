-- Fix providers RLS: allow public read for both pendiente and verificado providers
-- so newly registered providers appear in the marketplace immediately

DROP POLICY IF EXISTS "public_read_verified_providers" ON public.providers;
CREATE POLICY "public_read_verified_providers" ON public.providers
FOR SELECT TO public
USING (status IN ('pendiente'::public.provider_status, 'verificado'::public.provider_status));
