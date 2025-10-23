import React from "react";
import DataTable from "./DataTable";

// Componente Tabla mantenido para compatibilidad hacia atrás
// Ahora es un wrapper del nuevo DataTable
const Tabla = ({
  columnas = [],
  datos = [],
  renderFila,
  columnasAcciones = [],
  mensajeVacio = "No hay datos disponibles",
  ...props
}) => {
  // Mapear props del componente Tabla al DataTable
  const dataTableProps = {
    data: datos,
    columns: columnas,
    actions: columnasAcciones,
    emptyMessage: mensajeVacio,
    ...props
  };

  return <DataTable {...dataTableProps} />;
};

export default Tabla; 