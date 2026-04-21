import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseController } from '../../controllers/CourseController';
import { AuthController } from '../../controllers/AuthController';
import { Class } from '../../models';

// StudentScheduleView - Giao diện lịch học cho student (View trong MVC)
const StudentScheduleView: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // const currentUser = AuthController.getCurrentUser(); // Unused for now

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = () => {
    setLoading(true);
    try {
      // Load classes for current user
      const userClasses = CourseController.getClassesForCurrentUser();
      setClasses(userClasses);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getClassesForDay = (dayName: string) => {
    // Mock filter - in real app would filter by schedule
    return classes;
  };

  // const getTimeSlot = (time: string) => {
  //   return time.substring(0, 5); // Format: HH:MM
  // };

  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleClassClick = (cls: Class) => {
    setSelectedClass(cls);
  };

  const closeModal = () => {
    setSelectedClass(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Schedule</h1>
        <p className="text-gray-600">
          View your weekly class schedule and manage your time effectively.
        </p>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {currentWeek.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-8 gap-4">
          {/* Time slots column */}
          <div className="space-y-4">
            <div className="h-12"></div> {/* Header spacer */}
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-20 text-xs text-gray-500 flex items-center justify-center">
                {i + 8}:00
              </div>
            ))}
          </div>

          {/* Days columns */}
          {getWeekDays().map((day, dayIndex) => (
            <div key={dayIndex} className="space-y-4">
              {/* Day header */}
              <div className={`h-12 flex flex-col items-center justify-center rounded-lg ${
                isToday(day) ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700'
              }`}>
                <span className="text-xs font-medium">{getDayName(day)}</span>
                <span className="text-sm font-bold">{getDayNumber(day)}</span>
              </div>

              {/* Time slots */}
              {Array.from({ length: 12 }, (_, timeIndex) => {
                const hour = timeIndex + 8;
                const dayName = getDayName(day);
                const dayClasses = getClassesForDay(dayName);
                const classForSlot = dayClasses.find(cls => {
                  // Mock time slot - in real app would check actual schedule
                  return hour === 9; // Show class at 9 AM
                });

                return (
                  <div key={timeIndex} className="h-20 border border-gray-200 rounded-lg p-1">
                    {classForSlot && (
                      <button
                        onClick={() => handleClassClick(classForSlot)}
                        className="w-full h-full bg-green-100 hover:bg-green-200 rounded p-2 text-left transition-colors"
                      >
                        <div className="text-xs font-medium text-green-800 truncate">
                          {classForSlot.courseName}
                        </div>
                        <div className="text-xs text-green-600">
                          9:00 AM - 10:30 AM
                        </div>
                        <div className="text-xs text-green-600 truncate">
                          Room 101
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
        </div>
        <div className="p-6">
          {(() => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const todayClasses = getClassesForDay(today);
            
            if (todayClasses.length === 0) {
              return (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No classes today</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enjoy your free time!
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div key={cls.classId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{cls.courseName}</h3>
                        <p className="text-sm text-gray-500">
                          9:00 AM - 10:30 AM • Room 101
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClassClick(cls)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Class Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedClass.courseName}</h4>
                <p className="text-sm text-gray-500">Course Code: CS101</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  9:00 AM - 10:30 AM
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedClass.semesterCode} {selectedClass.year}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Room 101, Building A
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Dr. John Smith
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enrolled Students:</span>
                  <span className="font-medium">{selectedClass.currentEnrollment}/{selectedClass.capacity}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                View Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentScheduleView; 