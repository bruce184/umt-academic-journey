import React, { useState, useEffect } from 'react';
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

// StudentAttendanceView - Giao diện điểm danh cho student (View trong MVC)
const StudentAttendanceView: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false); // Unused for now
  // const currentUser = AuthController.getCurrentUser(); // Unused for now

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = () => {
    // Mock attendance history data
    const mockHistory = [
      {
        id: '1',
        date: '2024-01-15',
        course: 'Introduction to Computer Science',
        class: 'CS101 - A101',
        time: '09:00',
        status: 'present'
      },
      {
        id: '2',
        date: '2024-01-14',
        course: 'Data Structures and Algorithms',
        class: 'CS201 - B202',
        time: '14:00',
        status: 'present'
      },
      {
        id: '3',
        date: '2024-01-13',
        course: 'Introduction to Computer Science',
        class: 'CS101 - A101',
        time: '09:00',
        status: 'late'
      }
    ];
    setAttendanceHistory(mockHistory);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanStatus('scanning');
    setScanResult(null);

    // Simulate QR code scanning
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        setScanResult('Attendance recorded successfully!');
        setScanStatus('success');
        // Add to history
        const newRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          course: 'Introduction to Computer Science',
          class: 'CS101 - A101',
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'present'
        };
        setAttendanceHistory(prev => [newRecord, ...prev]);
      } else {
        setScanResult('Invalid QR code or class not found.');
        setScanStatus('error');
      }
      
      setIsScanning(false);
    }, 2000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setScanStatus('idle');
    setScanResult(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'late':
        return 'text-yellow-600 bg-yellow-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'late':
        return <AlertCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance</h1>
        <p className="text-gray-600">
          Scan QR codes to record your attendance for classes.
        </p>
      </div>

      {/* QR Scanner Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="mb-6">
            <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              QR Code Scanner
            </h2>
            <p className="text-gray-600">
              Point your camera at the QR code displayed in class
            </p>
          </div>

          {/* Scanner Interface */}
          <div className="max-w-md mx-auto">
            <div className="relative bg-gray-100 rounded-lg p-8 mb-6">
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-pulse">
                    <Camera className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                  </div>
                  <p className="text-sm text-gray-600">Scanning QR code...</p>
                  <button
                    onClick={handleStopScan}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Stop Scanning
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Camera ready for scanning
                    </p>
                    <button
                      onClick={handleStartScan}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Start Scanning
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div className={`p-4 rounded-md ${
                scanStatus === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {scanStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <p className={`text-sm ${
                    scanStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {scanResult}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
        </div>
        <div className="p-6">
          {attendanceHistory.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your attendance records will appear here after scanning QR codes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{record.course}</h3>
                      <p className="text-sm text-gray-500">{record.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{record.date}</p>
                    <p className="text-sm text-gray-500">{record.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceHistory.filter(r => r.status === 'present').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceHistory.filter(r => r.status === 'late').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceHistory.filter(r => r.status === 'absent').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceView; 