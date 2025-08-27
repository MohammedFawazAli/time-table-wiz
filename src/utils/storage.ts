
import { AppData, TimetableEntry, AttendanceData, DailyAttendance } from '../types/timetable';

const STORAGE_KEY = 'timetable-app-data';

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure dailyAttendance exists
      if (!data.dailyAttendance) {
        data.dailyAttendance = {};
      }
      return data;
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
  
  return {
    timetable: [],
    attendance: {},
    dailyAttendance: {}
  };
};

export const updateTimetableEntry = (
  currentData: AppData,
  day: string,
  time: string,
  subject: string,
  room: string
): AppData => {
  const existingIndex = currentData.timetable.findIndex(
    entry => entry.day === day && entry.time === time
  );
  
  const updatedTimetable = [...currentData.timetable];
  
  if (existingIndex >= 0) {
    updatedTimetable[existingIndex] = { day, time, subject, room };
  } else {
    updatedTimetable.push({ day, time, subject, room });
  }
  
  return {
    ...currentData,
    timetable: updatedTimetable
  };
};

export const markAttendance = (
  currentData: AppData,
  subject: string,
  isPresent: boolean
): AppData => {
  const attendance = { ...currentData.attendance };
  const dailyAttendance = { ...currentData.dailyAttendance } || {};
  const today = new Date().toDateString();
  
  if (!attendance[subject]) {
    attendance[subject] = { total: 0, present: 0 };
  }
  
  // Initialize daily attendance for today if it doesn't exist
  if (!dailyAttendance[today]) {
    dailyAttendance[today] = {};
  }
  
  // Check if attendance was already marked today for this subject
  const alreadyMarked = dailyAttendance[today][subject];
  
  if (!alreadyMarked) {
    // First time marking attendance for this subject today
    attendance[subject].total += 1;
    if (isPresent) {
      attendance[subject].present += 1;
    }
  } else {
    // Update existing attendance
    if (alreadyMarked === 'present' && !isPresent) {
      // Was present, now absent
      attendance[subject].present -= 1;
    } else if (alreadyMarked === 'absent' && isPresent) {
      // Was absent, now present
      attendance[subject].present += 1;
    }
  }
  
  // Update daily attendance
  dailyAttendance[today][subject] = isPresent ? 'present' : 'absent';
  
  return {
    ...currentData,
    attendance,
    dailyAttendance
  };
};

export const getDailyAttendanceStatus = (
  dailyAttendance: DailyAttendance,
  subject: string,
  date?: string
): 'none' | 'present' | 'absent' => {
  const targetDate = date || new Date().toDateString();
  return dailyAttendance[targetDate]?.[subject] || 'none';
};
