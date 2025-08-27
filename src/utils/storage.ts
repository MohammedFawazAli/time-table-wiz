
import { AppData, TimetableEntry, AttendanceData } from '../types/timetable';

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
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
  
  return {
    timetable: [],
    attendance: {}
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
  
  if (!attendance[subject]) {
    attendance[subject] = { total: 0, present: 0 };
  }
  
  attendance[subject].total += 1;
  if (isPresent) {
    attendance[subject].present += 1;
  }
  
  return {
    ...currentData,
    attendance
  };
};
