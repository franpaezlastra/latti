import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadInsumos, createInsumo, deleteInsumo } from '../../../store/actions/insumoActions.js';
import { toast } from 'react-hot-toast';

const InsumosList = () => {
  const dispatch = useDispatch();
  const { insumos, status, error, createStatus, deleteStatus } = useSelector((state) => state.insumos);

  useEffect(() => {
    // Cargar insumos al montar el componente
    dispatch(loadInsumos());
  }, [dispatch]);

  const handleCreateInsumo = async (insumoData) => {
    try {
      await dispatch(createInsumo(insumoData)).unwrap();
      toast.success('Insumo creado exitosamente');
      // Recargar la lista después de crear
      dispatch(loadInsumos());
    } catch (error) {
      toast.error(error || 'Error al crear el insumo');
    }
  };

  const handleDeleteInsumo = async (id) => {
    try {
      await dispatch(deleteInsumo(id)).unwrap();
      toast.success('Insumo eliminado exitosamente');
    } catch (error) {
      toast.error(error || 'Error al eliminar el insumo');
    }
  };

  if (status === 'loading') {
    return <div className="text-center py-8">Cargando insumos...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-maderon">Insumos</h2>
        <button
          onClick={() => handleCreateInsumo({
            nombre: 'Nuevo Insumo',
            descripcion: 'Descripción del insumo',
            stock: 100
          })}
          disabled={createStatus === 'loading'}
          className="btn btn-primary"
        >
          {createStatus === 'loading' ? 'Creando...' : 'Crear Insumo'}
        </button>
      </div>

      <div className="grid gap-4">
        {insumos.map((insumo) => (
          <div key={insumo.id} className="card p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{insumo.nombre}</h3>
                <p className="text-gray-600">{insumo.descripcion}</p>
                <p className="text-sm text-gray-500">Stock: {insumo.stock}</p>
              </div>
              <button
                onClick={() => handleDeleteInsumo(insumo.id)}
                disabled={deleteStatus === 'loading'}
                className="btn btn-danger"
              >
                {deleteStatus === 'loading' ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {insumos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay insumos disponibles
        </div>
      )}
    </div>
  );
};

export default InsumosList; 