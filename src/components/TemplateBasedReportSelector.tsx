import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useReportSystem } from "@/hooks/useReportSystem";

interface TemplateBasedReportSelectorProps {
  onReportCreated: () => void;
}

export function TemplateBasedReportSelector({ onReportCreated }: TemplateBasedReportSelectorProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportTitle, setReportTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();

  const { fetchReportTemplates } = useReportTemplates();
  const { 
    fetchReportPeriods,
    createTemplateBasedReport
  } = useReportSystem();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesResult, periodsResult] = await Promise.all([
        fetchReportTemplates(),
        fetchReportPeriods()
      ]);

      if (templatesResult.data) setTemplates(templatesResult.data);
      if (periodsResult.data) setPeriods(periodsResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load templates and periods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!reportTitle || !selectedTemplate || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const reportData = {
        title: reportTitle,
        template_id: selectedTemplate,
        period_id: selectedPeriod,
        manager_id: profile?.id,
      };
      const { data, error } = await createTemplateBasedReport(reportData);

      if (error) {
        console.error("Error creating report:", error);
        toast({
          title: "Error",
          description: "Failed to create report",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Report created successfully",
        });
        onReportCreated();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Based Reports
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="institutional-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Report</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="reportTitle">Report Title</Label>
                    <Input
                      id="reportTitle"
                      placeholder="Report Title"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateReport}>Create</Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Report 1</TableCell>
                <TableCell>Template 1</TableCell>
                <TableCell>Period 1</TableCell>
                <TableCell>
                  <Button variant="outline">Edit</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
