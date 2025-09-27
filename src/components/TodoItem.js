import React, { useState } from 'react';
import { Calendar, Tag, Edit2, Trash2, CheckCircle, Clock, Play } from 'lucide-react';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdate(todo._id, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await onDelete(todo._id);
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString();
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && todo.status !== 'Completed';
  };

  return (
    <div className={`card p-4 transition-all duration-200 hover:shadow-lg ${
      todo.status === 'Completed' ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${
              todo.status === 'Completed' ? 'line-through' : ''
            }`}>
              {todo.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
              {getStatusIcon(todo.status)}
              <span className="ml-1">{todo.status}</span>
            </span>
          </div>
          
          {todo.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {todo.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {todo.category && (
              <div className="flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>{todo.category}</span>
              </div>
            )}
            
            {todo.dueDate && (
              <div className={`flex items-center space-x-1 ${
                isOverdue(todo.dueDate) ? 'text-red-500 dark:text-red-400' : ''
              }`}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(todo.dueDate)}</span>
                {isOverdue(todo.dueDate) && (
                  <span className="text-xs font-medium">(Overdue)</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {/* Status Change Buttons */}
          {todo.status !== 'Completed' && (
            <button
              onClick={() => handleStatusChange('Completed')}
              disabled={isUpdating}
              className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
              title="Mark as completed"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          
          {todo.status === 'Pending' && (
            <button
              onClick={() => handleStatusChange('In Progress')}
              disabled={isUpdating}
              className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
              title="Start working on this"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          
          {todo.status === 'In Progress' && (
            <button
              onClick={() => handleStatusChange('Pending')}
              disabled={isUpdating}
              className="p-1 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
              title="Mark as pending"
            >
              <Clock className="h-4 w-4" />
            </button>
          )}
          
          {/* Edit Button */}
          <button
            onClick={() => onUpdate(todo._id, null, true)} // true indicates edit mode
            disabled={isUpdating}
            className="p-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
            title="Edit todo"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
            title="Delete todo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;



