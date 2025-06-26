import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useReportPeriods } from "@/hooks/useReportPeriods";
import { useIndicators } from "@/hooks/useIndicators";
import { useAuth } from "@/hooks/useAuth";
import { Plus, BarChart3 } from "lucide-react";

interface IndicatorReportSelectorProps {
  onReportCreated: () => void;
  existingReports: any[];
}

export function IndicatorReportSelector({ onReportCreated, existingReports }: IndicatorReportSelectorProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchReportPeriods } = useReportPeriods();
  const { createIndicatorReport } = useIndicators();

  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchReportPeriods();
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los períodos",
          variant: "destructive",
        });
      } else {
        // Filtrar períodos activos y validar que tengan ID válido
        const activePeriods = (data || []).filter(period => 
          period.is_active && 
          new Date(period.end_date) >= new Date() &&
          period.id && 
          typeof period.id === 'string' && 
          period.id.trim().length > 0
        );
        setPeriods(activePeriods);
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!profile?.id || !selectedPeriod) return;

    // Verificar si ya existe un informe para este período
    const existingReport = existingReports.find(
      report => report.report_period_id === selectedPeriod
    );

    if (existingReport) {
      toast({
        title: "Informe ya existe",
        description: "Ya tienes un informe de indicadores para este período",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const selectedPeriodData = periods.find(p => p.id === selectedPeriod);
      
      const reportData = {
        manager_id: profile.id,
        report_period_id: selectedPeriod,
        title: `Informe de Indicadores - ${selectedPeriodData?.name}`,
        description: `Informe de indicadores para el período ${selectedPeriodData?.name}`,
        status: 'draft'
      };

      const result = await createIndicatorReport(reportData);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: "Informe de indicadores creado correctamente",
      });

      onReportCreated();
      setSelectedPeriod("");
    } catch (error) {
      console.error('Error creating indicator report:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el informe de indicadores",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando períodos...</p>
        </CardContent>
      </Card>
    );
  }

  if (periods.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay períodos activos para crear informes de indicadores</p>
        </CardContent>
      </Card>
    );
  }

  // Filter periods to ensure only valid ones are used for SelectItems
  const validPeriods = periods.filter(period => 
    period.id && 
    typeof period.id === 'string' && 
    period.id.trim().length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Crear Nuevo Informe de Indicadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Seleccionar Período de Reporte
            </label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                {validPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name} ({new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateReport}
            disabled={!selectedPeriod || creating}
            className="w-full institutional-gradient text-white"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Crear Informe de Indicadores
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
