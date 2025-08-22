import './styles.css';
import api from '../api/api';
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, ArrowUp, ArrowDown } from 'lucide-react';

const TaskManagementSystem = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    cost: '',
    dueDate: ''
  });

  // Buscar todas as tarefas
  async function fetchTasks() {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      
      // Extrair dados da resposta conforme estrutura da API
      if (response.data && response.data.data) {
        setTasks(response.data.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      alert('Erro ao buscar tarefas. Tente novamente mais tarde.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // Criar nova tarefa
  async function createTask(taskData) {
    try {
      setLoading(true);
      const response = await api.post('/tasks', taskData);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      
      // Tratar erros específicos do backend
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          alert(`Erro: ${error.response.data.message.join(', ')}`);
        } else {
          alert(`Erro: ${error.response.data.message}`);
        }
      } else {
        alert('Erro ao criar tarefa. Tente novamente.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Atualizar tarefa
  async function updateTask(taskId, taskData) {
    try {
      setLoading(true);
      const response = await api.patch(`/tasks/${taskId}`, taskData);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          alert(`Erro: ${error.response.data.message.join(', ')}`);
        } else {
          alert(`Erro: ${error.response.data.message}`);
        }
      } else {
        alert('Erro ao atualizar tarefa. Tente novamente.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Deletar tarefa
  async function deleteTask(taskId) {
    try {
      setLoading(true);
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      
      if (error.response?.data?.message) {
        alert(`Erro: ${error.response.data.message}`);
      } else {
        alert('Erro ao deletar tarefa. Tente novamente.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // Ordenar tarefas por ordem de apresentação
  const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleAddTask = async () => {
    if (!newTask.name.trim() || !newTask.cost || !newTask.dueDate) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Verificar se já existe uma tarefa com o mesmo nome (localmente)
    if (tasks.some(task => task.name.toLowerCase() === newTask.name.toLowerCase())) {
      alert('Já existe uma tarefa com este nome.');
      return;
    }

    const taskData = {
      name: newTask.name.trim(),
      cost: parseFloat(newTask.cost),
      dueDate: newTask.dueDate
    };

    const createdTask = await createTask(taskData);
    
    if (createdTask) {
      // Adicionar ordem localmente se não vier da API
      const taskWithOrder = {
        ...createdTask,
        order: Math.max(...tasks.map(t => t.order || 0), 0) + 1
      };
      setTasks([...tasks, taskWithOrder]);
      setNewTask({ name: '', cost: '', dueDate: '' });
      setShowAddForm(false);
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    // Verificar se o novo nome já existe (exceto na tarefa atual)
    const existingTask = tasks.find(task => 
      task.id !== taskId && 
      task.name.toLowerCase() === updatedData.name.toLowerCase()
    );

    if (existingTask) {
      alert('Já existe uma tarefa com este nome.');
      return false;
    }

    const taskData = {
      name: updatedData.name.trim(),
      cost: parseFloat(updatedData.cost),
      dueDate: updatedData.dueDate
    };

    const updatedTask = await updateTask(taskId, taskData);
    
    if (updatedTask) {
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      setEditingTask(null);
      return true;
    }
    
    return false;
  };

  const handleDeleteTask = async (taskId) => {
    const result = await deleteTask(taskId);
    
    if (result) {
      setTasks(tasks.filter(task => task.id !== taskId));
      setDeleteConfirm(null);
    }
  };

  const handleMoveTask = async (taskId, direction) => {
    const currentIndex = sortedTasks.findIndex(task => task.id === taskId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= sortedTasks.length) return;

    const currentTask = sortedTasks[currentIndex];
    const targetTask = sortedTasks[targetIndex];

    // Atualizar apenas os campos permitidos pela API (sem order)
    const updatedCurrentTask = await updateTask(currentTask.id, {
      name: currentTask.name,
      cost: currentTask.cost,
      dueDate: currentTask.dueDate
    });

    const updatedTargetTask = await updateTask(targetTask.id, {
      name: targetTask.name,
      cost: targetTask.cost,
      dueDate: targetTask.dueDate
    });

    if (updatedCurrentTask && updatedTargetTask) {
      // Atualizar o estado local trocando as ordens
      const newTasks = tasks.map(task => {
        if (task.id === currentTask.id) {
          return { ...updatedCurrentTask, order: targetTask.order || 0 };
        }
        if (task.id === targetTask.id) {
          return { ...updatedTargetTask, order: currentTask.order || 0 };
        }
        return task;
      });
      setTasks(newTasks);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const EditTaskForm = ({ task, onSave, onCancel }) => {
    const [editData, setEditData] = useState({
      name: task.name,
      cost: task.cost.toString(),
      dueDate: task.dueDate
    });

    const handleSave = () => {
      if (!editData.name.trim() || !editData.cost || !editData.dueDate) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      onSave(task.id, editData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Editar Tarefa</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Tarefa
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={editData.cost}
                onChange={(e) => setEditData({ ...editData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Limite
              </label>
              <input
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              <X size={16} className="inline mr-1" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <Check size={16} className="inline mr-1" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = ({ task, onConfirm, onCancel }) => (
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
  );

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Sistema Lista de Tarefas
        </h1>

        {/* Lista de Tarefas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Lista de Tarefas</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedTasks.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhuma tarefa cadastrada
              </div>
            ) : (
              sortedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    task.cost >= 1000 ? 'bg-yellow-100 hover:bg-yellow-200' : ''
                  }`}
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-500">Nome da Tarefa</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(task.cost)}</p>
                      <p className="text-sm text-gray-500">Custo</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(task.dueDate)}</p>
                      <p className="text-sm text-gray-500">Data Limite</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {/* Botões de ordenação */}
                    <button
                      onClick={() => handleMoveTask(task.id, 'up')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                      title="Mover para cima"
                      disabled={index === 0 || loading}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveTask(task.id, 'down')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                      title="Mover para baixo"
                      disabled={index === sortedTasks.length - 1 || loading}
                    >
                      <ArrowDown size={16} />
                    </button>
                    
                    {/* Botões de ação */}
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                      title="Editar tarefa"
                      disabled={loading}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(task)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                      title="Excluir tarefa"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botão Incluir */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              <Plus size={20} className="mr-2" />
              Incluir Nova Tarefa
            </button>
          </div>
        </div>

        {/* Formulário de Inclusão */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Incluir Nova Tarefa</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Tarefa
                  </label>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Digite o nome da tarefa"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTask.cost}
                    onChange={(e) => setNewTask({ ...newTask, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTask({ name: '', cost: '', dueDate: '' });
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  <X size={16} className="inline mr-1" />
                  Cancelar
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  <Check size={16} className="inline mr-1" />
                  {loading ? 'Incluindo...' : 'Incluir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {editingTask && (
          <EditTaskForm
            task={editingTask}
            onSave={handleEditTask}
            onCancel={() => setEditingTask(null)}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {deleteConfirm && (
          <DeleteConfirmModal
            task={deleteConfirm}
            onConfirm={handleDeleteTask}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManagementSystem;