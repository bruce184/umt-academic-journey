import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';
import { CourseController } from '../../controllers/CourseController';
import { Class } from '../../models';

const LecturerScheduleView: React.FC = () => {
  const [currentUser] = useState(AuthController.getCurrentUser());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = () => {
    // Load classes taught by this lecturer
    const lecturerClasses = CourseController.getClassesByLecturer(currentUser?.userId || '');
    setClasses(lecturerClasses);
    setLoading(false);
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
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getClassesForDay = (dayName: string) => {
    // Mock filter - in real app would check actual schedule
    return classes.filter(cls => {
      return cls.courseName.includes('Computer Science') || cls.courseName.includes('Data Structures');
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Teaching Schedule</h1>
        <p className="text-gray-600">
          View your weekly teaching schedule and manage your classes.
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
                      <div className="w-full h-full bg-blue-100 rounded p-2 text-left">
                        <div className="text-xs font-medium text-blue-800 truncate">
                          {classForSlot.courseName}
                        </div>
                        <div className="text-xs text-blue-600">
                          9:00 AM - 10:30 AM
                        </div>
                        <div className="text-xs text-blue-600 truncate">
                          Room 101
                        </div>
                      </div>
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
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{cls.courseName}</h3>
                        <p className="text-sm text-gray-500">
                          9:00 AM - 10:30 AM • Room 101
                        </p>
                        <p className="text-sm text-gray-500">
                          {cls.currentEnrollment} students enrolled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">
                        Start Class
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes This Week</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {getWeekDays().slice(1, 6).map((day, index) => {
              const dayClasses = getClassesForDay(getDayName(day));
              if (dayClasses.length === 0) return null;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {getDayName(day)}, {getDayNumber(day)}
                  </h3>
                  <div className="space-y-2">
                    {dayClasses.map((cls) => (
                      <div key={cls.classId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">9:00 AM - 10:30 AM</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-900">{cls.courseName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Room 101</span>
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{cls.currentEnrollment} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerScheduleView;