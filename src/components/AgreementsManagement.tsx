import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAgreements, Agreement } from "@/hooks/useAgreements";
import { AgreementImporter } from "./AgreementImporter";
import { AgreementDetails } from "./AgreementDetails";
import { NewAgreementForm } from "./NewAgreementForm";
import { PaginatedTable } from "./PaginatedTable";
import { Upload, Eye, Plus, Edit2, Trash2, CheckCircle, XCircle, Pause, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

export const AgreementsManagement = () => {
  const { 
    agreements, 
    loading, 
    createAgreement,
    updateAgreement,
    updateAgreementStatus,
    deleteAgreement, 
    calculateStatus 
  } = useAgreements();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => {
      // Filtrar elementos null o undefined
      if (!agreement) return false;
      
      const matchesSearch = !searchTerm || 
        agreement.foreign_institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agreement.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agreement.country?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = countryFilter === 'all' || agreement.country === countryFilter;
      const matchesType = typeFilter === 'all' || agreement.agreement_type === typeFilter;
      
      const calculatedStatus = calculateStatus(agreement.termination_date);
      const matchesStatus = statusFilter === 'all' || calculatedStatus === statusFilter;
      
      return matchesSearch && matchesCountry && matchesType && matchesStatus;
    });
  }, [agreements, searchTerm, countryFilter, typeFilter, statusFilter, calculateStatus]);

  const uniqueCountries = useMemo(() => 
    [...new Set(agreements.map(a => a.country).filter(Boolean))].sort(), 
    [agreements]
  );

  const uniqueTypes = useMemo(() => 
    [...new Set(agreements.map(a => a.agreement_type).filter(Boolean))].sort(), 
    [agreements]
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'renewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terminated': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <Pause className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      case 'renewed': return <RefreshCw className="w-4 h-4" />;
      case 'terminated': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (terminationDate?: string, currentStatus?: string) => {
    if (currentStatus) {
      const statusLabels = {
        'active': 'Activo',
        'expired': 'Vencido',
        'suspended': 'Suspendido',
        'under_review': 'En revisión',
        'renewed': 'Renovado',
        'terminated': 'Terminado'
      };
      
      return (
        <Badge className={`${getStatusColor(currentStatus)} flex items-center gap-1`}>
          {getStatusIcon(currentStatus)}
          {statusLabels[currentStatus as keyof typeof statusLabels] || 'Desconocido'}
        </Badge>
      );
    }
    
    // Fallback al cálculo basado en fecha de terminación
    const status = calculateStatus(terminationDate);
    const variants = {
      'Vigente': 'default',
      'Próximo a vencer': 'secondary', 
      'Vencido': 'destructive',
      'Sin fecha': 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const columns = [
    { key: 'code', label: 'Código' },
    { key: 'country', label: 'País' },
    { key: 'foreign_institution_name', label: 'Institución' },
    { key: 'agreement_type', label: 'Tipo' },
    { 
      key: 'termination_date', 
      label: 'Estado',
      render: (item: Agreement) => item ? getStatusBadge(item.termination_date, item.current_status) : <Badge variant="outline">-</Badge>
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item: Agreement) => item ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAgreement(item);
              setShowDetails(true);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
        </div>
      ) : null
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Cargando convenios...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Convenios</CardTitle>
          <CardDescription>
            Administra los convenios con instituciones de educación superior y otras entidades
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Convenios</TabsTrigger>
          <TabsTrigger value="import">Importar Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle>Convenios ({filteredAgreements.length})</CardTitle>
                  <CardDescription>Lista completa de convenios registrados</CardDescription>
                </div>
                <Button onClick={() => setShowNewForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Convenio
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar por institución, código o país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los países</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Vigente">Vigente</SelectItem>
                    <SelectItem value="Próximo a vencer">Próximo a vencer</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Sin fecha">Sin fecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <PaginatedTable
                data={filteredAgreements}
                columns={columns}
                searchFields={['foreign_institution_name', 'code', 'country']}
                title="Convenios"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <AgreementImporter />
        </TabsContent>
      </Tabs>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAgreement && (
          <AgreementDetails 
            agreement={selectedAgreement}
            onUpdate={updateAgreement}
            onUpdateStatus={updateAgreementStatus}
            onDelete={deleteAgreement}
            onClose={() => setShowDetails(false)}
          />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <NewAgreementForm 
            onCreate={createAgreement}
            onClose={() => setShowNewForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};