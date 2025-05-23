// src/components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // <--- DÉCOMMENTEZ CET IMPORT
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader /> {/* <--- DÉCOMMENTEZ CETTE LIGNE */}

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;