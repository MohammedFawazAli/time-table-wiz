
import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AppData } from '../types/timetable';

interface AttendanceScreenProps {
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
}

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ appData }) => {
  const THRESHOLD = 75; // 75% attendance threshold

  const calculateAttendanceStats = (subject: string) => {
    const attendance = appData.attendance[subject];
    if (!attendance || attendance.total === 0) {
      return {
        percentage: 0,
        canMiss: 0,
        needToAttend: 0,
        status: 'unknown' as const
      };
    }

    const percentage = Math.round((attendance.present / attendance.total) * 100);
    
    // Calculate how many more classes can be missed while maintaining 75%
    // Formula: (present - 0.75 * (total + missed)) >= 0
    // Solving for missed: missed <= (present - 0.75 * total) / 0.75
    const canMiss = Math.max(0, Math.floor((attendance.present - (THRESHOLD / 100) * attendance.total) / (THRESHOLD / 100)));
    
    // Calculate how many classes need to be attended to reach 75%
    // Formula: (present + need) / (total + need) >= 0.75
    // Solving for need: need >= (0.75 * total - present) / 0.25
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

    return { percentage, canMiss, needToAttend, status };
  };

  const subjects = Object.keys(appData.attendance);

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No attendance data</h3>
          <p className="text-muted-foreground text-center">
            Start marking attendance from the Timetable tab to see your stats.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Attendance threshold: {THRESHOLD}% • Track your progress for each subject
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {subjects.map(subject => {
          const attendance = appData.attendance[subject];
          const stats = calculateAttendanceStats(subject);
          
          return (
            <Card key={subject}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{subject}</CardTitle>
                  <Badge 
                    variant={stats.status === 'good' ? 'default' : 
                            stats.status === 'warning' ? 'secondary' : 'destructive'}
                  >
                    {stats.percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress to {THRESHOLD}%</span>
                    <span className="font-medium">
                      {attendance.present}/{attendance.total} classes
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(stats.percentage, 100)} 
                    className="h-3"
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {stats.percentage >= THRESHOLD ? (
                        <TrendingUp className="w-4 h-4 text-attendance-good" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-attendance-danger" />
                      )}
                      <span className="text-sm font-medium">
                        {stats.percentage >= THRESHOLD ? 'On Track' : 'Below Threshold'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current status
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {stats.percentage >= THRESHOLD ? 
                          `Can miss ${stats.canMiss} more` : 
                          `Need ${stats.needToAttend} more`
                        }
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.percentage >= THRESHOLD ? 
                        'Classes you can skip' : 
                        'Classes to attend'
                      }
                    </p>
                  </div>
                </div>

                {/* Warning Message */}
                {stats.percentage < THRESHOLD && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">Below {THRESHOLD}% attendance</p>
                      <p className="text-muted-foreground">
                        Attend the next {stats.needToAttend} classes to reach the minimum threshold.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceScreen;
