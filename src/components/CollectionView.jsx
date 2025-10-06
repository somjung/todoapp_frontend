import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import { TaskFactory } from '../models/TaskFactory';

function CollectionView({ collection, onBack, onLogout, onUpdateCollection }) {
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadTasks();
  }, [collection.id]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasksByCollection(collection.id);
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTaskToCollection = async (taskData) => {
    try {
      const response = await apiService.createTask(collection.id, taskData);
      if (response.success) {
        setTasks([...tasks, response.data]);
        setShowTaskForm(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskMoney = async (taskId, amount) => {
    try {
      const response = await apiService.addMoneyToTask(taskId, amount);
      if (response.success) {
        const updatedTasks = tasks.map(task => 
          task.id === taskId 
            ? { ...task, currentAmount: (task.currentAmount || 0) + amount }
            : task
        );
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error adding money to task:', error);
    }
  };

  const handleTaskDeleted = (taskId) => {
    // Remove the deleted task from the local state
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleTaskUpdated = () => {
    // Reload tasks to get updated data
    loadTasks();
  };

  const deleteCollection = async () => {
    try {
      const response = await apiService.deleteCollection(collection.id);
      if (response.success) {
        // Go back to dashboard after successful deletion
        onBack();
      } else {
        console.error('Failed to delete collection:', response.message);
        alert('Failed to delete collection. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Error deleting collection. Please try again.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditCollection = () => {
    setEditForm({ name: collection.name, description: collection.description || '' });
    setShowEditModal(true);
  };

  const updateCollection = async () => {
    try {
      const response = await apiService.updateCollection(collection.id, editForm.name, editForm.description);
      if (response.success) {
        onUpdateCollection(response.data);
        setShowEditModal(false);
      } else {
        console.error('Failed to update collection:', response.message);
        alert('Failed to update collection. Please try again.');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Error updating collection. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                <p className="text-gray-600">{collection.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Task
              </button>
              <button
                onClick={handleEditCollection}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Edit Collection
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(taskData => {
              const task = TaskFactory.createTask(taskData.type, taskData);
              const displayInfo = task.getDisplayInfo();
              
              return (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  displayInfo={displayInfo}
                  onUpdateTaskMoney={updateTaskMoney}
                  onTaskDeleted={handleTaskDeleted}
                  onTaskUpdated={handleTaskUpdated}
                />
              );
            })}
          </div>
        )}
      </div>

      {showTaskForm && (
        <TaskFormModal
          onClose={() => setShowTaskForm(false)}
          onSubmit={addTaskToCollection}
        />
      )}

      {/* Edit Collection Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Collection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter collection name"
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
                  placeholder="Enter collection description"
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
                onClick={updateCollection}
                disabled={!editForm.name.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              Delete Collection
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{collection.name}"? This action cannot be undone and will delete all tasks in this collection.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={deleteCollection}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionView;