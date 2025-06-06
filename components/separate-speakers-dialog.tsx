'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSeparated?: (resultUrl: string) => void;
}

export function SeparateSpeakersDialog({ isOpen, onClose, onSeparated }: Props) {
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSeparate = async () => {
    if (!audioUrl) {
      toast({ title: 'Provide audio URL', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await autoContentApi.separateSpeakers({ audioUrl });
      if (res.content && onSeparated) onSeparated(res.content);
      toast({ title: 'Processing started' });
      onClose();
    } catch (e) {
      toast({ title: 'Failed to process audio', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Separate Speakers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Audio URL</Label>
            <Input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://example.com/file.mp3" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSeparate} disabled={loading || !audioUrl}>{loading ? 'Processing...' : 'Start'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
