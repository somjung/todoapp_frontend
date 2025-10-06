import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import CollectionView from './CollectionView';
import NewCollectionModal from './NewCollectionModal';

function Dashboard({ onLogout }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCollections();
      if (response.success) {
        setCollections(response.data);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (name, description) => {
    try {
      const response = await apiService.createCollection(name, description);
      if (response.success) {
        setCollections([...collections, response.data]);
        setShowNewCollection(false);
        return { success: true };
      } else {
        console.error('Failed to create collection:', response.message);
        return { success: false, error: response.message || 'Failed to create collection' };
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  if (selectedCollection) {
    return (
      <CollectionView 
        collection={selectedCollection}
        onBack={() => {
          setSelectedCollection(null);
          // Reload collections to reflect any changes (like deletion)
          loadCollections();
        }}
        onLogout={onLogout}
        onUpdateCollection={(updatedCollection) => {
          setSelectedCollection(updatedCollection);
          // Update in collections list too
          setCollections(collections.map(c => 
            c.id === updatedCollection.id ? updatedCollection : c
          ));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collections Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Collections</h2>
            <button
              onClick={() => setShowNewCollection(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + New Collection
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading collections...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
              <p className="text-gray-600">Create your first collection to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => (
                <div
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{collection.todos?.length || 0} tasks</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Collection Modal */}
      {showNewCollection && (
        <NewCollectionModal
          onClose={() => setShowNewCollection(false)}
          onCreate={createCollection}
        />
      )}
    </div>
  );
}

export default Dashboard;