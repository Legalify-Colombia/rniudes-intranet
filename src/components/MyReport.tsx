
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCustomPlans } from "@/hooks/useCustomPlans";
import { usePlanTypes } from "@/hooks/usePlanTypes";
import { useReportSystem } from "@/hooks/useReportSystem";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Send, Plus, Edit, Trash2, FileText, Users, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TemplateBasedReportSelector } from "./TemplateBasedReportSelector";
import { CustomPlanForm } from "./CustomPlanForm";
import { StructuredWorkPlanForm } from "./StructuredWorkPlanForm";
import { UnifiedReportForm } from "./UnifiedReportForm";

interface UnifiedReport {
  id: string;
  title: string;
  type: "work_plan" | "template" | "indicators" | "custom_plan";
  status: string;
  created_at: string;
}

export function MyReport() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    fetchCustomPlansByManager
  } = useCustomPlans();
  const { fetchPlanTypes } = usePlanTypes();
  const {
    fetchWorkPlanDetails,
    fetchTemplateBasedReportDetails,
    fetchIndicatorReport
  } = useReportSystem();

  const [reports, setReports] = useState<UnifiedReport[]>([]);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<UnifiedReport | null>(null);

  useEffect(() => {
    loadReports();
    loadPlanTypes();
  }, []);

  const loadReports = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Fetch work plans (using custom_plans table)
      const { data: customPlansData } = await fetchCustomPlansByManager(profile.id);
      const workPlans = customPlansData ? customPlansData.filter((cp: any) => 
        cp.plan_type_id === 'work_plan' || !cp.plan_type_id
      ).map((wp: any) => ({
        id: wp.id,
        title: wp.title || 'Plan de Trabajo',
        type: 'work_plan',
        status: wp.status,
        created_at: wp.created_at
      })) : [];

      // Fetch template-based reports
      const { data: templateReportsData } = await supabase
        .from("template_based_reports")
        .select("*")
        .eq("manager_id", profile.id)
        .order("created_at", { ascending: false });

      const templateReports = templateReportsData ? templateReportsData.map((tr: any) => ({
        id: tr.id,
        title: tr.title || 'Informe por Plantilla',
        type: 'template',
        status: tr.status,
        created_at: tr.created_at
      })) : [];

      // Fetch indicator reports
      const { data: indicatorReportsData } = await supabase
        .from("indicator_reports")
        .select("*")
        .eq("manager_id", profile.id)
        .order("created_at", { ascending: false });

      const indicatorReports = indicatorReportsData ? indicatorReportsData.map((ir: any) => ({
        id: ir.id,
        title: ir.title || 'Informe de Indicadores',
        type: 'indicators',
        status: ir.status,
        created_at: ir.created_at
      })) : [];

      // Fetch custom plans
      const customPlans = customPlansData ? customPlansData.filter((cp: any) => 
        cp.plan_type_id !== 'work_plan' && cp.plan_type_id
      ).map((cp: any) => ({
        id: cp.id,
        title: cp.title || 'Plan Personalizado',
        type: 'custom_plan',
        status: cp.status,
        created_at: cp.created_at
      })) : [];

      const allReports = [...workPlans, ...templateReports, ...indicatorReports, ...customPlans];
      setReports(allReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanTypes = async () => {
    try {
      const { data, error } = await fetchPlanTypes();
      if (data) {
        setPlanTypes(data);
      }
      if (error) {
        console.error("Error fetching plan types:", error);
        toast({
          title: "Error",
          description: "Failed to load plan types",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching plan types:", error);
      toast({
        title: "Error",
        description: "Failed to load plan types",
        variant: "destructive",
      });
    }
  };

  const handleCreatePlan = (planTypeId: string | null = null) => {
    setSelectedPlanType(planTypeId);
    setIsCreatingPlan(true);
    setSelectedReport(null);
  };

  const handleReportClick = (report: UnifiedReport) => {
    setSelectedReport(report);
    setIsCreatingPlan(false);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setIsCreatingPlan(false);
    setSelectedPlanType(null);
    loadReports();
  };

  if (selectedReport) {
    return (
      <UnifiedReportForm
        reportType={selectedReport.type}
        reportId={selectedReport.id}
        onSave={handleBackToList}
      />
    );
  }

  if (isCreatingPlan) {
    if (selectedPlanType) {
      return (
        <CustomPlanForm
          planTypeId={selectedPlanType}
          onSave={handleBackToList}
        />
      );
    } else {
      return <StructuredWorkPlanForm onSave={handleBackToList} onCancel={handleBackToList} />;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Informes</h1>
        <p className="text-gray-600">
          Aquí puedes ver y gestionar todos tus informes
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Planes Personalizados
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="institutional-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Plan Personalizado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecciona el tipo de plan</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {planTypes.map((planType) => (
                    <Button
                      key={planType.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleCreatePlan(planType.id)}
                    >
                      {planType.name}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reports.filter(report => report.type === 'custom_plan').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.filter(report => report.type === 'custom_plan').map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" onClick={() => handleReportClick(report)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                No has creado ningún plan personalizado aún.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Planes de Trabajo
            </CardTitle>
            <Button className="institutional-gradient text-white" onClick={() => handleCreatePlan()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Plan de Trabajo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reports.filter(report => report.type === 'work_plan').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.filter(report => report.type === 'work_plan').map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" onClick={() => handleReportClick(report)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                No has creado ningún plan de trabajo aún.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informes por Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateBasedReportSelector
            onReportCreated={loadReports}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Otros Informes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reports.filter(report => report.type === 'template' || report.type === 'indicators').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.filter(report => report.type === 'template' || report.type === 'indicators').map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" onClick={() => handleReportClick(report)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                No tienes otros informes creados aún.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
