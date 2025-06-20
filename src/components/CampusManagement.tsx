import React, { useState, useEffect, FC } from "react";
// import { useSupabaseData } from "@/hooks/useSupabaseData";
// import { useAuth } from "@/hooks/useAuth";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building, GraduationCap, Users } from "lucide-react";

// --- START: Mock Implementations for Demonstration ---
// In your actual project, you would import these from your libraries.

interface ToastProps {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

const useAuth = () => ({
  profile: { id: 'user-123', role: 'Administrador' }
});

const useToast = () => ({
  toast: ({ title, description, variant }: ToastProps) => {
    console.log(`Toast (${variant || 'default'}): ${title} - ${description}`);
  }
});

const useSupabaseData = () => ({
  fetchCampus: async () => ({ data: [{ id: 'campus-1', name: 'Campus Principal', description: 'Sede central de la universidad.', address: 'Calle Falsa 123, Ciudad Capital' }] }),
  createCampus: async (data: any) => { console.log('Creating campus:', data); return { error: null }; },
  updateCampus: async (id: string, data: any) => { console.log('Updating campus:', id, data); return { error: null }; },
  deleteCampus: async (id: string) => { console.log('Deleting campus:', id); return { error: null }; },
  fetchFaculties: async () => ({ data: [{ id: 'faculty-1', name: 'Facultad de Ingeniería', dean_name: 'Dr. Armando Casas', campus_id: 'campus-1', description: 'Facultad dedicada a las ciencias y la tecnología.' }] }),
  createFaculty: async (data: any) => { console.log('Creating faculty:', data); return { error: null }; },
  updateFaculty: async (id: string, data: any) => { console.log('Updating faculty:', id, data); return { error: null }; },
  deleteFaculty: async (id: string) => { console.log('Deleting faculty:', id); return { error: null }; },
  fetchAcademicPrograms: async () => ({ data: [{ id: 'program-1', name: 'Ingeniería de Sistemas', director_name: 'Dra. Elsa Pato', director_email: 'elsa.pato@example.com', faculty_id: 'faculty-1', campus_id: 'campus-1', manager_id: 'manager-1', description: 'Programa enfocado en software y sistemas.' }] }),
  createAcademicProgram: async (data: any) => { console.log('Creating program:', data); return { error: null }; },
  updateAcademicProgram: async (id: string, data: any) => { console.log('Updating program:', id, data); return { error: null }; },
  deleteAcademicProgram: async (id: string) => { console.log('Deleting program:', id); return { error: null }; },
  fetchManagers: async () => ({ data: [{ id: 'manager-1', full_name: 'Juan Gestor', email: 'juan.gestor@example.com', role: 'Gestor', campus_id: 'campus-1' }] }),
  getUserManagedCampus: async (userId: string) => ({ data: { managed_campus_ids: ['campus-1'] } }),
});

// Mock UI Components (replace with your actual component library like shadcn/ui)
const Button: FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }> = ({ children, className, ...props }) => <button className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${className}`} {...props}>{children}</button>;
const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...props} />;
const Label: FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => <label className="text-sm font-medium leading-none" {...props} />;
const Textarea: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm" {...props} />;
const Card: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-4" {...props}>{children}</div>;
const CardHeader: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div className="flex flex-col space-y-1.5 p-6" {...props}>{children}</div>;
const CardTitle: FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => <h3 className="text-2xl font-semibold leading-none tracking-tight" {...props}>{children}</h3>;
const CardContent: FC<React.HTMLAttributes<HTMLDivElement>> = (props) => <div className="p-6 pt-0" {...props} />;
const Table: FC<React.TableHTMLAttributes<HTMLTableElement>> = (props) => <table className="w-full caption-bottom text-sm" {...props} />;
const TableHeader: FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => <thead className="[&_tr]:border-b" {...props} />;
const TableRow: FC<React.HTMLAttributes<HTMLTableRowElement>> = (props) => <tr className="border-b transition-colors hover:bg-muted/50" {...props} />;
const TableHead: FC<React.ThHTMLAttributes<HTMLTableCellElement>> = (props) => <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" {...props} />;
const TableBody: FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => <tbody className="[&_tr:last-child]:border-0" {...props} />;
const TableCell: FC<React.TdHTMLAttributes<HTMLTableCellElement>> = (props) => <td className="p-4 align-middle" {...props} />;
const Dialog: FC<{ open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }> = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => onOpenChange(false)}><div onClick={e => e.stopPropagation()}>{children}</div></div> : null;
const DialogTrigger: FC<{ asChild?: boolean, children: React.ReactNode }> = ({ children }) => <>{children}</>;
const DialogContent: FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => <div className={`relative z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg ${className}`}>{children}</div>;
const DialogHeader: FC<{ children: React.ReactNode }> = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle: FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const Select: FC<{ onValueChange: (value: string) => void, value?: string, children: React.ReactNode }> = ({ onValueChange, value, children }) => <select onChange={e => onValueChange(e.target.value)} value={value}  className="flex h-10 w-full items-center justify-between rounded-md border px-3 py-2">{children}</select>;
const SelectTrigger: FC<{ children: React.ReactNode, className?: string }> = ({ children }) => <>{children}</>;
const SelectValue: FC<{ placeholder?: string }> = ({ placeholder }) => <option value="" disabled>{placeholder}</option>;
const SelectContent: FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const SelectItem: FC<{ value: string, children: React.ReactNode }> = ({ value, children }) => <option value={value}>{children}</option>;
const Tabs: FC<{ defaultValue: string, onValueChange?: (value: string) => void, children: React.ReactNode }> = ({ defaultValue, onValueChange, children }) => { const [activeTab, setActiveTab] = useState(defaultValue); const kids = React.Children.map(children, (child: any) => React.cloneElement(child, { activeTab, setActiveTab: onValueChange || setActiveTab })); return <div>{kids}</div>;};
const TabsList: FC<{ children: React.ReactNode, className?: string, activeTab?: string, setActiveTab?: (value: string) => void }> = ({ children, className, activeTab, setActiveTab }) => <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-200 p-1 ${className}`}>{React.Children.map(children, (child: any) => React.cloneElement(child, { activeTab, setActiveTab }))}</div>;
const TabsTrigger: FC<{ value: string, children: React.ReactNode, className?: string, activeTab?: string, setActiveTab?: (value: string) => void }> = ({ value, children, activeTab, setActiveTab }) => <button onClick={() => setActiveTab?.(value)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ${activeTab === value ? 'bg-white shadow' : ''}`}>{children}</button>;
const TabsContent: FC<{ value: string, children: React.ReactNode, activeTab?: string }> = ({ value, children, activeTab }) => activeTab === value ? <div>{children}</div> : null;
const Badge: FC<{ variant?: string, children: React.ReactNode }> = ({ children, variant }) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variant === 'secondary' ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}>{children}</span>;
// --- END: Mock Implementations ---

// --- Data Interfaces ---
interface Campus {
  id: string;
  name: string;
  description: string;
  address: string;
}

interface Faculty {
  id: string;
  name: string;
  description: string;
  dean_name: string;
  campus_id: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  director_name: string;
  director_email: string;
  faculty_id: string;
  campus_id: string;
  manager_id: string | null;
}

interface Manager {
    id: string;
    full_name: string;
    email: string;
    role: string;
    campus_id: string;
}

type EditType = 'campus' | 'faculty' | 'program';

export default function CampusManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
 
  const {
    fetchCampus, createCampus, updateCampus, deleteCampus,
    fetchFaculties, createFaculty, updateFaculty, deleteFaculty,
    fetchAcademicPrograms, createAcademicProgram, updateAcademicProgram, deleteAcademicProgram,
    fetchManagers, getUserManagedCampus
  } = useSupabaseData();

  // --- State Variables ---
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [userManagedCampus, setUserManagedCampus] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
 
  // Dialog states
  const [isCampusDialogOpen, setIsCampusDialogOpen] = useState<boolean>(false);
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState<boolean>(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<EditType>('campus');

  // Form states
  const [campusForm, setCampusForm] = useState({ name: "", description: "", address: "" });
  const [facultyForm, setFacultyForm] = useState({ name: "", description: "", dean_name: "", campus_id: "" });
  const [programForm, setProgramForm] = useState<Omit<Program, 'id'>>({ name: "", description: "", director_name: "", director_email: "", faculty_id: "", campus_id: "", manager_id: null });

  // --- Functions ---
  const canManageCampus = (campusId: string): boolean => {
    if (profile?.role !== 'Administrador') return false;
    if (!userManagedCampus || userManagedCampus.length === 0) return true; // Super admin
    return userManagedCampus.includes(campusId);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let managedCampusIds: string[] = [];
      if (profile?.id && profile?.role === 'Administrador') {
        const { data: managedData } = await getUserManagedCampus(profile.id);
        if (managedData) {
          managedCampusIds = managedData.managed_campus_ids || (managedData.campus_id ? [managedData.campus_id] : []);
          setUserManagedCampus(managedCampusIds);
        }
      }

      const [campusResult, facultiesResult, programsResult, managersResult] = await Promise.all([
        fetchCampus(), fetchFaculties(), fetchAcademicPrograms(), fetchManagers()
      ]);

      const filterByManaged = (items: any[], idField: string = 'campus_id') => managedCampusIds.length > 0
        ? items.filter(item => managedCampusIds.includes(item[idField]))
        : items;

      if (campusResult.data) setCampuses(filterByManaged(campusResult.data, 'id'));
      if (facultiesResult.data) setFaculties(filterByManaged(facultiesResult.data));
      if (programsResult.data) setPrograms(filterByManaged(programsResult.data));
      if (managersResult.data) setManagers(managersResult.data);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

    // --- CRUD Handlers (original structure) ---
    const handleCreateCampus = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await createCampus(campusForm);
        if (error) {
            toast({ title: "Error", description: "No se pudo crear el campus", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Campus creado correctamente" });
            setIsCampusDialogOpen(false);
            setCampusForm({ name: "", description: "", address: "" });
            loadData();
        }
    };

    const handleCreateFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await createFaculty(facultyForm);
        if (error) {
            toast({ title: "Error", description: "No se pudo crear la facultad", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Facultad creada correctamente" });
            setIsFacultyDialogOpen(false);
            setFacultyForm({ name: "", description: "", dean_name: "", campus_id: "" });
            loadData();
        }
    };

    const handleCreateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await createAcademicProgram(programForm);
        if (error) {
            toast({ title: "Error", description: "No se pudo crear el programa", variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Programa creado correctamente" });
            setIsProgramDialogOpen(false);
            setProgramForm({ name: "", description: "", director_name: "", director_email: "", faculty_id: "", campus_id: "", manager_id: null });
            loadData();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        let error;
        const typeName = editType === 'campus' ? 'el campus' : editType === 'faculty' ? 'la facultad' : 'el programa';

        if (editType === 'campus') ({ error } = await updateCampus(editingItem.id, editingItem));
        else if (editType === 'faculty') ({ error } = await updateFaculty(editingItem.id, editingItem));
        else if (editType === 'program') ({ error } = await updateAcademicProgram(editingItem.id, editingItem));

        if (error) {
            toast({ title: "Error", description: `No se pudo actualizar ${typeName}`, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} actualizado` });
            setIsEditDialogOpen(false);
            setEditingItem(null);
            loadData();
        }
    };

    const handleDelete = async (id: string, type: EditType) => {
        const typeName = type === 'campus' ? 'el campus' : type === 'faculty' ? 'la facultad' : 'el programa';
        if (!window.confirm(`¿Estás seguro de que deseas eliminar este ${typeName}?`)) return;
        
        let error;
        if (type === 'campus') ({ error } = await deleteCampus(id));
        else if (type === 'faculty') ({ error } = await deleteFaculty(id));
        else if (type === 'program') ({ error } = await deleteAcademicProgram(id));

        if (error) {
            toast({ title: "Error", description: `No se pudo eliminar ${typeName}`, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Elemento eliminado." });
            loadData();
        }
    };

  const handleEdit = (item: any, type: EditType) => {
    setEditingItem(item);
    setEditType(type);
    setIsEditDialogOpen(true);
  };
  
  const getCampusName = (campusId: string) => campuses.find(c => c.id === campusId)?.name || 'N/A';
  const getFacultyName = (facultyId: string) => faculties.find(f => f.id === facultyId)?.name || 'N/A';
  const getManagerName = (managerId: string | null) => managerId ? managers.find(m => m.id === managerId)?.full_name : 'Sin asignar';
  const getAvailableManagers = (campusId?: string) => managers.filter(m => m.role === 'Gestor' && (!campusId || m.campus_id === campusId));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando datos...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <Tabs defaultValue="campus" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campus"><Building className="h-4 w-4 mr-2" />Campus</TabsTrigger>
          <TabsTrigger value="faculties"><GraduationCap className="h-4 w-4 mr-2" />Facultades</TabsTrigger>
          <TabsTrigger value="programs"><Users className="h-4 w-4 mr-2" />Programas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campus">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Campus</CardTitle>
                <Dialog open={isCampusDialogOpen} onOpenChange={setIsCampusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCampusDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Agregar Campus</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Crear Nuevo Campus</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreateCampus} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre del Campus</Label>
                        <Input id="name" value={campusForm.name} onChange={(e) => setCampusForm(prev => ({ ...prev, name: e.target.value }))} required />
                      </div>
                      <div>
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" value={campusForm.address} onChange={(e) => setCampusForm(prev => ({ ...prev, address: e.target.value }))} required />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" value={campusForm.description} onChange={(e) => setCampusForm(prev => ({ ...prev, description: e.target.value }))} />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCampusDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit">Crear Campus</Button>
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
                    <TableHead>Nombre</TableHead>
                    <TableHead>Facultades</TableHead>
                    <TableHead>Programas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell className="font-medium">{campus.name}</TableCell>
                      <TableCell>{faculties.filter(f => f.campus_id === campus.id).length}</TableCell>
                      <TableCell>{programs.filter(p => p.campus_id === campus.id).length}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(campus, 'campus')} disabled={!canManageCampus(campus.id)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(campus.id, 'campus')} disabled={!canManageCampus(campus.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculties">
           <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Facultades</CardTitle>
                <div className="flex items-center space-x-2">
                    <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                        <SelectValue placeholder="Filtrar por campus"/>
                        <SelectItem value="all">Todos los Campus</SelectItem>
                        {campuses.map(campus => <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>)}
                    </Select>
                    <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsFacultyDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Agregar Facultad</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Crear Nueva Facultad</DialogTitle></DialogHeader>
                            <form onSubmit={handleCreateFaculty} className="space-y-4">
                                <div>
                                    <Label htmlFor="campus">Campus</Label>
                                    <Select onValueChange={(value) => setFacultyForm(prev => ({...prev, campus_id: value}))} value={facultyForm.campus_id}>
                                       <SelectValue placeholder="Seleccionar campus"/>
                                       {campuses.map(campus => <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>)}
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="name">Nombre de la Facultad</Label>
                                    <Input id="name" value={facultyForm.name} onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))} required />
                                </div>
                                <div>
                                    <Label htmlFor="dean_name">Nombre del Decano</Label>
                                    <Input id="dean_name" value={facultyForm.dean_name} onChange={(e) => setFacultyForm(prev => ({ ...prev, dean_name: e.target.value }))} required />
                                </div>
                                <div>
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea id="description" value={facultyForm.description} onChange={(e) => setFacultyForm(prev => ({ ...prev, description: e.target.value }))} />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsFacultyDialogOpen(false)}>Cancelar</Button>
                                    <Button type="submit">Crear Facultad</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
              </div>
            </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Nombre</TableHead><TableHead>Campus</TableHead><TableHead>Decano</TableHead><TableHead>Programas</TableHead><TableHead>Acciones</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {faculties.filter(f => selectedCampus === 'all' || f.campus_id === selectedCampus).map(faculty => (
                            <TableRow key={faculty.id}>
                                <TableCell className="font-medium">{faculty.name}</TableCell>
                                <TableCell>{getCampusName(faculty.campus_id)}</TableCell>
                                <TableCell>{faculty.dean_name}</TableCell>
                                <TableCell>{programs.filter(p => p.faculty_id === faculty.id).length}</TableCell>
                                <TableCell><div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(faculty, 'faculty')} disabled={!canManageCampus(faculty.campus_id)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(faculty.id, 'faculty')} disabled={!canManageCampus(faculty.campus_id)}><Trash2 className="h-4 w-4" /></Button>
                                </div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
            <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Gestión de Programas</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                            <SelectValue placeholder="Filtrar por campus"/>
                            <SelectItem value="all">Todos los Campus</SelectItem>
                            {campuses.map(campus => <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>)}
                        </Select>
                         <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setIsProgramDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Agregar Programa</Button>
                            </DialogTrigger>
                             <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Crear Nuevo Programa Académico</DialogTitle></DialogHeader>
                                <form onSubmit={handleCreateProgram} className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Campus</Label>
                                            <Select onValueChange={(value) => setProgramForm(p => ({...p, campus_id: value, faculty_id: ''}))} value={programForm.campus_id}>
                                               <SelectValue placeholder="Seleccionar campus"/>
                                               {campuses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Facultad</Label>
                                            <Select onValueChange={(value) => setProgramForm(p => ({...p, faculty_id: value}))} value={programForm.faculty_id} disabled={!programForm.campus_id}>
                                               <SelectValue placeholder="Seleccionar facultad"/>
                                               {faculties.filter(f => f.campus_id === programForm.campus_id).map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                            </Select>
                                        </div>
                                     </div>
                                     <div>
                                        <Label>Nombre del Programa</Label>
                                        <Input value={programForm.name} onChange={e => setProgramForm(p => ({...p, name: e.target.value}))} required />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Nombre del Director</Label><Input value={programForm.director_name} onChange={e => setProgramForm(p => ({...p, director_name: e.target.value}))} required /></div>
                                        <div><Label>Email del Director</Label><Input type="email" value={programForm.director_email} onChange={e => setProgramForm(p => ({...p, director_email: e.target.value}))} required /></div>
                                     </div>
                                     <div>
                                        <Label>Gestor Asignado</Label>
                                        <Select onValueChange={(value) => setProgramForm(p => ({...p, manager_id: value === 'unassigned' ? null : value}))} value={programForm.manager_id || 'unassigned'}>
                                            <SelectValue placeholder="Seleccionar gestor"/>
                                            <SelectItem value="unassigned">Sin Asignar</SelectItem>
                                            {getAvailableManagers(programForm.campus_id).map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                                        </Select>
                                     </div>
                                     <div><Label>Descripción</Label><Textarea value={programForm.description} onChange={e => setProgramForm(p => ({...p, description: e.target.value}))} /></div>
                                     <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsProgramDialogOpen(false)}>Cancelar</Button><Button type="submit">Crear Programa</Button></div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Facultad</TableHead><TableHead>Director</TableHead><TableHead>Gestor</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {programs.filter(p => selectedCampus === 'all' || p.campus_id === selectedCampus).map(program => (
                                <TableRow key={program.id}>
                                    <TableCell className="font-medium">{program.name}</TableCell>
                                    <TableCell>{getFacultyName(program.faculty_id)}</TableCell>
                                    <TableCell>{program.director_name}</TableCell>
                                    <TableCell><Badge variant={program.manager_id ? 'default' : 'secondary'}>{getManagerName(program.manager_id)}</Badge></TableCell>
                                    <TableCell><div className="flex space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(program, 'program')} disabled={!canManageCampus(program.campus_id)}><Edit className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(program.id, 'program')} disabled={!canManageCampus(program.campus_id)}><Trash2 className="h-4 w-4" /></Button>
                                    </div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Editar {editType}</DialogTitle></DialogHeader>
                {editingItem && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        {editType === 'campus' && <>
                            <div><Label>Nombre</Label><Input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required/></div>
                            <div><Label>Dirección</Label><Input value={editingItem.address} onChange={e => setEditingItem({...editingItem, address: e.target.value})} required/></div>
                            <div><Label>Descripción</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                        </>}
                        {editType === 'faculty' && <>
                             <div><Label>Nombre</Label><Input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required/></div>
                             <div><Label>Decano</Label><Input value={editingItem.dean_name} onChange={e => setEditingItem({...editingItem, dean_name: e.target.value})} required/></div>
                             <div><Label>Descripción</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                        </>}
                        {editType === 'program' && <>
                             <div><Label>Nombre</Label><Input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required/></div>
                             <div><Label>Director</Label><Input value={editingItem.director_name} onChange={e => setEditingItem({...editingItem, director_name: e.target.value})} required/></div>
                             <div><Label>Email Director</Label><Input type="email" value={editingItem.director_email} onChange={e => setEditingItem({...editingItem, director_email: e.target.value})} required/></div>
                             <div>
                                <Label>Gestor Asignado</Label>
                                <Select onValueChange={(value) => setEditingItem({...editingItem, manager_id: value === 'unassigned' ? null : value})} value={editingItem.manager_id || 'unassigned'}>
                                    <SelectItem value="unassigned">Sin Asignar</SelectItem>
                                    {getAvailableManagers(editingItem.campus_id).map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                                </Select>
                             </div>
                             <div><Label>Descripción</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                        </>}
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Actualizar</Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}