/**
 * Constantes para unidades de medida estandarizadas
 * Sincronizadas con el backend (ENUM UnidadMedida)
 */
export const UNIDADES_MEDIDA = {
  GRAMOS: {
    value: 'GRAMOS',
    label: 'Gramos',
    abreviatura: 'g',
    descripcion: 'Peso en gramos'
  },
  MILILITROS: {
    value: 'MILILITROS',
    label: 'Mililitros',
    abreviatura: 'ml',
    descripcion: 'Volumen en mililitros'
  },
  UNIDADES: {
    value: 'UNIDADES',
    label: 'Unidades',
    abreviatura: 'u',
    descripcion: 'Cantidad en unidades'
  }
};

/**
 * Obtener opciones para select
 */
export const getUnidadesMedidaOptions = () => {
  return Object.values(UNIDADES_MEDIDA).map(unidad => ({
    value: unidad.value,
    label: `${unidad.label} (${unidad.abreviatura})`,
    abreviatura: unidad.abreviatura
  }));
};

/**
 * Obtener unidad por valor
 */
export const getUnidadMedidaByValue = (value) => {
  return UNIDADES_MEDIDA[value] || null;
};

/**
 * Obtener abreviatura por valor
 */
export const getAbreviaturaByValue = (value) => {
  const unidad = getUnidadMedidaByValue(value);
  return unidad ? unidad.abreviatura : value;
};

/**
 * Obtener label por valor
 */
export const getLabelByValue = (value) => {
  const unidad = getUnidadMedidaByValue(value);
  return unidad ? unidad.label : value;
};
