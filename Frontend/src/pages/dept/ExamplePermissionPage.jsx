"use client"

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PermissionGuard from '../../components/common/PermissionGuard';
import PermissionButton from '../../components/common/PermissionButton';
import { FEATURES, PERMISSIONS } from '../../utils/permissionUtils';
import { Plus, Edit, Trash, Eye } from 'lucide-react';

const ExamplePermissionPage = () => {
  const { permissions } = useAuth();
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', description: 'Description for Item 1' },
    { id: 2, name: 'Item 2', description: 'Description for Item 2' },
    { id: 3, name: 'Item 3', description: 'Description for Item 3' },
  ]);

  // Example functions for CRUD operations
  const handleView = (id) => {
    alert(`Viewing item ${id}`);
  };

  const handleAdd = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, name: `Item ${newId}`, description: `Description for Item ${newId}` }]);
  };

  const handleEdit = (id) => {
    alert(`Editing item ${id}`);
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Permission Example - Inventory Management</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Inventory Items</h2>
          
          {/* Add button - requires WRITE permission */}
          <PermissionButton
            featureId={FEATURES.INVENTORY}
            permission={PERMISSIONS.WRITE}
            onClick={handleAdd}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Item
          </PermissionButton>
        </div>
        
        {/* Table - requires READ permission */}
        <PermissionGuard
          featureId={FEATURES.INVENTORY}
          permission={PERMISSIONS.READ}
          fallback={<div className="text-red-500">You don't have permission to view inventory items.</div>}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.id}</td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.name}</td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">{item.description}</td>
                    <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                      <div className="flex justify-center gap-2">
                        {/* View button - requires READ permission */}
                        <button
                          onClick={() => handleView(item.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {/* Edit button - requires UPDATE permission */}
                        <PermissionGuard
                          featureId={FEATURES.INVENTORY}
                          permission={PERMISSIONS.UPDATE}
                        >
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                        </PermissionGuard>
                        
                        {/* Delete button - requires DELETE permission */}
                        <PermissionGuard
                          featureId={FEATURES.INVENTORY}
                          permission={PERMISSIONS.DELETE}
                        >
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash size={18} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PermissionGuard>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissions?.roles?.map((role, roleIndex) => (
            <div key={roleIndex} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">{role.roleName}</h3>
              <div className="space-y-3">
                {role.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="border-t pt-2">
                    <p className="font-medium">{feature.name}</p>
                    <div className="flex gap-2 mt-1">
                      {feature.permissions.read && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
                          Read
                        </span>
                      )}
                      {feature.permissions.write && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded">
                          Write
                        </span>
                      )}
                      {feature.permissions.update && (
                        <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded">
                          Update
                        </span>
                      )}
                      {feature.permissions.delete && (
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded">
                          Delete
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamplePermissionPage; 