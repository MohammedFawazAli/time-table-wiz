
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  currentTotal: number;
  currentPresent: number;
  onSave: (total: number, present: number) => void;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  isOpen,
  onClose,
  subject,
  currentTotal,
  currentPresent,
  onSave
}) => {
  const [total, setTotal] = useState(currentTotal.toString());
  const [present, setPresent] = useState(currentPresent.toString());

  const handleSave = () => {
    const totalNum = Math.max(0, parseInt(total) || 0);
    const presentNum = Math.max(0, Math.min(parseInt(present) || 0, totalNum));
    onSave(totalNum, presentNum);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance - {subject}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="total">Total Classes</Label>
            <Input
              id="total"
              type="number"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Enter total classes"
            />
          </div>
          
          <div>
            <Label htmlFor="present">Classes Attended</Label>
            <Input
              id="present"
              type="number"
              min="0"
              max={parseInt(total) || 0}
              value={present}
              onChange={(e) => setPresent(e.target.value)}
              placeholder="Enter attended classes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
  );
};

export default EditAttendanceModal;
