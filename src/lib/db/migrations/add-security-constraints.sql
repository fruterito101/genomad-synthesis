-- ============================================
-- 🛡️ GENOMAD SECURITY CONSTRAINTS
-- Post-Forestcito Hardening
-- ============================================

-- ============================================
-- 1. CHECK CONSTRAINTS para fitness
-- ============================================

-- Fitness debe estar entre 0 y 92 (ceiling)
ALTER TABLE agents 
ADD CONSTRAINT check_fitness_range 
CHECK (fitness >= 0 AND fitness <= 92);

-- ============================================
-- 2. CHECK CONSTRAINTS para traits (JSONB)
-- ============================================

-- Función para validar traits
CREATE OR REPLACE FUNCTION validate_traits(traits JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    trait_names TEXT[] := ARRAY['technical', 'creativity', 'social', 'analysis', 'empathy', 'trading', 'teaching', 'leadership'];
    trait_name TEXT;
    trait_value NUMERIC;
    trait_sum NUMERIC := 0;
    trait_count INT := 0;
BEGIN
    -- Verificar que traits no sea NULL
    IF traits IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar cada trait requerido
    FOREACH trait_name IN ARRAY trait_names LOOP
        -- Verificar que el trait existe
        IF NOT (traits ? trait_name) THEN
            RETURN FALSE;
        END IF;
        
        -- Obtener valor
        trait_value := (traits->>trait_name)::NUMERIC;
        
        -- Verificar rango 0-100
        IF trait_value IS NULL OR trait_value < 0 OR trait_value > 100 THEN
            RETURN FALSE;
        END IF;
        
        trait_sum := trait_sum + trait_value;
        trait_count := trait_count + 1;
    END LOOP;
    
    -- Verificar que el promedio no sea sospechosamente alto (>90)
    IF (trait_sum / trait_count) > 90 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Aplicar constraint de traits
ALTER TABLE agents
ADD CONSTRAINT check_traits_valid
CHECK (validate_traits(traits));

-- ============================================
-- 3. ÍNDICES para performance
-- ============================================

-- Índice para agentes sospechosos
CREATE INDEX IF NOT EXISTS idx_agents_suspicious 
ON agents(is_suspicious) 
WHERE is_suspicious = true;

-- Índice para fitness (para rankings)
CREATE INDEX IF NOT EXISTS idx_agents_fitness 
ON agents(fitness DESC);

-- Índice compuesto para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_agents_active_fitness 
ON agents(is_active, fitness DESC) 
WHERE is_suspicious = false;

-- ============================================
-- 4. TRIGGER para validación automática
-- ============================================

-- Función trigger para validar antes de INSERT/UPDATE
CREATE OR REPLACE FUNCTION validate_agent_before_save()
RETURNS TRIGGER AS $$
DECLARE
    trait_values NUMERIC[];
    avg_trait NUMERIC;
    extreme_count INT;
BEGIN
    -- 1. Validar fitness
    IF NEW.fitness > 92 THEN
        RAISE EXCEPTION 'Fitness % exceeds maximum allowed (92)', NEW.fitness
            USING ERRCODE = 'check_violation';
    END IF;
    
    IF NEW.fitness < 0 THEN
        RAISE EXCEPTION 'Fitness cannot be negative'
            USING ERRCODE = 'check_violation';
    END IF;
    
    -- 2. Extraer valores de traits
    SELECT ARRAY[
        (NEW.traits->>'technical')::NUMERIC,
        (NEW.traits->>'creativity')::NUMERIC,
        (NEW.traits->>'social')::NUMERIC,
        (NEW.traits->>'analysis')::NUMERIC,
        (NEW.traits->>'empathy')::NUMERIC,
        (NEW.traits->>'trading')::NUMERIC,
        (NEW.traits->>'teaching')::NUMERIC,
        (NEW.traits->>'leadership')::NUMERIC
    ] INTO trait_values;
    
    -- 3. Verificar que ningún trait sea NULL
    IF array_position(trait_values, NULL) IS NOT NULL THEN
        RAISE EXCEPTION 'All 8 traits are required'
            USING ERRCODE = 'check_violation';
    END IF;
    
    -- 4. Verificar rango de cada trait (0-100)
    FOR i IN 1..8 LOOP
        IF trait_values[i] < 0 OR trait_values[i] > 100 THEN
            RAISE EXCEPTION 'Trait value % is out of range (0-100)', trait_values[i]
                USING ERRCODE = 'check_violation';
        END IF;
    END LOOP;
    
    -- 5. Calcular promedio
    SELECT AVG(unnest) INTO avg_trait FROM unnest(trait_values);
    
    -- 6. Bloquear si promedio > 90
    IF avg_trait > 90 THEN
        NEW.is_suspicious := true;
        NEW.suspicious_reason := format('Auto-flagged: trait average %.1f > 90', avg_trait);
        NEW.flagged_at := NOW();
        RAISE WARNING 'Agent % flagged as suspicious: avg trait %.1f', NEW.name, avg_trait;
    END IF;
    
    -- 7. Contar traits extremos (>95)
    SELECT COUNT(*) INTO extreme_count 
    FROM unnest(trait_values) v 
    WHERE v > 95;
    
    -- 8. Bloquear si 4+ traits extremos
    IF extreme_count >= 4 THEN
        NEW.is_suspicious := true;
        NEW.suspicious_reason := format('Auto-flagged: %s traits > 95', extreme_count);
        NEW.flagged_at := NOW();
        RAISE WARNING 'Agent % flagged as suspicious: % extreme traits', NEW.name, extreme_count;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_validate_agent ON agents;
CREATE TRIGGER trigger_validate_agent
    BEFORE INSERT OR UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION validate_agent_before_save();

-- ============================================
-- 5. TABLA DE AUDITORÍA
-- ============================================

CREATE TABLE IF NOT EXISTS agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'FLAG', 'REVIEW'
    old_data JSONB,
    new_data JSONB,
    changed_by UUID, -- User ID si está disponible
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_agent ON agent_audit_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON agent_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_time ON agent_audit_log(changed_at DESC);

-- Trigger de auditoría
CREATE OR REPLACE FUNCTION audit_agent_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO agent_audit_log (agent_id, action, new_data)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO agent_audit_log (agent_id, action, old_data, new_data)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO agent_audit_log (agent_id, action, old_data)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_agents ON agents;
CREATE TRIGGER trigger_audit_agents
    AFTER INSERT OR UPDATE OR DELETE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION audit_agent_changes();

-- ============================================
-- 6. VISTAS ÚTILES
-- ============================================

-- Vista de agentes sospechosos pendientes de revisión
CREATE OR REPLACE VIEW v_suspicious_pending AS
SELECT 
    a.id,
    a.name,
    a.fitness,
    a.traits,
    a.suspicious_reason,
    a.flagged_at,
    a.created_at,
    u.telegram_username as owner_telegram,
    u.wallet_address as owner_wallet
FROM agents a
LEFT JOIN users u ON a.owner_id = u.id
WHERE a.is_suspicious = true 
  AND a.reviewed_at IS NULL
ORDER BY a.flagged_at DESC;

-- Vista de estadísticas de seguridad
CREATE OR REPLACE VIEW v_security_stats AS
SELECT
    COUNT(*) FILTER (WHERE is_suspicious = false) as healthy_agents,
    COUNT(*) FILTER (WHERE is_suspicious = true) as suspicious_agents,
    COUNT(*) FILTER (WHERE is_suspicious = true AND reviewed_at IS NULL) as pending_review,
    COUNT(*) FILTER (WHERE is_suspicious = true AND reviewed_at IS NOT NULL) as reviewed,
    AVG(fitness) FILTER (WHERE is_suspicious = false) as avg_healthy_fitness,
    MAX(fitness) as max_fitness,
    MIN(fitness) as min_fitness
FROM agents;

-- ============================================
-- 7. FUNCIONES DE ADMINISTRACIÓN
-- ============================================

-- Función para revisar un agente sospechoso
CREATE OR REPLACE FUNCTION review_suspicious_agent(
    p_agent_id UUID,
    p_reviewer_id UUID,
    p_approved BOOLEAN,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE agents
    SET 
        is_suspicious = CASE WHEN p_approved THEN false ELSE true END,
        reviewed_at = NOW(),
        reviewed_by = p_reviewer_id,
        suspicious_reason = CASE 
            WHEN p_approved THEN NULL 
            ELSE COALESCE(suspicious_reason, '') || ' | Reviewed: ' || COALESCE(p_notes, 'Rejected')
        END
    WHERE id = p_agent_id;
    
    -- Log the review
    INSERT INTO agent_audit_log (agent_id, action, changed_by, reason)
    VALUES (p_agent_id, 'REVIEW', p_reviewer_id, 
            CASE WHEN p_approved THEN 'APPROVED' ELSE 'REJECTED' END || ': ' || COALESCE(p_notes, ''));
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el historial de un agente
CREATE OR REPLACE FUNCTION get_agent_history(p_agent_id UUID)
RETURNS TABLE (
    action TEXT,
    changed_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    old_fitness NUMERIC,
    new_fitness NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.action,
        l.changed_at,
        l.reason,
        (l.old_data->>'fitness')::NUMERIC,
        (l.new_data->>'fitness')::NUMERIC
    FROM agent_audit_log l
    WHERE l.agent_id = p_agent_id
    ORDER BY l.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================

COMMENT ON TABLE agents IS 'Agentes registrados con validaciones de seguridad post-Forestcito';
COMMENT ON COLUMN agents.is_suspicious IS 'Flag automático o manual para agentes sospechosos';
COMMENT ON COLUMN agents.fitness IS 'Fitness score (0-92 max, enforced by constraint)';
COMMENT ON TABLE agent_audit_log IS 'Log de auditoría para todos los cambios en agentes';
