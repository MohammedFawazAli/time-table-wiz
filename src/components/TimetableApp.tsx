
import React, { useState, useEffect } from 'react';
import { Upload, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppData } from '../types/timetable';
import { loadData, saveData } from '../utils/storage';
import UploadScreen from './UploadScreen';
import TimetableScreen from './TimetableScreen';
import AttendanceScreen from './AttendanceScreen';

type Tab = 'upload' | 'timetable' | 'attendance';

const TimetableApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [appData, setAppData] = useState<AppData>({ timetable: [], attendance: {} });

  useEffect(() => {
    const data = loadData();
    setAppData(data);
    
    // If there's existing timetable data, show timetable tab by default
    if (data.timetable.length > 0) {
      setActiveTab('timetable');
    }
  }, []);

  const handleDataUpdate = (newData: AppData) => {
    setAppData(newData);
    saveData(newData);
  };

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload', icon: Upload },
    { id: 'timetable' as Tab, label: 'Timetable', icon: Calendar },
    { id: 'attendance' as Tab, label: 'Attendance', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Timetable</h1>
          <p className="text-muted-foreground">Manage your class schedule and attendance</p>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="flex-1 rounded-none first:rounded-l-lg last:rounded-r-lg"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Content */}
        <div className="min-h-[500px]">
          {activeTab === 'upload' && (
            <UploadScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
              onSuccess={() => setActiveTab('timetable')}
            />
          )}
          {activeTab === 'timetable' && (
            <TimetableScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceScreen
              appData={appData}
              onDataUpdate={handleDataUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableApp;
