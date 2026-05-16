import React from 'react';

// StudentProfileView - Giao diện studentprofile cho admin (View trong MVC)
const StudentProfileView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal information and settings</p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
          <p className="text-gray-600">This page will allow you to view and edit your profile information with tabs for General, Contact, and Cohort.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;