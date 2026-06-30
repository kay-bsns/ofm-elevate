
-- 1. Allow founders to manage user_roles
CREATE POLICY "Founders can view all user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founders can insert user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founders can delete user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

-- 2. Allow founders to view all profiles (needed to render the admin list)
CREATE POLICY "Founders can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

-- 3. Role change history
CREATE TYPE public.role_change_action AS ENUM ('granted', 'revoked');

CREATE TABLE public.role_change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  role app_role NOT NULL,
  action role_change_action NOT NULL,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX role_change_logs_target_user_idx ON public.role_change_logs(target_user_id, created_at DESC);
CREATE INDEX role_change_logs_created_at_idx ON public.role_change_logs(created_at DESC);

GRANT SELECT, INSERT ON public.role_change_logs TO authenticated;
GRANT ALL ON public.role_change_logs TO service_role;

ALTER TABLE public.role_change_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can view role logs"
  ON public.role_change_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'founder'));

-- 4. Trigger to record every change
CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_logs (target_user_id, role, action, changed_by)
    VALUES (NEW.user_id, NEW.role, 'granted', auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_change_logs (target_user_id, role, action, changed_by)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_user_role_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER user_roles_change_log
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_user_role_change();
