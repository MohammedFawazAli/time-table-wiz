
import React, { useState } from 'react';
import { BookOpen, TrendingUp, AlertTriangle, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppData } from '../types/timetable';
import { updateAttendanceManually } from '../utils/storage';
import EditAttendanceModal from './EditAttendanceModal';

interface SubjectsScreenProps {
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
}

const SubjectsScreen: React.FC<SubjectsScreenProps> = ({ appData, onDataUpdate }) => {
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const THRESHOLD = 75; // 75% attendance threshold

  const calculateSubjectStats = (subject: string) => {
    const attendance = appData.attendance[subject];
    if (!attendance || attendance.total === 0) {
      return {
        percentage: 0,
        canMiss: 0,
        needToAttend: 0,
        status: 'unknown' as const,
        total: 0,
        present: 0,
        missed: 0
      };
    }

    const percentage = Math.round((attendance.present / attendance.total) * 100);
    const missed = attendance.total - attendance.present;
    
    // Calculate how many more classes can be missed while maintaining 75%
    const canMiss = Math.max(0, Math.floor((attendance.present - (THRESHOLD / 100) * attendance.total) / (THRESHOLD / 100)));
    
    // Calculate how many classes need to be attended to reach 75%
    const needToAttend = percentage < THRESHOLD ? 
      Math.ceil(((THRESHOLD / 100) * attendance.total - attendance.present) / (1 - THRESHOLD / 100)) : 0;

    let status: 'good' | 'warning' | 'danger';
    if (percentage >= THRESHOLD) {
      status = 'good';
    } else if (percentage >= THRESHOLD - 10) {
      status = 'warning';
    } else {
      status = 'danger';
    }

    return { 
      percentage, 
      canMiss, 
      needToAttend, 
      status, 
      total: attendance.total,
      present: attendance.present,
      missed
    };
  };

  const handleEditAttendance = (subject: string, total: number, present: number) => {
    const updatedData = updateAttendanceManually(appData, subject, total, present);
    onDataUpdate(updatedData);
  };

  // Get all unique subjects from timetable
  const allSubjects = Array.from(new Set(appData.timetable.map(entry => entry.subject)));
  
  if (allSubjects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No subjects found</h3>
          <p className="text-muted-foreground text-center">
            Upload your timetable to see subject attendance statistics.
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
            <BookOpen className="w-5 h-5" />
            Subjects Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Attendance threshold: {THRESHOLD}% • Track your progress for each subject
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {allSubjects.map(subject => {
          const stats = calculateSubjectStats(subject);
          
          return (
            <Card key={subject} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  {/* Subject Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{subject}</h3>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={stats.status === 'good' ? 'default' : 
                                stats.status === 'warning' ? 'secondary' : 'destructive'}
                      >
                        {stats.percentage.toFixed(1)}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSubject(subject)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats Display */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress to {THRESHOLD}%</span>
                      <span className="font-medium">
                        Att: {stats.present} Miss: {stats.missed} Tot: {stats.total}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(stats.percentage, 100)} 
                      className="h-2"
                    />
                  </div>

                  {/* Message */}
                  <div className="text-sm">
                    {stats.percentage >= THRESHOLD ? (
                      <div className="flex items-center gap-2 text-attendance-good">
                        <TrendingUp className="w-4 h-4" />
                        <span>You can miss {stats.canMiss} more lectures</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-attendance-danger">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Can't miss the next lecture</span>
                      </div>
                    )}
                  </div>

                  {/* Warning for low attendance */}
                  {stats.percentage < THRESHOLD && stats.total > 0 && (
                    <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-destructive">Below {THRESHOLD}% attendance</p>
                          <p className="text-muted-foreground">
                            Attend the next {stats.needToAttend} classes to reach the minimum threshold.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Attendance Modal */}
      {editingSubject && (
        <EditAttendanceModal
          isOpen={true}
          onClose={() => setEditingSubject(null)}
          subject={editingSubject}
          currentTotal={appData.attendance[editingSubject]?.total || 0}
          currentPresent={appData.attendance[editingSubject]?.present || 0}
          onSave={(total, present) => handleEditAttendance(editingSubject, total, present)}
        />
      )}
    </div>
  );
};

export default SubjectsScreen;
