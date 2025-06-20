
-- Eliminar triggers que pueden estar causando recursión infinita
DROP TRIGGER IF EXISTS notify_report_update_trigger ON manager_reports;
DROP TRIGGER IF EXISTS update_total_progress_trigger ON product_progress_reports;

-- Recrear el trigger de actualización de progreso de manera más simple
CREATE OR REPLACE FUNCTION update_manager_report_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actualizar el porcentaje de progreso, sin crear notificaciones desde aquí
    UPDATE manager_reports 
    SET 
        total_progress_percentage = (
            SELECT COALESCE(AVG(ppr.progress_percentage), 0)
            FROM product_progress_reports ppr
            WHERE ppr.manager_report_id = CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.manager_report_id
                ELSE NEW.manager_report_id
            END
        ),
        updated_at = now()
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.manager_report_id
        ELSE NEW.manager_report_id
    END;
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger simplificado
CREATE TRIGGER update_manager_report_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_progress_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_manager_report_progress();
