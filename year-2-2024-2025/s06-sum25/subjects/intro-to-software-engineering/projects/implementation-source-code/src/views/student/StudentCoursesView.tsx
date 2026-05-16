import React from 'react';

// StudentCoursesView - Giao diện studentcourses cho admin (View trong MVC)
const StudentCoursesView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Manage your course enrollments</p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course Registration</h3>
          <p className="text-gray-600">This page will allow you to register for courses and view your enrolled courses.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesView;