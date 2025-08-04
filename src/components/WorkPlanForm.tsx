import { useState, useEffect } from "react";
// Se simulan los componentes de shadcn/ui y los hooks para hacer el código autocontenido
// En una aplicación real, importarías estos desde tus propias rutas.

const Button = ({ children, onClick, className, variant, disabled, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
      variant === "outline" ? "border border-gray-300 bg-white hover:bg-gray-100" :
      variant === "secondary" ? "bg-gray-200 hover:bg-gray-300" :
      variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" :
      "bg-blue-600 text-white hover:bg-blue-700"
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, className, type = "text", ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Textarea = ({ value, onChange, className, ...props }) => (
  <textarea
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Card = ({ children, className }) => <div className={`bg-white shadow-lg rounded-xl overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
const CardContent = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }) => <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>;

const Table = ({ children, className }) => <div className="overflow-x-auto"><table className={`min-w-full divide-y divide-gray-200 ${className}`}>{children}</table></div>;
const TableHeader = ({ children, className }) => <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
const TableBody = ({ children, className }) => <tbody className={`divide-y divide-gray-200 ${className}`}>{children}</tbody>;
const TableHead = ({ children, className }) => <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>;
const TableRow = ({ children, className }) => <tr className={`bg-white ${className}`}>{children}</tr>;
const TableCell = ({ children, className, ...props }) => <td className={`px-6 py-4 whitespace-nowrap ${className}`} {...props}>{children}</td>;

const Alert = ({ children, className }) => <div className={`p-4 rounded-md border ${className}`}>{children}</div>;
const AlertDescription = ({ children, className }) => <p className={`text-sm ${className}`}>{children}</p>;

const Badge = ({ children, className, variant }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === "secondary" ? "bg-gray-100 text-gray-800" :
      variant === "outline" ? "border border-gray-300 text-gray-600" :
      variant === "destructive" ? "bg-red-100 text-red-800" :
      "bg-blue-100 text-blue-800"
    } ${className}`}
  >
    {children}
  </span>
);

const CheckCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const Clock = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const XCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      console.log(`[Toast - ${variant}] ${title}: ${description}`);
      // Aquí se mostraría una notificación real en la interfaz.
    },
  };
};

const mockData = {
  strategicAxes: [
    { id: "eje-1", code: "EJE 1", name: "Eje Estratégico 1" },
    { id: "eje-2", code: "EJE 2", name: "Eje Estratégico 2" },
  ],
  actions: [
    { id: "accion-a", strategic_axis_id: "eje-1", code: "ACC 1.1", name: "Acción A" },
    { id: "accion-b", strategic_axis_id: "eje-1", code: "ACC 1.2", name: "Acción B" },
    { id: "accion-c", strategic_axis_id: "eje-2", code: "ACC 2.1", name: "Acción C" },
  ],
  products: [
    { id: "prod-1", action_id: "accion-a", name: "Producto 1.1.1" },
    { id: "prod-2", action_id: "accion-a", name: "Producto 1.1.2" },
    { id: "prod-3", action_id: "accion-b", name: "Producto 1.2.1" },
    { id: "prod-4", action_id: "accion-c", name: "Producto 2.1.1" },
  ],
  workPlans: [
    { id: "plan-1", manager_id: "manager-1", plan_type_id: "plan-type-A", title: "Objetivos Iniciales del Manager 1", status: "draft" },
    { id: "plan-2", manager_id: "manager-2", plan_type_id: "plan-type-B", title: "Plan aprobado para el Manager 2", status: "approved" },
    { id: "plan-3", manager_id: "manager-3", plan_type_id: "plan-type-C", title: "Plan rechazado por falta de detalle", status: "rejected", approval_comments: "Se requiere mayor especificidad en los objetivos." },
  ],
  assignments: [
    { work_plan_id: "plan-1", product_id: "prod-1", assigned_hours: 10 },
    { work_plan_id: "plan-1", product_id: "prod-2", assigned_hours: 5 },
  ],
};

