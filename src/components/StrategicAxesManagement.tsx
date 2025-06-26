import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStrategicAxes } from "@/hooks/useStrategicAxes";
import { Plus, Edit, Trash2 } from "lucide-react";

export function StrategicAxesManagement() {
  const [strategicAxes, setStrategicAxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAxis, setEditingAxis] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    is_active: true,
  });
  
  const { toast } = useToast();
  const { fetchStrategicAxes, createStrategicAxis, updateStrategicAxis, deleteStrategicAxis } = useStrategicAxes();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchStrategicAxes();
      if (data) {
        setStrategicAxes(data);
      }
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load strategic axes",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, is_active: e.target.checked });
  };

  const handleCreateAxis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await createStrategicAxis(form);
      if (error) {
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
        setIsDialogOpen(false);
        setForm({ code: "", name: "", description: "", is_active: true });
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create strategic axis",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAxis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAxis) return;
    try {
      const { error } = await updateStrategicAxis(editingAxis.id, form);
      if (error) {
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
        setIsDialogOpen(false);
        setEditingAxis(null);
        setForm({ code: "", name: "", description: "", is_active: true });
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update strategic axis",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAxis = async (id: string) => {
    try {
      const { error } = await deleteStrategicAxis(id);
      if (error) {
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
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete strategic axis",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (axis: any) => {
    setEditingAxis(axis);
    setForm({
      code: axis.code,
      name: axis.name,
      description: axis.description || "",
      is_active: axis.is_active,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAxis(null);
    setForm({ code: "", name: "", description: "", is_active: true });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Strategic Axes Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="institutional-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Strategic Axis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAxis ? "Edit Strategic Axis" : "Create Strategic Axis"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={editingAxis ? handleUpdateAxis : handleCreateAxis} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      value={form.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="is_active">
                      <Input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={form.is_active}
                        onchange={handleCheckboxChange}
                        className="mr-2"
                      />
                      Active
                    </Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" className="institutional-gradient text-white">
                      {editingAxis ? "Update Axis" : "Create Axis"}
                    </Button>
                  </div>
                </form>
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
                <TableHead>Description</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : strategicAxes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No strategic axes found.
                  </TableCell>
                </TableRow>
              ) : (
                strategicAxes.map((axis) => (
                  <TableRow key={axis.id}>
                    <TableCell>{axis.code}</TableCell>
                    <TableCell>{axis.name}</TableCell>
                    <TableCell>{axis.description}</TableCell>
                    <TableCell>{axis.is_active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(axis)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAxis(axis.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
