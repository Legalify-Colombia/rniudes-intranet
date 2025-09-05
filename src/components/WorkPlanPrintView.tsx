import React from "react";

interface WorkPlanPrintViewProps {
  workPlan: any;
  assignments: any[];
}

export function WorkPlanPrintView({ workPlan, assignments }: WorkPlanPrintViewProps) {
  const organizeAssignments = () => {
    if (!assignments || assignments.length === 0) {
      return [];
    }
    const axesMap = new Map();
    assignments.forEach(assignment => {
      if (assignment.product?.action?.strategic_axis && (assignment.assigned_hours || 0) > 0) {
        const axis = assignment.product.action.strategic_axis;
        const action = assignment.product.action;
        const product = assignment.product;

        if (!axesMap.has(axis.id)) {
          axesMap.set(axis.id, { ...axis, actions: new Map() });
        }
        const axisData = axesMap.get(axis.id);
        
        if (!axisData.actions.has(action.id)) {
          axisData.actions.set(action.id, { ...action, products: [] });
        }
        const actionData = axisData.actions.get(action.id);

        actionData.products.push({ ...product, assigned_hours: assignment.assigned_hours });
      }
    });
    return Array.from(axesMap.values()).map(axis => ({
      ...axis,
      actions: Array.from(axis.actions.values())
    }));
  };

  const organizedData = organizeAssignments();
  const totalHours = assignments?.reduce((sum, assignment) => sum + (assignment.assigned_hours || 0), 0) || 0;

  React.useEffect(() => {
    // Añadir estilos de impresión dinámicamente
    const printStyles = `
      @media print {
        .print-view {
          display: block !important;
        }
        .no-print {
          display: none !important;
        }
        body * {
          visibility: hidden;
        }
        .print-view, .print-view * {
          visibility: visible;
        }
        .print-view {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
          color: black;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .print-title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .print-subtitle {
          font-size: 14pt;
          color: #666;
        }
        .info-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        .info-item {
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #333;
        }
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .assignments-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10pt;
        }
        .assignments-table th,
        .assignments-table td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        .assignments-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        .assignments-table .axis-cell {
          background-color: #f8f9fa;
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
        }
        .assignments-table .hours-cell {
          text-align: center;
          font-weight: bold;
        }
        .total-row {
          background-color: #e9ecef;
          font-weight: bold;
        }
        .total-row td {
          border-top: 2px solid #333;
        }
        .print-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10pt;
          color: #666;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="print-view" style={{ display: 'none' }}>
      <div className="print-header">
        <div className="print-title">PLAN DE TRABAJO</div>
        <div className="print-subtitle">{workPlan?.plan_type?.name || 'Plan Personalizado'}</div>
        <div style={{ fontSize: '12pt', marginTop: '10px' }}>
          {workPlan?.title || 'Sin título'}
        </div>
      </div>

      <div className="info-section">
        <div className="section-title">Información General</div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Gestor:</span> {workPlan?.manager?.full_name || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span> {workPlan?.manager?.email || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Cargo:</span> {workPlan?.manager?.position || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Campus:</span> {workPlan?.manager?.campus?.name || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Programa:</span> {workPlan?.manager?.program?.name || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Facultad:</span> {workPlan?.manager?.faculty?.name || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Estado:</span> {workPlan?.status === 'draft' ? 'Borrador' : 
              workPlan?.status === 'submitted' ? 'Enviado' :
              workPlan?.status === 'approved' ? 'Aprobado' :
              workPlan?.status === 'rejected' ? 'Rechazado' : workPlan?.status || 'N/A'}
          </div>
          <div className="info-item">
            <span className="info-label">Total Horas:</span> {totalHours}
          </div>
        </div>
        
        {workPlan?.submitted_date && (
          <div className="info-item">
            <span className="info-label">Fecha de Envío:</span> {new Date(workPlan.submitted_date).toLocaleDateString('es-ES')}
          </div>
        )}
        
        {workPlan?.approved_date && (
          <div className="info-item">
            <span className="info-label">Fecha de Aprobación:</span> {new Date(workPlan.approved_date).toLocaleDateString('es-ES')}
          </div>
        )}
      </div>

      <div className="info-section">
        <div className="section-title">Asignación de Horas por Producto</div>
        {organizedData.length === 0 ? (
          <p>No hay asignaciones de horas</p>
        ) : (
          <table className="assignments-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>EJE ESTRATÉGICO</th>
                <th style={{ width: '30%' }}>ACCIÓN</th>
                <th style={{ width: '35%' }}>PRODUCTO</th>
                <th style={{ width: '10%' }}>HORAS</th>
              </tr>
            </thead>
            <tbody>
              {organizedData.map(axis => {
                const totalAxisProducts = axis.actions.reduce((sum: number, action: any) => sum + action.products.length, 0);
                let axisRowIndex = 0;
                
                return axis.actions.map((action: any, actionIndex: number) => 
                  action.products.map((product: any, productIndex: number) => {
                    const isFirstActionRow = productIndex === 0;
                    const isFirstAxisRow = axisRowIndex === 0;
                    const actionRowspan = action.products.length;
                    
                    axisRowIndex++;
                    
                    return (
                      <tr key={`${axis.id}-${action.id}-${product.id}`}>
                        {isFirstAxisRow && (
                          <td rowSpan={totalAxisProducts} className="axis-cell">
                            <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
                              {axis.code} - {axis.name}
                            </div>
                          </td>
                        )}
                        {isFirstActionRow && (
                          <td rowSpan={actionRowspan} style={{ fontSize: '9pt', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 'bold' }}>{action.code}</div>
                            <div>{action.name}</div>
                          </td>
                        )}
                        <td style={{ fontSize: '9pt' }}>{product.name}</td>
                        <td className="hours-cell">{product.assigned_hours}</td>
                      </tr>
                    );
                  })
                );
              })}
              <tr className="total-row">
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL:</td>
                <td className="hours-cell" style={{ fontSize: '12pt' }}>{totalHours}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="print-footer">
        <p>Documento generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
      </div>
    </div>
  );
}