const useSupabaseData = () => {
  const [db, setDb] = useState(mockData);

  const mockApiCall = (data, error = null) =>
    new Promise((resolve) => setTimeout(() => resolve({ data, error }), 500));

  return {
    fetchStrategicAxes: () => mockApiCall(db.strategicAxes),
    fetchActions: () => mockApiCall(db.actions),
    fetchProducts: () => mockApiCall(db.products),
    fetchWorkPlans: () => mockApiCall(db.workPlans),
    fetchWorkPlanAssignments: (planId) =>
      mockApiCall(db.assignments.filter((a) => a.work_plan_id === planId)),
    createCustomPlan: (newPlan) => {
      const createdPlan = { ...newPlan, id: `plan-${Date.now()}` };
      setDb((prev) => ({ ...prev, workPlans: [...prev.workPlans, createdPlan] }));
      return mockApiCall(createdPlan);
    },
    updateCustomPlan: (planId, updateData) => {
      setDb((prev) => ({
        ...prev,
        workPlans: prev.workPlans.map((plan) =>
          plan.id === planId ? { ...plan, ...updateData } : plan
        ),
      }));
      return mockApiCall(null);
    },
    upsertWorkPlanAssignment: (assignmentData) => {
      setDb((prev) => {
        const existingIndex = prev.assignments.findIndex(
          (a) => a.work_plan_id === assignmentData.work_plan_id && a.product_id === assignmentData.product_id
        );
        let newAssignments;
        if (existingIndex > -1) {
          newAssignments = prev.assignments.map((a, index) =>
            index === existingIndex ? assignmentData : a
          );
        } else {
          newAssignments = [...prev.assignments, assignmentData];
        }
        return { ...prev, assignments: newAssignments };
      });
      return mockApiCall(null);
    },
    submitCustomPlan: (planId) => {
      setDb((prev) => ({
        ...prev,
        workPlans: prev.workPlans.map((plan) =>
          plan.id === planId ? { ...plan, status: "submitted" } : plan
        ),
      }));
      return mockApiCall(null);
    },
  };
};

// Componente principal de la aplicación
export default function App() {
  const manager = {
    id: "manager-1",
    full_name: "John Doe",
    total_hours: 160,
    weekly_hours: 10,
    number_of_weeks: 16,
    academic_programs: [{ name: "Ingeniería de Sistemas" }],
  };

  const [showForm, setShowForm] = useState(true);

  if (!showForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-3xl font-bold mb-4">Plan de Trabajo</h1>
        <p className="text-gray-600 mb-6">El formulario ha sido guardado y cerrado.</p>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          Abrir Formulario
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <WorkPlanForm
        manager={manager}
        onClose={() => setShowForm(false)}
        onSave={() => console.log("Guardado!")}
      />
    </div>
  );
}

