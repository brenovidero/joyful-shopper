-- Add location privacy function to automatically fuzzy GPS coordinates (200m radius)
CREATE OR REPLACE FUNCTION public.fuzzy_location(lat double precision, lng double precision)
RETURNS TABLE(fuzzy_lat double precision, fuzzy_lng double precision)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  -- Add random offset within ~200m radius
  -- 0.0018 degrees ≈ 200m at equator
  offset_lat double precision;
  offset_lng double precision;
BEGIN
  IF lat IS NULL OR lng IS NULL THEN
    RETURN QUERY SELECT NULL::double precision, NULL::double precision;
  ELSE
    -- Generate random offset between -0.0018 and +0.0018 degrees
    offset_lat := (random() - 0.5) * 0.0036;
    offset_lng := (random() - 0.5) * 0.0036;
    
    RETURN QUERY SELECT 
      lat + offset_lat,
      lng + offset_lng;
  END IF;
END;
$$;

-- Create a view that only exposes fuzzy locations for routes older than 24 hours
CREATE OR REPLACE VIEW public.cardio_sessions_safe AS
SELECT 
  id,
  user_id,
  cardio_type,
  started_at,
  ended_at,
  duration_minutes,
  distance_meters,
  calories_burned,
  avg_heart_rate,
  max_heart_rate,
  avg_speed_kmh,
  max_speed_kmh,
  steps_count,
  notes,
  xp_earned,
  -- Only show fuzzy coordinates for routes older than 24 hours
  CASE 
    WHEN started_at < NOW() - INTERVAL '24 hours' THEN 
      (SELECT fuzzy_lat FROM public.fuzzy_location(route_start_lat, route_start_lng))
    ELSE NULL
  END as route_start_lat,
  CASE 
    WHEN started_at < NOW() - INTERVAL '24 hours' THEN 
      (SELECT fuzzy_lng FROM public.fuzzy_location(route_start_lat, route_start_lng))
    ELSE NULL
  END as route_start_lng,
  CASE 
    WHEN started_at < NOW() - INTERVAL '24 hours' THEN 
      (SELECT fuzzy_lat FROM public.fuzzy_location(route_end_lat, route_end_lng))
    ELSE NULL
  END as route_end_lat,
  CASE 
    WHEN started_at < NOW() - INTERVAL '24 hours' THEN 
      (SELECT fuzzy_lng FROM public.fuzzy_location(route_end_lat, route_end_lng))
    ELSE NULL
  END as route_end_lng,
  -- Never expose raw polyline - it reveals exact route
  NULL::text as route_polyline
FROM public.cardio_sessions;

-- Add RLS to the view (views inherit table's RLS but we enforce explicitly)
ALTER VIEW public.cardio_sessions_safe SET (security_invoker = on);

-- Drop existing policies on cardio_sessions to tighten access
DROP POLICY IF EXISTS "Users can view own cardio sessions" ON public.cardio_sessions;
DROP POLICY IF EXISTS "Users can insert own cardio sessions" ON public.cardio_sessions;
DROP POLICY IF EXISTS "Users can update own cardio sessions" ON public.cardio_sessions;
DROP POLICY IF EXISTS "Users can delete own cardio sessions" ON public.cardio_sessions;

-- Recreate policies - ONLY owner can access raw data (for their own tracking)
CREATE POLICY "Users can view own cardio sessions"
ON public.cardio_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cardio sessions"
ON public.cardio_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cardio sessions"
ON public.cardio_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cardio sessions"
ON public.cardio_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Add a comment documenting the privacy protection
COMMENT ON VIEW public.cardio_sessions_safe IS 'Privacy-protected view of cardio sessions. Fuzzes GPS coordinates by ~200m and delays location publication by 24 hours to prevent revealing home addresses and daily routines.';