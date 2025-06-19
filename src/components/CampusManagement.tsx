
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Building, GraduationCap, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campus {
  id: string;
  name: string;
  address: string;
}

interface Faculty {
  id: string;
  name: string;
  deanName: string;
  campusId: string;
  campusName: string;
}

interface AcademicProgram {
  id: string;
  name: string;
  campusId: string;
  campusName: string;
  facultyId: string;
  facultyName: string;
  directorName: string;
  directorEmail: string;
  managerId?: string;
  managerName?: string;
}

export function CampusManagement() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [activeTab, setActiveTab] = useState("campuses");
  const { toast } = useToast();

  // Campus Management
  const [campusDialog, setCampusDialog] = useState(false);
  const [campusForm, setCampusForm] = useState({ name: "", address: "" });
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  // Faculty Management
  const [facultyDialog, setFacultyDialog] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ name: "", deanName: "", campusId: "" });
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Program Management
  const [programDialog, setProgramDialog] = useState(false);
  const [programForm, setProgramForm] = useState({
    name: "",
    campusId: "",
    facultyId: "",
    directorName: "",
    directorEmail: ""
  });
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);

  // Campus Functions
  const handleCampusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampus: Campus = {
      id: editingCampus?.id || Date.now().toString(),
      name: campusForm.name,
      address: campusForm.address,
    };

    if (editingCampus) {
      setCampuses(campuses.map(campus => campus.id === editingCampus.id ? newCampus : campus));
      toast({ title: "Campus actualizado exitosamente" });
    } else {
      setCampuses([...campuses, newCampus]);
      toast({ title: "Campus creado exitosamente" });
    }

    setCampusForm({ name: "", address: "" });
    setEditingCampus(null);
    setCampusDialog(false);
  };

  // Faculty Functions
  const handleFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCampus = campuses.find(c => c.id === facultyForm.campusId);
    const newFaculty: Faculty = {
      id: editingFaculty?.id || Date.now().toString(),
      name: facultyForm.name,
      deanName: facultyForm.deanName,
      campusId: facultyForm.campusId,
      campusName: selectedCampus?.name || "",
    };

    if (editingFaculty) {
      setFaculties(faculties.map(faculty => faculty.id === editingFaculty.id ? newFaculty : faculty));
      toast({ title: "Facultad actualizada exitosamente" });
    } else {
      setFaculties([...faculties, newFaculty]);
      toast({ title: "Facultad creada exitosamente" });
    }

    setFacultyForm({ name: "", deanName: "", campusId: "" });
    setEditingFaculty(null);
    setFacultyDialog(false);
  };

  // Program Functions
  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCampus = campuses.find(c => c.id === programForm.campusId);
    const selectedFaculty = faculties.find(f => f.id === programForm.facultyId);
    
    const newProgram: AcademicProgram = {
      id: editingProgram?.id || Date.now().toString(),
      name: programForm.name,
      campusId: programForm.campusId,
      campusName: selectedCampus?.name || "",
      facultyId: programForm.facultyId,
      facultyName: selectedFaculty?.name || "",
      directorName: programForm.directorName,
      directorEmail: programForm.directorEmail,
    };

    if (editingProgram) {
      setPrograms(programs.map(program => program.id === editingProgram.id ? newProgram : program));
      toast({ title: "Programa actualizado exitosamente" });
    } else {
      setPrograms([...programs, newProgram]);
      toast({ title: "Programa creado exitosamente" });
    }

    setProgramForm({ name: "", campusId: "", facultyId: "", directorName: "", directorEmail: "" });
    setEditingProgram(null);
    setProgramDialog(false);
  };

  const availableFaculties = faculties.filter(f => f.campusId === programForm.campusId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Gestión de Campus, Facultades y Programas</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campuses" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Campus
            </TabsTrigger>
            <TabsTrigger value="faculties" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Facultades
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Programas
            </TabsTrigger>
          </TabsList>

          {/* Campus Tab */}
          <TabsContent value="campuses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Campus Universitarios</h3>
              <Dialog open={campusDialog} onOpenChange={setCampusDialog}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Campus
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCampus ? "Editar" : "Crear"} Campus</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCampusSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campusName">Nombre del Campus</Label>
                      <Input
                        id="campusName"
                        value={campusForm.name}
                        onChange={(e) => setCampusForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campusAddress">Dirección del Campus</Label>
                      <Input
                        id="campusAddress"
                        value={campusForm.address}
                        onChange={(e) => setCampusForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setCampusDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        {editingCampus ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campus</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campuses.map((campus) => (
                  <TableRow key={campus.id}>
                    <TableCell className="font-medium">{campus.name}</TableCell>
                    <TableCell>{campus.address}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingCampus(campus);
                          setCampusForm({ name: campus.name, address: campus.address });
                          setCampusDialog(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setCampuses(campuses.filter(c => c.id !== campus.id));
                          toast({ title: "Campus eliminado" });
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Faculties Tab */}
          <TabsContent value="faculties" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Facultades</h3>
              <Dialog open={facultyDialog} onOpenChange={setFacultyDialog}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white" disabled={campuses.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Facultad
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingFaculty ? "Editar" : "Crear"} Facultad</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFacultySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facultyName">Nombre de la Facultad</Label>
                      <Input
                        id="facultyName"
                        value={facultyForm.name}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deanName">Nombre del Decano</Label>
                      <Input
                        id="deanName"
                        value={facultyForm.deanName}
                        onChange={(e) => setFacultyForm(prev => ({ ...prev, deanName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facultyCampus">Campus</Label>
                      <Select value={facultyForm.campusId} onValueChange={(value) => setFacultyForm(prev => ({ ...prev, campusId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {campuses.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id}>
                              {campus.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setFacultyDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        {editingFaculty ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facultad</TableHead>
                  <TableHead>Decano</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell className="font-medium">{faculty.name}</TableCell>
                    <TableCell>{faculty.deanName}</TableCell>
                    <TableCell>{faculty.campusName}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingFaculty(faculty);
                          setFacultyForm({ 
                            name: faculty.name, 
                            deanName: faculty.deanName, 
                            campusId: faculty.campusId 
                          });
                          setFacultyDialog(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setFaculties(faculties.filter(f => f.id !== faculty.id));
                          toast({ title: "Facultad eliminada" });
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Programas Académicos</h3>
              <Dialog open={programDialog} onOpenChange={setProgramDialog}>
                <DialogTrigger asChild>
                  <Button className="institutional-gradient text-white" disabled={faculties.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Programa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingProgram ? "Editar" : "Crear"} Programa Académico</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProgramSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="programCampus">Campus de Oferta</Label>
                      <Select value={programForm.campusId} onValueChange={(value) => {
                        setProgramForm(prev => ({ ...prev, campusId: value, facultyId: "" }));
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {campuses.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id}>
                              {campus.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="programFaculty">Facultad Asociada</Label>
                      <Select value={programForm.facultyId} onValueChange={(value) => setProgramForm(prev => ({ ...prev, facultyId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar facultad" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFaculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="programName">Nombre del Programa</Label>
                      <Input
                        id="programName"
                        value={programForm.name}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="directorName">Director de Programa</Label>
                      <Input
                        id="directorName"
                        value={programForm.directorName}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, directorName: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="directorEmail">Correo del Director</Label>
                      <Input
                        id="directorEmail"
                        type="email"
                        value={programForm.directorEmail}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, directorEmail: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setProgramDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="institutional-gradient text-white">
                        {editingProgram ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facultad</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Director</TableHead>
                  <TableHead>Gestor Relacionado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>{program.facultyName}</TableCell>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.campusName}</TableCell>
                    <TableCell>{program.directorName}</TableCell>
                    <TableCell>
                      {program.managerName ? (
                        <span className="text-green-600 font-medium">{program.managerName}</span>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingProgram(program);
                          setProgramForm({
                            name: program.name,
                            campusId: program.campusId,
                            facultyId: program.facultyId,
                            directorName: program.directorName,
                            directorEmail: program.directorEmail
                          });
                          setProgramDialog(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setPrograms(programs.filter(p => p.id !== program.id));
                          toast({ title: "Programa eliminado" });
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
        
        {campuses.length === 0 && activeTab === "campuses" && (
          <div className="text-center py-8 text-gray-500">
            No hay campus registrados. Crear el primer campus.
          </div>
        )}
        
        {campuses.length === 0 && activeTab === "faculties" && (
          <div className="text-center py-8 text-gray-500">
            Primero debe crear al menos un campus para poder crear facultades.
          </div>
        )}
        
        {faculties.length === 0 && activeTab === "programs" && (
          <div className="text-center py-8 text-gray-500">
            Primero debe crear al menos una facultad para poder crear programas académicos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
