
import * as XLSX from 'xlsx';
import { TimetableEntry } from '../types/timetable';

export const parseExcelFile = (file: File): Promise<TimetableEntry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
        
        // Parse the timetable format (assuming first row has days, first column has times)
        const timetable: TimetableEntry[] = [];
        
        if (jsonData.length > 1) {
          const days = jsonData[0].slice(1); // Skip the first cell (Time header)
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const time = row[0];
            
            if (time) {
              for (let j = 1; j < row.length && j <= days.length; j++) {
                const cellValue = row[j];
                // Skip empty cells, undefined values, or cells that only contain whitespace
                if (cellValue && typeof cellValue === 'string' && cellValue.trim() !== '') {
                  // Parse subject and room from cell value
                  // Expected format: "Subject (Room)" or just "Subject"
                  const match = cellValue.match(/^(.+?)\s*\((.+?)\)\s*$/);
                  const subject = match ? match[1].trim() : cellValue.trim();
                  const room = match ? match[2].trim() : '';
                  
                  // Only add if subject is not empty after trimming
                  if (subject) {
                    timetable.push({
                      day: days[j - 1],
                      time: time.toString(),
                      subject,
                      room,
                      id: `${days[j - 1]}-${time}-${j}` // Add unique ID for each entry
                    });
                  }
                }
              }
            }
          }
        }
        
        resolve(timetable);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const generatePreviewData = (timetable: TimetableEntry[]): string[][] => {
  // Show all entries instead of just first 5
  const preview = [['Day', 'Time', 'Subject', 'Room']];
  
  timetable.forEach(entry => {
    preview.push([entry.day, entry.time, entry.subject, entry.room]);
  });
  
  return preview;
};