// El componente principal con los cambios corregidos
function WorkPlanForm({ manager, onClose, onSave }) {
  const {
    fetchStrategicAxes,
    fetchActions,
    fetchProducts,
    fetchWorkPlans,
    fetchWorkPlanAssignments,
    createCustomPlan,
    updateCustomPlan,
    upsertWorkPlanAssignment,
    submitCustomPlan,
  } = useSupabaseData();
  const { toast } = useToast();

  const [strategicAxes, setStrategicAxes] = useState([]);
  const [actions, setActions] = useState([]);
  const [products, setProducts] = useState([]);
  const [workPlan, setWorkPlan] = useState(null);
  const [objectives, setObjectives] = useState('');
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    loadData();
  }, [manager]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { data: axesData },
        { data: actionsData },
        { data: productsData },
      ] = await Promise.all([
        fetchStrategicAxes(),
        fetchActions(),
        fetchProducts(),
      ]);

      const validAxes = (axesData || []).filter(axis => axis?.id && typeof axis.id === 'string');
      setStrategicAxes(validAxes);
      const validActions = (actionsData || []).filter(action => action?.id && typeof action.id === 'string');
      setActions(validActions);
      const validProducts = (productsData || []).filter(product => product?.id && typeof product.id === 'string');
      setProducts(validProducts);

      const { data: workPlansData } = await fetchWorkPlans();
      const existingPlan = workPlansData?.find(
        (plan) => plan.manager_id === manager.id
      );

      if (existingPlan) {
        setWorkPlan(existingPlan);
        // Usar 'title' en lugar de 'objectives' para corregir el error
        setObjectives(existingPlan.title || '');

        const { data: assignmentsData } = await fetchWorkPlanAssignments(existingPlan.id);
        const initialValues = {};
        assignmentsData?.forEach((assignment) => {
          initialValues[assignment.product_id] = assignment.assigned_hours;
        });
        setInputValues(initialValues);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHoursChange = (productId, value) => {
    const numericValue = parseInt(value) || 0;
    setInputValues((prev) => ({ ...prev, [productId]: numericValue }));
  };

  const handleSave = async () => {
    let currentWorkPlan = workPlan;

    try {
      setLoading(true);

      if (!currentWorkPlan) {
        const planTypeId = manager.plan_type_id || 'default_plan_type_id';
        const newPlan = {
          manager_id: manager.id,
          plan_type_id: planTypeId,
          // Usar 'title' para guardar el objetivo
          title: objectives || `Plan de ${manager.full_name}`,
          status: 'draft',
        };

        const { data: createdPlan, error } = await createCustomPlan(newPlan);
        if (error) throw new Error(`Error creando plan: ${error.message}`);

        currentWorkPlan = createdPlan;
        setWorkPlan(createdPlan);
      } else {
        const updateData = {
          // Usar 'title' para actualizar el objetivo
          title: objectives || currentWorkPlan.title,
        };
        const { error } = await updateCustomPlan(currentWorkPlan.id, updateData);
        if (error) throw new Error(`Error actualizando plan: ${error.message}`);
      }

      const assignmentPromises = Object.entries(inputValues).map(async ([productId, hours]) => {
        if (hours > 0) {
          const assignmentData = {
            work_plan_id: currentWorkPlan.id,
            product_id: productId,
            assigned_hours: hours,
          };
          const { error } = await upsertWorkPlanAssignment(assignmentData);
          if (error) throw new Error(`Error guardando asignación: ${error.message}`);
        }
      });

      await Promise.all(assignmentPromises);
      toast({ title: "Éxito", description: "Plan guardado correctamente" });
      onSave();
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: `No se pudo guardar el plan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    if (!workPlan) {
      toast({ title: "Error", description: "Debe guardar el plan antes de enviarlo.", variant: "destructive" });
      return;
    }
    if (!objectives.trim()) {
      toast({ title: "Error", description: "Debe agregar objetivos antes de enviar.", variant: "destructive" });
      return;
    }
    if (getAvailableHours() < 0) {
      toast({ title: "Error", description: "Las horas asignadas superan las disponibles.", variant: "destructive" });
      return;
    }
    if (getTotalAssignedHours() === 0) {
      toast({ title: "Error", description: "Debe asignar al menos una hora a algún producto.", variant: "destructive" });
      return;
    }

    await handleSave();

    try {
      setLoading(true);
      const { error } = await submitCustomPlan(workPlan.id);
      if (error) throw new Error(`Error enviando plan: ${error.message}`);

      toast({ title: "Éxito", description: "Plan enviado para aprobación." });
      await loadData();
      onSave();
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast({
        title: "Error",
        description: `No se pudo enviar el plan para aprobación: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssignedHours = (productId) => inputValues[productId] || 0;
  const getTotalAssignedHours = () => Object.values(inputValues).reduce((sum, hours) => sum + hours, 0);
  const getAvailableHours = () => (manager.total_hours || 0) - getTotalAssignedHours();
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'submitted': return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'approved': return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8 text-gray-700">Cargando...</div>;
  }

  if (strategicAxes.length === 0) {
    return (
      <Card className="w-full max-w-7xl">
        <CardContent className="p-8 text-center">
          <Alert>
            <AlertDescription>
              No se encontraron ejes estratégicos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const organizedData = strategicAxes.map(axis => ({
    ...axis,
    actions: actions
      .filter(action => action.strategic_axis_id === axis.id)
      .map(action => ({
        ...action,
        products: products.filter(product => product.action_id === action.id)
      }))
  }));

  const isReadOnly = workPlan?.status === 'submitted' || workPlan?.status === 'approved';

  return (
    <Card className="w-full max-w-7xl border-gray-200 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Plan de Trabajo - {manager.full_name}
          </CardTitle>
          {workPlan?.status && getStatusBadge(workPlan.status)}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Programa: {manager.academic_programs?.[0]?.name}</p>
          <p>Horas Totales Disponibles: <span className="font-bold text-blue-600">{manager.total_hours || 0}</span></p>
          <p>Horas Asignadas: <span className="font-bold text-green-600">{getTotalAssignedHours()}</span></p>
          <p>Balance: <span className={`font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {getAvailableHours()}
          </span></p>
          <p className="text-xs text-gray-500">
            (Cálculo: {manager.weekly_hours || 0} horas semanales × {manager.number_of_weeks || 16} semanas = {manager.total_hours || 0} horas totales)
          </p>
        </div>

        {workPlan?.status === 'rejected' && workPlan?.approval_comments && (
          <Alert className="border-red-200 bg-red-50 flex items-center">
            <XCircle className="h-4 w-4 text-red-600 mr-2" />
            <AlertDescription className="text-red-800">
              <strong>Plan rechazado:</strong> {workPlan.approval_comments}
            </AlertDescription>
          </Alert>
        )}

        {workPlan?.status === 'approved' && workPlan?.approval_comments && (
          <Alert className="border-green-200 bg-green-50 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <AlertDescription className="text-green-800">
              <strong>Plan aprobado:</strong> {workPlan.approval_comments}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Objetivos del Plan de Trabajo:
          </label>
          <Textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Describe los objetivos principales de tu plan de trabajo..."
            className="min-h-[100px]"
            disabled={isReadOnly}
          />
        </div>

        <Table className="border rounded-lg overflow-hidden">
          <TableHeader>
            <TableRow className="bg-blue-600 hover:bg-blue-600">
              <TableHead className="text-white font-bold border border-gray-300 text-center w-20">
                EJE ESTRATÉGICO
              </TableHead>
              <TableHead className="text-white font-bold border border-gray-300 text-center">
                ACCIÓN
              </TableHead>
              <TableHead className="text-white font-bold border border-gray-300 text-center">
                PRODUCTO
              </TableHead>
              <TableHead className="text-white font-bold border border-gray-300 text-center w-24">
                HORAS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizedData.map(axis =>
              axis.actions.map((action, actionIndex) =>
                action.products.map((product, productIndex) => {
                  const isFirstActionRow = productIndex === 0;
                  const isFirstAxisRow = actionIndex === 0 && productIndex === 0;
                  const axisRowspan = axis.actions.reduce((sum, a) => sum + a.products.length, 0);
                  const actionRowspan = action.products.length;

                  return (
                    <TableRow key={product.id} className="border-b border-gray-200">
                      {isFirstAxisRow && (
                        <TableCell
                          rowSpan={axisRowspan}
                          className="border border-gray-300 text-center font-medium bg-blue-50 align-middle"
                        >
                          <div className="text-sm font-bold [writing-mode:vertical-rl] transform rotate-180 text-gray-800">
                            {axis.code} - {axis.name}
                          </div>
                        </TableCell>
                      )}
                      {isFirstActionRow && (
                        <TableCell
                          rowSpan={actionRowspan}
                          className="border border-gray-300 text-sm p-2 align-middle"
                        >
                          <div className="font-medium text-gray-800">
                            {action.code} {action.name}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="border border-gray-300 text-sm p-2">
                        {product.name}
                      </TableCell>
                      <TableCell className="border border-gray-300 text-center p-1">
                        <Input
                          type="number"
                          min="0"
                          value={getAssignedHours(product.id)}
                          onChange={(e) => handleHoursChange(product.id, e.target.value)}
                          onBlur={handleSave}
                          className="w-20 h-10 text-center"
                          disabled={isReadOnly}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col md:flex-row justify-between items-center mt-6 p-4 bg-gray-100 rounded-lg shadow-inner">
          <div className="space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            <span className="text-sm text-gray-700">
              <strong>Total Horas:</strong> {getTotalAssignedHours()} / {manager.total_hours || 0}
            </span>
            <span className={`text-sm font-bold ${getAvailableHours() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Balance: {getAvailableHours()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
              Cerrar
            </Button>

            {!isReadOnly && (
              <Button
                onClick={handleSave}
                variant="outline"
                className="bg-gray-200 hover:bg-gray-300 w-full md:w-auto"
              >
                Guardar Borrador
              </Button>
            )}

            {(workPlan?.status === 'draft' || !workPlan) && (
              <Button
                onClick={submitForApproval}
                disabled={getAvailableHours() < 0 || getTotalAssignedHours() === 0 || !objectives.trim()}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                Enviar para Aprobación
              </Button>
            )}
            {workPlan?.status === 'rejected' && (
              <Button
                onClick={submitForApproval}
                disabled={getAvailableHours() < 0 || getTotalAssignedHours() === 0 || !objectives.trim()}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                Reenviar para Aprobación
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
