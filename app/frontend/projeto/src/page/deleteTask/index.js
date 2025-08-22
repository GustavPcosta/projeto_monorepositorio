
import { useState } from 'react';
import api from '../../services/api';
  
function ModalDelete({ task, onConfirm, onCancel}) {
 
 const [loading, setLoading] = useState(false);

 
 
    return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirmar Exclusão</h3>
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja excluir a tarefa "{task.name}"?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Não
          </button>
          <button
            onClick={() => onConfirm(task.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Sim, Excluir'}
          </button>
        </div>
      </div>
    </div>
    )


}

export default ModalDelete;