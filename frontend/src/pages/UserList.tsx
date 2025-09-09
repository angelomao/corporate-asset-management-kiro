import React from 'react';
import { Card, Button } from '../components/ui';

export const UserList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>
        <Button>Add User</Button>
      </div>

      <Card>
        <div className="text-center py-8 text-gray-500">
          User management will be implemented in a future task
        </div>
      </Card>
    </div>
  );
};

export default UserList;