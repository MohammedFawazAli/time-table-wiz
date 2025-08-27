
export interface TimetableEntry {
  day: string;
  time: string;
  subject: string;
  room: string;
}

export interface AttendanceData {
  [subjectName: string]: {
    total: number;
    present: number;
  };
}

export interface AppData {
  timetable: TimetableEntry[];
  attendance: AttendanceData;
}
