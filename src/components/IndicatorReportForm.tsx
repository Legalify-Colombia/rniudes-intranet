
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save, Send, FileText } from "lucide-react";
import { Indicator, IndicatorReport, IndicatorResponse } from "@/types";

interface IndicatorReportFormProps {
  reportId?: string;
  reportPeriodId?: string;
  onSave: () => void;
}

export function IndicatorReportForm({ reportId, reportPeriodId, onSave }: IndicatorReportFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { fetchIndicators, fetchIndicatorReport, updateIndicatorReport, submitIndicatorReport } = useSupabaseData();

  const [report, setReport] = useState<IndicatorReport | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [responses, setResponses] = useState<Record<string, IndicatorResponse>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [reportId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [indicatorsResult, reportResult] = await Promise.all([
        fetchIndicators(),
        reportId ? fetchIndicatorReport(reportId) : Promise.resolve({ data: null, error: null })
      ]);

      if (indicatorsResult.data) {
        // Cast data_type to the expected union type
        const typedIndicators = indicatorsResult.data.map(indicator => ({
          ...indicator,
          data_type: indicator.data_type as "numeric" | "short_text" | "long_text" | "file" | "link"
        }));
        setIndicators(typedIndicators);
      }

      if (reportResult.data) {
        setReport(reportResult.data);
        // Load existing responses
        const responsesMap: Record<string, IndicatorResponse> = {};
        if (reportResult.data.responses) {
          reportResult.data.responses.forEach((response: IndicatorResponse) => {
            responsesMap[response.indicator_id] = response;
          });
        }
        setResponses(responsesMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (indicatorId: string, field: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        [field]: value,
        indicator_id: indicatorId,
        indicator_report_id: reportId || '',
        id: prev[indicatorId]?.id || '',
        created_at: prev[indicatorId]?.created_at || '',
        updated_at: prev[indicatorId]?.updated_at || '',
        numeric_value: prev[indicatorId]?.numeric_value || 0,
        text_value: prev[indicatorId]?.text_value || '',
        file_url: prev[indicatorId]?.file_url || '',
        file_name: prev[indicatorId]?.file_name || '',
        link_value: prev[indicatorId]?.link_value || '',
        observations: prev[indicatorId]?.observations || '',
      } as IndicatorResponse
    }));
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const reportData = {
        ...report,
        responses: Object.values(responses)
      };

      await updateIndicatorReport(reportId!, reportData);

      toast({
        title: "Éxito",
        description: "Informe guardado correctamente",
      });
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el informe",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!reportId) return;

    try {
      await submitIndicatorReport(reportId);
      toast({
        title: "Éxito",
        description: "Informe enviado correctamente",
      });
      onSave();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el informe",
        variant: "destructive",
      });
    }
  };

  const getResponse = (indicatorId: string): IndicatorResponse => {
    return responses[indicatorId] || {
      id: '',
      created_at: '',
      updated_at: '',
      indicator_report_id: reportId || '',
      indicator_id: indicatorId,
      numeric_value: 0,
      text_value: '',
      file_url: '',
      file_name: '',
      link_value: '',
      observations: ''
    };
  };

  const renderIndicatorInput = (indicator: Indicator) => {
    const response = getResponse(indicator.id);

    switch (indicator.data_type) {
      case "numeric":
        return (
          <Input
            type="number"
            value={response.numeric_value || ''}
            onChange={(e) => handleResponseChange(indicator.id, 'numeric_value', parseFloat(e.target.value) || 0)}
            placeholder="Ingrese valor numérico"
          />
        );
      case "short_text":
        return (
          <Input
            value={response.text_value || ''}
            onChange={(e) => handleResponseChange(indicator.id, 'text_value', e.target.value)}
            placeholder="Ingrese texto corto"
            maxLength={255}
          />
        );
      case "long_text":
        return (
          <Textarea
            value={response.text_value || ''}
            onChange={(e) => handleResponseChange(indicator.id, 'text_value', e.target.value)}
            placeholder="Ingrese texto largo"
            rows={4}
          />
        );
      case "link":
        return (
          <Input
            type="url"
            value={response.link_value || ''}
            onChange={(e) => handleResponseChange(indicator.id, 'link_value', e.target.value)}
            placeholder="https://ejemplo.com"
          />
        );
      case "file":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                // TODO: Implementar subida de archivo
                const file = e.target.files?.[0];
                if (file) {
                  handleResponseChange(indicator.id, 'file_name', file.name);
                }
              }}
            />
            {response.file_name && (
              <p className="text-sm text-gray-600">Archivo: {response.file_name}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando informe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onSave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Informes
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Informe de Indicadores</h1>
            <p className="text-gray-600">Complete los indicadores solicitados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || report?.status !== 'draft'}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={report?.status !== 'draft'}
            className="institutional-gradient text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Informe
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Indicadores a Reportar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {indicators.map((indicator) => {
            const response = getResponse(indicator.id);
            return (
              <div key={indicator.id} className="space-y-3 p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">{indicator.name}</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Tipo: {indicator.data_type === 'numeric' ? 'Numérico' : 
                           indicator.data_type === 'short_text' ? 'Texto Corto' :
                           indicator.data_type === 'long_text' ? 'Texto Largo' :
                           indicator.data_type === 'file' ? 'Adjunto' : 'Link'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`indicator-${indicator.id}`}>Respuesta</Label>
                  {renderIndicatorInput(indicator)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`observations-${indicator.id}`}>Observaciones (Opcional)</Label>
                  <Textarea
                    id={`observations-${indicator.id}`}
                    value={response.observations || ''}
                    onChange={(e) => handleResponseChange(indicator.id, 'observations', e.target.value)}
                    placeholder="Observaciones adicionales sobre este indicador"
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
