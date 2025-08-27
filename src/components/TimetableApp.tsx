
import React, { useState, useEffect } from 'react';
import { Home, Calendar, BarChart3, BookOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppData } from '../types/timetable';
import { loadData, saveData } from '../utils/storage';
import UploadScreen from './UploadScreen';
import TimetableScreen from './TimetableScreen';
import AttendanceScreen from './AttendanceScreen';
import TodayScreen from './TodayScreen';
import SubjectsScreen from './SubjectsScreen';

type Tab = 'today' | 'timetable' | 'calendar' | 'subjects' | 'upload';

const TimetableApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [appData, setAppData] = useState<AppData>({ timetable: [], attendance: {} });

  useEffect(() => {
    const data = loadData();
    setAppData(data);
    
    // If there's no timetable data, show upload tab by default
    if (data.timetable.length === 0) {
      setActiveTab('upload');
    }
  }, []);

  const handleDataUpdate = (newData: AppData) => {
    setAppData(newData);
    saveData(newData);
  };

  const tabs = [
    { id: 'today' as Tab, label: 'Today', icon: Home },
    { id: 'timetable' as Tab, label: 'Timetable', icon: Calendar },
    { id: 'calendar' as Tab, label: 'Calendar', icon: Calendar },
    { id: 'subjects' as Tab, label: 'Subjects', icon: BookOpen },
    { id: 'upload' as Tab, label: 'Upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto pb-20">
        {/* Header */}
        <div className="text-center p-4 bg-card border-b">
          <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground text-sm">Manage your schedule and attendance</p>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[calc(100vh-140px)]">
          {activeTab === 'today' && (
            <TodayScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
            />
          )}
          {activeTab === 'timetable' && (
            <TimetableScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
            />
          )}
          {activeTab === 'calendar' && (
            <AttendanceScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
            />
          )}
          {activeTab === 'subjects' && (
            <SubjectsScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
            />
          )}
          {activeTab === 'upload' && (
            <UploadScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
              onSuccess={() => setActiveTab('today')}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t">
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="flex-1 rounded-none h-16 flex-col gap-1"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableApp;
