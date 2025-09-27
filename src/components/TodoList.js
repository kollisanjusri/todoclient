import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { Search, Filter, Plus, BarChart3 } from 'lucide-react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    category: 'All',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'All') params.append('status', filters.status);
      if (filters.category !== 'All') params.append('category', filters.category);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`/api/todos?${params}`);
      setTodos(response.data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/todos/stats/summary');
      setStats(response.data.summary);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [filters]);

  // Create todo
  const handleCreate = async (todoData) => {
    try {
      const response = await axios.post('/api/todos', todoData);
      setTodos(prev => [response.data.todo, ...prev]);
      setShowForm(false);
      fetchStats();
      toast.success('Todo created successfully');
    } catch (error) {
      console.error('Error creating todo:', error);
      toast.error(error.response?.data?.message || 'Failed to create todo');
    }
  };

  // Update todo
  const handleUpdate = async (id, updateData, isEdit = false) => {
    if (isEdit) {
      const todo = todos.find(t => t._id === id);
      setEditingTodo(todo);
      setShowForm(true);
      return;
    }

    try {
      const response = await axios.put(`/api/todos/${id}`, updateData);
      setTodos(prev => prev.map(todo => 
        todo._id === id ? response.data.todo : todo
      ));
      fetchStats();
      toast.success('Todo updated successfully');
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error(error.response?.data?.message || 'Failed to update todo');
    }
  };

  // Delete todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo._id !== id));
      fetchStats();
      toast.success('Todo deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error(error.response?.data?.message || 'Failed to delete todo');
    }
  };

  // Handle form submission
  const handleFormSubmit = (todoData) => {
    if (editingTodo) {
      handleUpdate(editingTodo._id, todoData);
      setEditingTodo(null);
    } else {
      handleCreate(todoData);
    }
    setShowForm(false);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  // Get unique categories
  const categories = ['All', ...new Set(todos.map(todo => todo.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Todos</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your tasks efficiently</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Todo</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-primary-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">P</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold">IP</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-bold">C</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search todos..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input-field"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className="input-field"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No todos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.search || filters.status !== 'All' || filters.category !== 'All'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first todo'
              }
            </p>
          </div>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingTodo}
          isEditing={!!editingTodo}
        />
      )}
    </div>
  );
};

export default TodoList;



