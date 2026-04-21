import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-4 px-6 text-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-primary font-bold text-sm">UMT</span>
        </div>
        <span className="text-sm font-medium">
          University of Management and Technology
        </span>
      </div>
      <p className="text-xs text-gray-300 mt-1">
        © 2024 OCMS - Online Course Management System. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer; 