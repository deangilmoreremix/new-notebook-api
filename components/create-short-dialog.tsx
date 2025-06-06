'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (videoUrl: string) => void;
}

export function CreateShortDialog({ isOpen, onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!audioUrl) {
      toast({ title: 'Provide audio URL', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await autoContentApi.createShort({
        audioUrl,
        prompt,
        firstAvatarGender: gender,
      });
      if (res.content && onCreated) onCreated(res.content);
      toast({ title: 'Short creation started' });
      onClose();
    } catch (e) {
      toast({ title: 'Failed to create short', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Video Short</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Podcast Audio URL</Label>
            <Input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://example.com/audio.mp3" />
          </div>
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Focus on the intro" />
          </div>
          <div className="space-y-2">
            <Label>First Avatar Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as 'M' | 'F')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !audioUrl}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
