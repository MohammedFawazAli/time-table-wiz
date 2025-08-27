
import React from 'react';
import { Clock, MapPin, CheckCircle, XCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppData, TimetableEntry } from '../types/timetable';
import { markAttendance, getDailyAttendanceStatus } from '../utils/storage';

interface TodayScreenProps {
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
}

const TodayScreen: React.FC<TodayScreenProps> = ({ appData, onDataUpdate }) => {
  const getCurrentDay = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getTodayClasses = (): TimetableEntry[] => {
    const today = getCurrentDay();
    return appData.timetable
      .filter(entry => entry.day.toLowerCase() === today.toLowerCase())
      .sort((a, b) => {
        // Sort by time
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return timeA.localeCompare(timeB);
      });
  };

  const getAttendanceStatus = (subject: string): 'none' | 'present' | 'absent' => {
    if (!appData.dailyAttendance) return 'none';
    return getDailyAttendanceStatus(appData.dailyAttendance, subject);
  };

  const handleAttendanceToggle = (subject: string, currentStatus: 'none' | 'present' | 'absent') => {
    let newStatus: 'present' | 'absent';
    
    if (currentStatus === 'none' || currentStatus === 'absent') {
      newStatus = 'present';
    } else {
      newStatus = 'absent';
    }

    const isPresent = newStatus === 'present';
    const updatedData = markAttendance(appData, subject, isPresent);
    onDataUpdate(updatedData);
  };

  const todayClasses = getTodayClasses();
  const currentDay = getCurrentDay();

  if (todayClasses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No classes today</h3>
          <p className="text-muted-foreground text-center">
            {appData.timetable.length === 0 
              ? "Upload your timetable to see today's schedule" 
              : `No classes scheduled for ${currentDay}`
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Classes - {currentDay}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tap to mark attendance: First tap = Present, Second tap = Absent
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {todayClasses.map((classItem, index) => {
          const attendanceStatus = getAttendanceStatus(classItem.subject);
          
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Time */}
                  <div className="bg-primary text-primary-foreground p-4 min-w-[80px] text-center">
                    <div className="font-semibold text-sm">{classItem.time}</div>
                  </div>
                  
                  {/* Subject and Room */}
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-base">{classItem.subject}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      {classItem.room || 'No room specified'}
                    </div>
                  </div>
                  
                  {/* Attendance Button */}
                  <div className="p-4">
                    <Button
                      variant={attendanceStatus === 'present' ? "default" : 
                              attendanceStatus === 'absent' ? "destructive" : "outline"}
                      size="sm"
                      className="min-w-[100px] gap-2"
                      onClick={() => handleAttendanceToggle(classItem.subject, attendanceStatus)}
                    >
                      {attendanceStatus === 'present' && (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Present
                        </>
                      )}
                      {attendanceStatus === 'absent' && (
                        <>
                          <XCircle className="w-4 h-4" />
                          Absent
                        </>
                      )}
                      {attendanceStatus === 'none' && (
                        <>
                          <Circle className="w-4 h-4" />
                          Mark
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TodayScreen;
