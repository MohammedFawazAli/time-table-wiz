
import React, { useState } from 'react';
import { Upload, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppData, TimetableEntry } from '../types/timetable';
import { parseExcelFile, generatePreviewData } from '../utils/excelParser';
import { toast } from '@/hooks/use-toast';

interface UploadScreenProps {
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
  onSuccess: () => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ appData, onDataUpdate, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedTimetable, setParsedTimetable] = useState<TimetableEntry[]>([]);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadClick = () => {
    if (!selectedFile) return;
    
    if (appData.timetable.length > 0) {
      setShowConfirmDialog(true);
    } else {
      processFile();
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setShowConfirmDialog(false);
    
    try {
      const timetable = await parseExcelFile(selectedFile);
      setParsedTimetable(timetable);
      setPreviewData(generatePreviewData(timetable));
      setShowPreviewDialog(true);
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: "Failed to parse the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmUpload = () => {
    const newData: AppData = {
      timetable: parsedTimetable,
      attendance: {} // Reset attendance when new timetable is uploaded
    };
    
    onDataUpdate(newData);
    setShowPreviewDialog(false);
    setSelectedFile(null);
    setParsedTimetable([]);
    
    toast({
      title: "Timetable uploaded successfully",
      description: `${parsedTimetable.length} classes loaded`,
    });
    
    onSuccess();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upload an Excel file (.xlsx) containing your class schedule
          </p>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Excel Format Expected:</strong> First row should contain days (Monday, Tuesday, etc.), 
              first column should contain times (09:00, 10:00, etc.), and cells should contain 
              "Subject Name (Room)" or just "Subject Name".
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer w-full" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Excel File
                  </span>
                </Button>
              </label>
            </div>

            {selectedFile && (
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">Size: {Math.round(selectedFile.size / 1024)} KB</p>
              </div>
            )}

            <Button 
              onClick={handleUploadClick}
              disabled={!selectedFile || isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Upload & Parse"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Replace Existing Timetable?
            </DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to read this file? It will replace your current timetable and reset all attendance data.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={processFile}>
              Yes, Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview Timetable Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {parsedTimetable.length} classes. Preview of first 5 entries:
            </p>
            <ScrollArea className="h-[400px] w-full border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-muted">
                      {previewData[0]?.map((header, index) => (
                        <th key={index} className="border border-border p-2 text-left font-medium min-w-[120px]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-accent/50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-border p-2 min-w-[120px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpload}>
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadScreen;
