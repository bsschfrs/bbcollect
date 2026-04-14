
-- Rename display_name to username
ALTER TABLE public.profiles RENAME COLUMN display_name TO username;

-- Add unique constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Function to check username availability (callable from client)
CREATE OR REPLACE FUNCTION public.check_username_available(desired_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(username) = lower(desired_username)
  );
$$;
