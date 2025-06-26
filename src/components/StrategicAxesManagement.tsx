import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, FileText, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStrategicAxes } from "@/hooks/useStrategicAxes";

export function StrategicAxesManagement() {
  const [axes, setAxes] = useState<any[]>([]);
  const [selectedAxes, setSelectedAxes] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAxis, setNewAxis] = useState({ code: "", name: "" });
  const [editingAxis, setEditingAxis] = useState<any>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis
  } = useStrategicAxes();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchStrategicAxes();
      if (data) setAxes(data);
      if (error) {
        console.error("Error fetching strategic axes:", error);
        toast({
          title: "Error",
          description: "Failed to load strategic axes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load strategic axes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAxisSelection = (axisId: string, isSelected: boolean) => {
    setSelectedAxes((prevSelected) =>
      isSelected
        ? [...prevSelected, axisId]
        : prevSelected.filter((id) => id !== axisId)
    );
  };

  const handleCreateAxis = async () => {
    if (!newAxis.code || !newAxis.name) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await createStrategicAxis(newAxis);

      if (error) {
        console.error("Error creating strategic axis:", error);
        toast({
          title: "Error",
          description: "Failed to create strategic axis",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Strategic axis created successfully",
        });
        loadData();
        setNewAxis({ code: "", name: "" });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating strategic axis:", error);
      toast({
        title: "Error",
        description: "Failed to create strategic axis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAxis = async () => {
    if (!editingAxis.code || !editingAxis.name) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await updateStrategicAxis(editingAxis.id, editingAxis);

      if (error) {
        console.error("Error updating strategic axis:", error);
        toast({
          title: "Error",
          description: "Failed to update strategic axis",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Strategic axis updated successfully",
        });
        loadData();
        setEditingAxis(null);
        setIsDialogOpen(false);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error updating strategic axis:", error);
      toast({
        title: "Error",
        description: "Failed to update strategic axis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAxis = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await deleteStrategicAxis(id);

      if (error) {
        console.error("Error deleting strategic axis:", error);
        toast({
          title: "Error",
          description: "Failed to delete strategic axis",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Strategic axis deleted successfully",
        });
        loadData();
      }
    } catch (error) {
      console.error("Error deleting strategic axis:", error);
      toast({
        title: "Error",
        description: "Failed to delete strategic axis",
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
              Strategic Axes
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="institutional-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditMode ? "Edit Axis" : "Create Axis"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Axis" : "Create New Axis"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      placeholder="Axis Code"
                      value={isEditMode ? editingAxis?.code || "" : newAxis.code}
                      onChange={(e) =>
                        isEditMode
                          ? setEditingAxis({ ...editingAxis, code: e.target.value })
                          : setNewAxis({ ...newAxis, code: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Axis Name"
                      value={isEditMode ? editingAxis?.name || "" : newAxis.name}
                      onChange={(e) =>
                        isEditMode
                          ? setEditingAxis({ ...editingAxis, name: e.target.value })
                          : setNewAxis({ ...newAxis, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button onClick={isEditMode ? handleUpdateAxis : handleCreateAxis}>
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Selected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {axes.map((axis) => (
                <TableRow key={axis.id}>
                  <TableCell>{axis.code}</TableCell>
                  <TableCell>{axis.name}</TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      id={`axis-${axis.id}`}
                      name={`axis-${axis.id}`}
                      checked={selectedAxes.includes(axis.id)}
                      onChange={(e) => handleAxisSelection(axis.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditMode(true);
                          setEditingAxis(axis);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAxis(axis.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
