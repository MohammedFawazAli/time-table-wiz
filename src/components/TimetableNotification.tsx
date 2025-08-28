import React, { useState, useEffect } from 'react';
import { X, Pin, PinOff, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AppData, TimetableEntry } from '../types/timetable';

interface TimetableNotificationProps {
  appData: AppData;
}

interface NotificationSettings {
  mode: 'pin' | 'normal';
  dismissed: boolean;
  lastDate: string;
}

const STORAGE_KEY = 'timetable-notification-settings';

const TimetableNotification: React.FC<TimetableNotificationProps> = ({ appData }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { mode: 'normal', dismissed: false, lastDate: '' };
    } catch {
      return { mode: 'normal', dismissed: false, lastDate: '' };
    }
  });

  const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([]);

  const getCurrentDay = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getCurrentDate = (): string => {
    return new Date().toDateString();
  };

  const getTodayClasses = (): TimetableEntry[] => {
    const today = getCurrentDay();
    return appData.timetable
      .filter(entry => entry.day === today && entry.subject.trim() !== '')
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  useEffect(() => {
    const currentDate = getCurrentDate();
    const classes = getTodayClasses();
    
    // Check if date changed or app reopened
    if (settings.lastDate !== currentDate) {
      // New day - reset dismissed status and update classes
      const newSettings = {
        ...settings,
        dismissed: false,
        lastDate: currentDate
      };
      setSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }

    setTodayClasses(classes);
  }, [appData.timetable, settings.lastDate]);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const togglePinMode = () => {
    const newSettings: NotificationSettings = {
      ...settings,
      mode: settings.mode === 'pin' ? 'normal' : 'pin',
      dismissed: false // Reset dismissed status when changing mode
    };
    saveSettings(newSettings);
  };

  const dismissNotification = () => {
    if (settings.mode === 'normal') {
      const newSettings: NotificationSettings = {
        ...settings,
        dismissed: true
      };
      saveSettings(newSettings);
    }
  };

  const shouldShow = (): boolean => {
    if (todayClasses.length === 0) return false;
    if (settings.mode === 'pin') return true;
    return !settings.dismissed;
  };

  if (!shouldShow()) return null;

  return (
    <Card className="mx-4 mb-4 border-primary/20 bg-primary/5 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Today's Schedule</span>
            <Badge variant="secondary" className="text-xs">
              {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePinMode}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              {settings.mode === 'pin' ? (
                <Pin className="w-3 h-3 text-primary" />
              ) : (
                <PinOff className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
            
            {settings.mode === 'normal' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissNotification}
                className="h-6 w-6 p-0 hover:bg-primary/10"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {todayClasses.map((classItem, index) => (
            <React.Fragment key={`${classItem.day}-${classItem.time}-${index}`}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-1 text-xs text-primary font-medium min-w-[60px]">
                    <Clock className="w-3 h-3" />
                    {classItem.time}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">
                      {classItem.subject}
                    </div>
                    {classItem.room && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {classItem.room}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {index < todayClasses.length - 1 && (
                <Separator className="opacity-30" />
              )}
            </React.Fragment>
          ))}
        </div>

        {todayClasses.length === 0 && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            No classes scheduled for today
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimetableNotification;