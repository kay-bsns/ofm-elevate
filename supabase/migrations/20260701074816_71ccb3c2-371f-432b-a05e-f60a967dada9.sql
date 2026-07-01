
-- Enum: fan status
CREATE TYPE public.fan_status AS ENUM ('lead', 'active', 'vip', 'whale', 'churned');
CREATE TYPE public.interaction_kind AS ENUM ('message_in', 'message_out', 'ppv_sent', 'ppv_purchased', 'tip', 'subscription', 'call', 'note');
CREATE TYPE public.model_status AS ENUM ('onboarding', 'active', 'paused', 'archived');

-- MODELS (creators managed by the agency)
CREATE TABLE public.models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  real_name text,
  avatar_url text,
  bio text,
  niche text,
  onlyfans_url text,
  status public.model_status NOT NULL DEFAULT 'onboarding',
  commission_rate numeric(5,2) NOT NULL DEFAULT 20.00,
  monthly_goal numeric(12,2) DEFAULT 0,
  timezone text DEFAULT 'Europe/Paris',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.models TO authenticated;
GRANT ALL ON public.models TO service_role;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "models_owner_all" ON public.models FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "models_founder_all" ON public.models FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'founder')) WITH CHECK (public.has_role(auth.uid(),'founder'));
CREATE INDEX idx_models_owner ON public.models(owner_id);
CREATE TRIGGER trg_models_updated BEFORE UPDATE ON public.models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FANS (subscribers/leads tied to a model)
CREATE TABLE public.fans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  display_name text,
  avatar_url text,
  country text,
  language text DEFAULT 'en',
  status public.fan_status NOT NULL DEFAULT 'lead',
  lifetime_value numeric(12,2) NOT NULL DEFAULT 0,
  last_purchase_at timestamptz,
  last_message_at timestamptz,
  subscribed_at timestamptz,
  tags text[] NOT NULL DEFAULT '{}',
  ai_summary text,
  ai_persona jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fans TO authenticated;
GRANT ALL ON public.fans TO service_role;
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fans_owner_all" ON public.fans FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "fans_founder_all" ON public.fans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'founder')) WITH CHECK (public.has_role(auth.uid(),'founder'));
CREATE INDEX idx_fans_model ON public.fans(model_id);
CREATE INDEX idx_fans_owner ON public.fans(owner_id);
CREATE INDEX idx_fans_status ON public.fans(status);
CREATE TRIGGER trg_fans_updated BEFORE UPDATE ON public.fans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INTERACTIONS (timeline: messages, tips, ppv, notes)
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id uuid NOT NULL REFERENCES public.fans(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.interaction_kind NOT NULL,
  content text,
  amount numeric(12,2),
  metadata jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interactions TO authenticated;
GRANT ALL ON public.interactions TO service_role;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interactions_owner_all" ON public.interactions FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "interactions_founder_all" ON public.interactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'founder')) WITH CHECK (public.has_role(auth.uid(),'founder'));
CREATE INDEX idx_interactions_fan ON public.interactions(fan_id, occurred_at DESC);
CREATE INDEX idx_interactions_model ON public.interactions(model_id, occurred_at DESC);

-- Aggregate helper: bump fan LTV/last_purchase automatically on paid interactions
CREATE OR REPLACE FUNCTION public.bump_fan_metrics()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.kind IN ('ppv_purchased','tip','subscription') AND NEW.amount IS NOT NULL THEN
    UPDATE public.fans
      SET lifetime_value = lifetime_value + NEW.amount,
          last_purchase_at = GREATEST(COALESCE(last_purchase_at, NEW.occurred_at), NEW.occurred_at)
    WHERE id = NEW.fan_id;
  END IF;
  IF NEW.kind IN ('message_in','message_out') THEN
    UPDATE public.fans SET last_message_at = NEW.occurred_at WHERE id = NEW.fan_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_interactions_bump AFTER INSERT ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.bump_fan_metrics();
