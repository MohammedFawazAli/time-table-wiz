
import React, { useState } from 'react';
import { Calendar, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AppData, TimetableEntry } from '../types/timetable';
import { updateTimetableEntry, markAttendance } from '../utils/storage';
import { toast } from '@/hooks/use-toast';

interface TimetableScreenProps {
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
}

const TimetableScreen: React.FC<TimetableScreenProps> = ({ appData, onDataUpdate }) => {
  const [selectedCell, setSelectedCell] = useState<{ day: string; time: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedRoom, setEditedRoom] = useState('');
  const [attendanceChoice, setAttendanceChoice] = useState<'present' | 'absent' | ''>('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const getTimetableEntry = (day: string, time: string): TimetableEntry | undefined => {
    return appData.timetable.find(entry => entry.day === day && entry.time === time);
  };

  const handleCellClick = (day: string, time: string) => {
    const entry = getTimetableEntry(day, time);
    setSelectedCell({ day, time });
    setEditedSubject(entry?.subject || '');
    setEditedRoom(entry?.room || '');
    setAttendanceChoice('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedCell) return;

    let updatedData = appData;

    // Update timetable entry if subject or room changed
    if (editedSubject.trim()) {
      updatedData = updateTimetableEntry(
        updatedData,
        selectedCell.day,
        selectedCell.time,
        editedSubject.trim(),
        editedRoom.trim()
      );
    }

    // Mark attendance if selected
    if (attendanceChoice && editedSubject.trim()) {
      updatedData = markAttendance(
        updatedData,
        editedSubject.trim(),
        attendanceChoice === 'present'
      );
      
      toast({
        title: "Attendance marked",
        description: `${editedSubject} - ${attendanceChoice === 'present' ? 'Present' : 'Absent'}`,
      });
    }

    onDataUpdate(updatedData);
    setShowModal(false);
  };

  if (appData.timetable.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No timetable uploaded</h3>
          <p className="text-muted-foreground text-center">
            Upload an Excel file from the Upload tab to get started.
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
            <Calendar className="w-5 h-5" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tap any class to mark attendance or edit details
          </p>
          
          <div className="overflow-x-auto">
            <table className="timetable-grid w-full">
              <thead>
                <tr>
                  <th className="timetable-header min-w-[80px]">Time</th>
                  {days.map(day => (
                    <th key={day} className="timetable-header min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map(time => (
                  <tr key={time}>
                    <td className="time-cell">{time}</td>
                    {days.map(day => {
                      const entry = getTimetableEntry(day, time);
                      return (
                        <td
                          key={`${day}-${time}`}
                          className="timetable-cell"
                          onClick={() => handleCellClick(day, time)}
                        >
                          {entry ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{entry.subject}</div>
                              {entry.room && (
                                <div className="text-xs text-muted-foreground">{entry.room}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground text-center">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Class - {selectedCell?.day} {selectedCell?.time}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Enter subject name"
              />
            </div>
            
            <div>
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={editedRoom}
                onChange={(e) => setEditedRoom(e.target.value)}
                placeholder="Enter room number (optional)"
              />
            </div>

            {editedSubject.trim() && (
              <div>
                <Label>Mark Attendance (optional)</Label>
                <RadioGroup value={attendanceChoice} onValueChange={(value: 'present' | 'absent') => setAttendanceChoice(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="present" id="present" />
                    <Label htmlFor="present" className="text-attendance-good font-medium">Present</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absent" id="absent" />
                    <Label htmlFor="absent" className="text-attendance-danger font-medium">Absent</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableScreen;
