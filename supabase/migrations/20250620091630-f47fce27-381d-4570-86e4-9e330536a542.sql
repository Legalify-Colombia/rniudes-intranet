
-- Eliminar triggers específicos que dependen de las funciones
DROP TRIGGER IF EXISTS trigger_notify_report_update ON manager_reports;
DROP TRIGGER IF EXISTS notify_report_update_trigger ON manager_reports;
DROP TRIGGER IF EXISTS update_total_progress_trigger ON product_progress_reports;
DROP TRIGGER IF EXISTS update_manager_report_progress_trigger ON product_progress_reports;
DROP TRIGGER IF EXISTS trigger_update_total_progress ON product_progress_reports;

-- Ahora eliminar las funciones con CASCADE para eliminar dependencias restantes
DROP FUNCTION IF EXISTS notify_report_update() CASCADE;
DROP FUNCTION IF EXISTS update_total_progress_trigger() CASCADE;
DROP FUNCTION IF EXISTS update_manager_report_progress() CASCADE;
DROP FUNCTION IF EXISTS calculate_total_progress(uuid) CASCADE;

-- Crear una función simple sin recursión
CREATE OR REPLACE FUNCTION simple_update_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo hacer el update sin triggers adicionales
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE manager_reports 
        SET total_progress_percentage = (
            SELECT COALESCE(AVG(progress_percentage), 0)
            FROM product_progress_reports 
            WHERE manager_report_id = NEW.manager_report_id
        )
        WHERE id = NEW.manager_report_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE manager_reports 
        SET total_progress_percentage = (
            SELECT COALESCE(AVG(progress_percentage), 0)
            FROM product_progress_reports 
            WHERE manager_report_id = OLD.manager_report_id
        )
        WHERE id = OLD.manager_report_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear un trigger simple sin recursión
CREATE TRIGGER simple_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_progress_reports
    FOR EACH ROW
    EXECUTE FUNCTION simple_update_progress();
