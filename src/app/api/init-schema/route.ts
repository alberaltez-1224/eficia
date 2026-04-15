import { NextResponse } from 'next/server';
import { Client } from 'pg';

// Full Eficia schema SQL — idempotent, safe to run multiple times
const SCHEMA_SQL = `
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('cliente', 'proveedor', 'admin');

DROP TYPE IF EXISTS public.lead_status CASCADE;
CREATE TYPE public.lead_status AS ENUM ('nuevo', 'en_proceso', 'respondido', 'cerrado', 'cancelado');

DROP TYPE IF EXISTS public.provider_status CASCADE;
CREATE TYPE public.provider_status AS ENUM ('pendiente', 'verificado', 'rechazado', 'suspendido');

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'cliente'::public.user_role,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  cif TEXT NOT NULL UNIQUE,
  contact_name TEXT NOT NULL,
  phone TEXT,
  employees TEXT,
  sector TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  cif TEXT NOT NULL UNIQUE,
  contact_name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  description TEXT,
  service_zones TEXT,
  client_type TEXT,
  estimated_savings TEXT,
  logo_url TEXT,
  status public.provider_status NOT NULL DEFAULT 'pendiente'::public.provider_status,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  employees TEXT,
  annual_spend NUMERIC,
  estimated_saving_min NUMERIC,
  estimated_saving_max NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  message TEXT,
  status public.lead_status NOT NULL DEFAULT 'nuevo'::public.lead_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers(status);
CREATE INDEX IF NOT EXISTS idx_provider_categories_provider ON public.provider_categories(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_categories_category ON public.provider_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_provider_id ON public.leads(provider_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_savings_company_id ON public.savings(company_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')::public.user_role
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users WHERE id = auth.uid()
  AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
) $$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT role::TEXT FROM public.user_profiles WHERE id = auth.uid() LIMIT 1 $$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "admin_manage_all_profiles" ON public.user_profiles;
CREATE POLICY "admin_manage_all_profiles" ON public.user_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "admin_manage_categories" ON public.categories;
CREATE POLICY "admin_manage_categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_manage_own_company" ON public.companies;
CREATE POLICY "users_manage_own_company" ON public.companies FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "admin_manage_all_companies" ON public.companies;
CREATE POLICY "admin_manage_all_companies" ON public.companies FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_verified_providers" ON public.providers;
CREATE POLICY "public_read_verified_providers" ON public.providers FOR SELECT TO public USING (status IN ('pendiente'::public.provider_status, 'verificado'::public.provider_status));
DROP POLICY IF EXISTS "providers_manage_own" ON public.providers;
CREATE POLICY "providers_manage_own" ON public.providers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "admin_manage_all_providers" ON public.providers;
CREATE POLICY "admin_manage_all_providers" ON public.providers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_provider_categories" ON public.provider_categories;
CREATE POLICY "public_read_provider_categories" ON public.provider_categories FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "providers_manage_own_categories" ON public.provider_categories;
CREATE POLICY "providers_manage_own_categories" ON public.provider_categories FOR ALL TO authenticated USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())) WITH CHECK (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "admin_manage_provider_categories" ON public.provider_categories;
CREATE POLICY "admin_manage_provider_categories" ON public.provider_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "clients_manage_own_savings" ON public.savings;
CREATE POLICY "clients_manage_own_savings" ON public.savings FOR ALL TO authenticated USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())) WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "admin_manage_all_savings" ON public.savings;
CREATE POLICY "admin_manage_all_savings" ON public.savings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "clients_manage_own_leads" ON public.leads;
CREATE POLICY "clients_manage_own_leads" ON public.leads FOR ALL TO authenticated USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())) WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "providers_view_own_leads" ON public.leads;
CREATE POLICY "providers_view_own_leads" ON public.leads FOR SELECT TO authenticated USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "providers_update_own_leads" ON public.leads;
CREATE POLICY "providers_update_own_leads" ON public.leads FOR UPDATE TO authenticated USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())) WITH CHECK (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "admin_manage_all_leads" ON public.leads;
CREATE POLICY "admin_manage_all_leads" ON public.leads FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "clients_manage_own_reviews" ON public.reviews;
CREATE POLICY "clients_manage_own_reviews" ON public.reviews FOR ALL TO authenticated USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())) WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "admin_manage_all_reviews" ON public.reviews;
CREATE POLICY "admin_manage_all_reviews" ON public.reviews FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP TRIGGER IF EXISTS on_companies_updated ON public.companies;
CREATE TRIGGER on_companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS on_providers_updated ON public.providers;
CREATE TRIGGER on_providers_updated BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS on_leads_updated ON public.leads;
CREATE TRIGGER on_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.categories (id, name, slug, icon, description, sort_order) VALUES
  (gen_random_uuid(), 'Informática',        'informatica',        '💻', 'Equipos, software y servicios tecnológicos', 1),
  (gen_random_uuid(), 'Bienestar',          'bienestar',          '❤️', 'Salud, seguros y beneficios para empleados', 2),
  (gen_random_uuid(), 'Mobiliario',         'mobiliario',         '🪑', 'Mobiliario de oficina y equipamiento', 3),
  (gen_random_uuid(), 'Energía',            'energia',            '⚡', 'Electricidad, gas y eficiencia energética', 4),
  (gen_random_uuid(), 'Limpieza',           'limpieza',           '✨', 'Servicios de limpieza y mantenimiento', 5),
  (gen_random_uuid(), 'Telecomunicaciones', 'telecomunicaciones', '📱', 'Telefonía, internet y comunicaciones', 6),
  (gen_random_uuid(), 'Logística',          'logistica',          '🚛', 'Transporte, mensajería y almacenamiento', 7),
  (gen_random_uuid(), 'Alimentación',       'alimentacion',       '🍽️', 'Catering, vending y suministros de alimentación para empresas', 8)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  admin_uuid    UUID := gen_random_uuid();
  client_uuid   UUID := gen_random_uuid();
  provider_uuid UUID := gen_random_uuid();
  company_uuid  UUID := gen_random_uuid();
  prov_rec_uuid UUID := gen_random_uuid();
  cat_info_id   UUID;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@eficia.es', crypt('Admin2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Admin Eficia', 'role', 'admin'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (client_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'cliente@acmecorp.es', crypt('Eficia2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Ana Martinez', 'role', 'cliente'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (provider_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'hola@vasyco.com', crypt('Eficia2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Carlos Ruiz', 'role', 'proveedor'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.companies (id, user_id, company_name, cif, contact_name, phone, employees, sector, location)
  VALUES (company_uuid, client_uuid, 'Acme Corporation S.L.', 'B12345678', 'Ana Martinez', '+34 91 234 56 78', '26-50', 'Tecnología', 'Madrid')
  ON CONFLICT (cif) DO NOTHING;

  INSERT INTO public.providers (id, user_id, company_name, cif, contact_name, phone, website, description, service_zones, client_type, estimated_savings, status, is_featured)
  VALUES (prov_rec_uuid, provider_uuid, 'Vasyco S.L.', 'B87654321', 'Carlos Ruiz', '+34 91 987 65 43', 'https://vasyco.com',
    'Especialistas en equipos informaticos reacondicionados certificados. Reducimos el gasto tecnologico de las empresas entre un 30% y 60% sin perder rendimiento.',
    'Madrid, Barcelona, Nacional', 'Pymes (11-100)', '30% - 60%', 'verificado'::public.provider_status, true)
  ON CONFLICT (cif) DO NOTHING;

  SELECT id INTO cat_info_id FROM public.categories WHERE slug = 'informatica' LIMIT 1;
  IF cat_info_id IS NOT NULL THEN
    INSERT INTO public.provider_categories (provider_id, category_id) VALUES (prov_rec_uuid, cat_info_id) ON CONFLICT (provider_id, category_id) DO NOTHING;
    INSERT INTO public.leads (company_id, provider_id, category_id, message, status)
    VALUES (company_uuid, prov_rec_uuid, cat_info_id, 'Nos interesa conocer vuestra propuesta para renovar el parque informatico de nuestra empresa.', 'nuevo'::public.lead_status)
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.savings (company_id, category_id, employees, annual_spend, estimated_saving_min, estimated_saving_max, notes)
    VALUES (company_uuid, cat_info_id, '26-50', 20000, 6000, 12000, 'Analisis de informatica - equipos y software')
    ON CONFLICT (id) DO NOTHING;
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Seed data error (non-fatal): %', SQLERRM;
END $$;
`;

