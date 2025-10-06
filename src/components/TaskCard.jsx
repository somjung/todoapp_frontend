import React, { useState } from 'react';
import AddMoneyModal from './AddMoneyModal';
import apiService from '../services/api';

function TaskCard({ task, displayInfo, onUpdateTaskMoney, onTaskDeleted, onTaskUpdated }) {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if task has failed (deadline passed)
  const isDeadlineFailed = displayInfo.type === 'DEADLINE' && 
    new Date() > new Date(displayInfo.dueDate) && !displayInfo.completed;

  // Check if saving goal is automatically completed
  const isSavingComplete = displayInfo.type === 'SAVING' && 
    displayInfo.currentAmount >= displayInfo.targetAmount;

  const handleToggleComplete = async () => {
    try {
      setIsUpdating(true);
      const newCompleted = !displayInfo.completed;
      
      const response = await apiService.updateTask(task.id, {
        title: displayInfo.title,
        description: displayInfo.description,
        completed: newCompleted
      });
      
      if (response.success) {
        // Call parent callback to refresh tasks list instead of page reload
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditTask = () => {
    setEditForm({ title: displayInfo.title, description: displayInfo.description });
    setShowEditModal(true);
  };

  const handleUpdateTask = async () => {
    try {
      const response = await apiService.updateTask(task.id, {
        title: editForm.title,
        description: editForm.description,
        completed: displayInfo.completed
      });
      
      if (response.success) {
        setShowEditModal(false);
        // Call parent callback to refresh tasks list instead of page reload
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await apiService.deleteTask(task.id);
      if (response.success) {
        setShowDeleteModal(false);
        // Call parent callback to refresh tasks list instead of page reload
        if (onTaskDeleted) {
          onTaskDeleted(task.id);
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  return (
    <>
      <div className={`task-card bg-white p-6 rounded-lg shadow-sm border-l-4 ${
        isDeadlineFailed ? 'border-red-500 bg-red-50' : 
        isSavingComplete ? 'border-green-500 bg-green-50' : 
        displayInfo.completed ? 'border-blue-500 bg-blue-50' : 
        `border-${displayInfo.color}-500`
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{displayInfo.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${
                  isDeadlineFailed ? 'text-red-900' : 
                  displayInfo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {displayInfo.title}
                  {isDeadlineFailed && <span className="ml-2 text-sm text-red-600 font-normal">(FAILED)</span>}
                  {isSavingComplete && <span className="ml-2 text-sm text-green-600 font-normal">(GOAL REACHED)</span>}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleEditTask}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className={`mt-1 ${
                displayInfo.completed ? 'text-gray-400 line-through' : 'text-gray-600'
              }`}>
                {displayInfo.description}
              </p>
              
              {/* Type-specific content */}
              {displayInfo.type === 'DEADLINE' && (
                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    isDeadlineFailed ? 'bg-red-100 text-red-800' :
                    displayInfo.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    Due: {new Date(displayInfo.dueDate).toLocaleDateString()} • {displayInfo.daysLeft}
                  </span>
                </div>
              )}
              
              {displayInfo.type === 'SAVING' && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>${displayInfo.currentAmount.toLocaleString()}</span>
                    <span>${displayInfo.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`progress-bar h-2 rounded-full ${
                        isSavingComplete ? 'bg-green-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(displayInfo.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-600">
                      {displayInfo.progress.toFixed(1)}% complete
                    </div>
                    {!isSavingComplete && (
                      <button
                        onClick={() => setShowAddMoney(true)}
                        className="bg-green-600 text-white px-3 py-1 text-xs rounded-full hover:bg-green-700 transition-colors"
                      >
                        + Add Money
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={displayInfo.completed || isSavingComplete}
              onChange={handleToggleComplete}
              disabled={isUpdating || isSavingComplete}
              className={`w-5 h-5 border-gray-300 rounded focus:ring-blue-500 ${
                isDeadlineFailed ? 'text-red-600' : 
                isSavingComplete ? 'text-green-600' : 'text-blue-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <AddMoneyModal
          task={task}
          onClose={() => setShowAddMoney(false)}
          onAddMoney={(amount) => {
            onUpdateTaskMoney(task.id, amount);
            setShowAddMoney(false);
          }}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Task
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={!editForm.title.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Task
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{displayInfo.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;