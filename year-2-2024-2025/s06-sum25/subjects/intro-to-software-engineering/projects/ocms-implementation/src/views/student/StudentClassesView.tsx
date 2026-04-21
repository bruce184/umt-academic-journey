import React from 'react';

// StudentClassesView - Giao diện studentclasses cho admin (View trong MVC)
const StudentClassesView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Classes</h1>
        <p className="text-gray-600">View your enrolled classes and course materials</p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Classes Management</h3>
          <p className="text-gray-600">This page will show your enrolled classes with Tests, Grades, Materials, and Class Details.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentClassesView;