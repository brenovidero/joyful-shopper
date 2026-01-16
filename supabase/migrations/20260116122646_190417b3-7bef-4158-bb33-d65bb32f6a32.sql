-- Remover a view insegura que expõe dados de localização
DROP VIEW IF EXISTS public.cardio_sessions_safe;

-- Recriar a view COM security_invoker para herdar as políticas RLS da tabela base
-- Também removemos os dados de localização sensíveis desta view "safe"
CREATE VIEW public.cardio_sessions_safe
WITH (security_invoker = on)
AS SELECT 
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
    xp_earned,
    notes
    -- Dados de localização REMOVIDOS propositalmente:
    -- route_start_lat, route_start_lng, route_end_lat, route_end_lng, route_polyline
FROM public.cardio_sessions;