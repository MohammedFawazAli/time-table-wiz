
import * as XLSX from 'xlsx';
import { TimetableEntry } from '../types/timetable';

export const parseExcelFile = (file: File): Promise<TimetableEntry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellText: false, cellDates: true });
        
        // Get the first worksheet
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Convert to JSON with proper handling of merged cells and formatting
        const jsonData = XLSX.utils.sheet_to_json(ws, { 
          header: 1, 
          defval: '', 
          blankrows: true,
          raw: false 
        }) as any[][];
        
        // Parse the timetable format
        const timetable: TimetableEntry[] = [];
        
        console.log('Parsed Excel data:', jsonData);
        
        if (jsonData.length > 1) {
          // Find the header row (contains days)
          let headerRowIndex = 0;
          let days: string[] = [];
          
          // Look for the row containing days of the week
          for (let i = 0; i < Math.min(3, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && Array.isArray(row)) {
              const possibleDays = row.slice(1).filter(cell => 
                cell && typeof cell === 'string' && 
                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                  .some(day => cell.toLowerCase().includes(day))
              );
              if (possibleDays.length > 0) {
                headerRowIndex = i;
                days = row.slice(1).map(cell => cell ? cell.toString().trim() : '').filter(Boolean);
                break;
              }
            }
          }
          
          console.log('Found days:', days, 'at row index:', headerRowIndex);
          
          // Parse data rows starting after header
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || !Array.isArray(row)) continue;
            
            const timeCell = row[0];
            if (!timeCell) continue;
            
            const time = timeCell.toString().trim();
            if (!time) continue;
            
            // Process each day column
            for (let j = 1; j < row.length && j <= days.length; j++) {
              const cellValue = row[j];
              
              // Skip empty, null, undefined cells
              if (!cellValue || cellValue.toString().trim() === '') continue;
              
              const cellText = cellValue.toString().trim();
              
              // Parse the complex format: "Subject (Type): (Room) Professor: (StudentCodes)"
              // Example: "Python for DataScience (P): (3102B-BL3-FF) Ms. R.Sujitha: (23CSBT615,23CSBT616)"
              
              let subject = '';
              let room = '';
              
              // Extract subject name (everything before the first parenthesis)
              const subjectMatch = cellText.match(/^([^(]+)/);
              if (subjectMatch) {
                subject = subjectMatch[1].trim();
              }
              
              // Extract room (first parenthesis after colon, if exists)
              const roomMatch = cellText.match(/:\s*\(([^)]+)\)/);
              if (roomMatch) {
                room = roomMatch[1].trim();
              } else {
                // Fallback: look for any parenthesis with room-like pattern
                const fallbackRoomMatch = cellText.match(/\(([A-Z0-9-]+)\)/);
                if (fallbackRoomMatch) {
                  room = fallbackRoomMatch[1].trim();
                }
              }
              
              // If no structured parsing worked, use simpler approach
              if (!subject) {
                subject = cellText.split('(')[0].trim();
              }
              
              // Only add if subject is meaningful
              if (subject && subject.length > 1) {
                timetable.push({
                  day: days[j - 1] || `Day ${j}`,
                  time: time,
                  subject,
                  room,
                  id: `${days[j - 1] || j}-${time}-${Date.now()}-${j}` // Unique ID
                });
              }
            }
          }
        }
        
        console.log('Final timetable:', timetable);
        resolve(timetable);
      } catch (error) {
        console.error('Excel parsing error:', error);
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