function buildConnectionString(): string | null {
  // Try explicit DB URL first
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (dbUrl) return dbUrl;

  // Build from Supabase URL + password
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (!supabaseUrl || !dbPassword) return null;

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;

  // Supabase direct connection (port 5432) — use pooler (port 6543) for serverless
  return `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`;
}

export async function POST() {
  const connectionString = buildConnectionString();

  if (!connectionString) {
    return NextResponse.json(
      {
        error: 'Database connection not configured.',
        hint: 'Add SUPABASE_DB_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres to your .env file. Find the password at: Supabase Dashboard → Project Settings → Database → Connection string',
        envVarsNeeded: ['SUPABASE_DB_URL'],
      },
      { status: 500 }
    );
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
    statement_timeout: 60000,
  });

  try {
    await client.connect();
    await client.query(SCHEMA_SQL);
    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Eficia schema applied successfully',
      tables: ['user_profiles', 'categories', 'companies', 'providers', 'provider_categories', 'savings', 'leads', 'reviews'],
      seedUsers: [
        { email: 'admin@eficia.es', password: 'Admin2026!', role: 'admin' },
        { email: 'cliente@acmecorp.es', password: 'Eficia2026!', role: 'cliente' },
        { email: 'hola@vasyco.com', password: 'Eficia2026!', role: 'proveedor' },
      ],
    });
  } catch (err: unknown) {
    try { await client.end(); } catch { /* ignore */ }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Schema push failed: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Schema init endpoint ready',
    usage: 'POST /api/init-schema to apply the full Eficia schema',
    requiredEnv: 'SUPABASE_DB_URL or (SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL)',
  });
}
