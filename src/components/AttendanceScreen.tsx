
import React, { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Users, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { AppData } from '../types/timetable';
import { getDailyAttendanceStatus } from '../utils/storage';
import { cn } from '@/lib/utils';

interface AttendanceScreenProps {
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ appData }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Calculate overall statistics
  const calculateOverallStats = () => {
    const subjects = Object.keys(appData.attendance || {});
    let totalClasses = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    subjects.forEach(subject => {
      const attendance = appData.attendance[subject];
      if (attendance) {
        totalClasses += attendance.total;
        totalPresent += attendance.present;
        totalAbsent += attendance.total - attendance.present;
      }
    });

    const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
    
    return {
      totalClasses,
      totalPresent,
      totalAbsent,
      percentage,
      subjects: subjects.length
    };
  };

  // Get attendance for a specific date
  const getDateAttendance = (date: Date) => {
    const dateStr = date.toDateString();
    const dailyAttendance = appData.dailyAttendance?.[dateStr] || {};
    
    let present = 0;
    let absent = 0;
    
    Object.values(dailyAttendance).forEach(status => {
      if (status === 'present') present++;
      if (status === 'absent') absent++;
    });
    
    return { present, absent, total: present + absent };
  };

  // Get classes for selected date
  const getSelectedDateClasses = () => {
    const dayName = format(selectedDate, 'EEEE');
    const classes = appData.timetable.filter(entry => entry.day === dayName);
    
    return classes.map(classEntry => {
      const status = getDailyAttendanceStatus(
        appData.dailyAttendance || {},
        classEntry.subject,
        selectedDate.toDateString(),
        classEntry.id
      );
      
      return {
        ...classEntry,
        status
      };
    });
  };

  const stats = calculateOverallStats();
  const selectedDateClasses = getSelectedDateClasses();

  // Custom day renderer for calendar
  const renderDay = (day: Date) => {
    const attendance = getDateAttendance(day);
    const isSelected = isSameDay(day, selectedDate);
    
    let dayClass = "relative w-full h-full flex items-center justify-center text-sm";
    
    if (attendance.total > 0) {
      const allPresent = attendance.present === attendance.total;
      const hasAbsent = attendance.absent > 0;
      
      if (allPresent && attendance.total > 0) {
        dayClass += " bg-attendance-good/20 text-attendance-good";
      } else if (hasAbsent) {
        dayClass += " bg-attendance-danger/20 text-attendance-danger";
      }
    }
    
    return (
      <div className={dayClass}>
        <span>{format(day, 'd')}</span>
        {attendance.total > 0 && (
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-current opacity-60" />
        )}
      </div>
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Attendance Calendar
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.subjects}</div>
            <p className="text-sm text-muted-foreground">Subjects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-attendance-good/10">
              <TrendingUp className="w-6 h-6 text-attendance-good" />
            </div>
            <div className="text-2xl font-bold text-attendance-good">{stats.totalPresent}</div>
            <p className="text-sm text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-attendance-danger/10">
              <Users className="w-6 h-6 text-attendance-danger" />
            </div>
            <div className="text-2xl font-bold text-attendance-danger">{stats.totalAbsent}</div>
            <p className="text-sm text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-accent">
              <Clock className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Overall Attendance</h3>
            <Badge 
              variant={stats.percentage >= 75 ? "default" : "destructive"}
              className="text-lg px-3 py-1"
            >
              {stats.percentage}%
            </Badge>
          </div>
          <Progress value={stats.percentage} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-attendance-good">{stats.totalPresent}</div>
              <div className="text-sm text-muted-foreground">Attended</div>
            </div>
            <div>
              <div className="text-xl font-bold text-attendance-danger">{stats.totalAbsent}</div>
              <div className="text-sm text-muted-foreground">Missed</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{stats.totalClasses}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            components={{
              Day: ({ date }) => renderDay(date)
            }}
          />
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-attendance-good/20 border border-attendance-good" />
              <span>All Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-attendance-danger/20 border border-attendance-danger" />
              <span>Has Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted border border-border" />
              <span>No Classes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDateClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Classes on {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateClasses.map((classEntry, index) => (
                <div 
                  key={`${classEntry.id}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="font-medium">{classEntry.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {classEntry.time} • {classEntry.room}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      classEntry.status === 'present' ? 'default' : 
                      classEntry.status === 'absent' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {classEntry.status === 'present' ? 'Present' : 
                     classEntry.status === 'absent' ? 'Absent' : 
                     'Not Marked'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceScreen;
