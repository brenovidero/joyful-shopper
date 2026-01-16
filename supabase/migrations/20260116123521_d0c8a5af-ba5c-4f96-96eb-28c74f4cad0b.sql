-- Drop existing policy that allows full profile access to friends and community members
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create more restrictive policy: only user themselves or admins can see full profile data
-- Friends and community members must use the public_profiles view for basic data
CREATE POLICY "Only owner and admins can view full profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- User can always see their own full profile
    id = auth.uid()
    -- Admins can see all profiles
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);