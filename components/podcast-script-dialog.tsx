'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlayCircle } from 'lucide-react';
import { autoContentApi } from '@/lib/api';

interface Voice {
  id: string;
  name: string;
  gender?: string;
  preview_url?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (audioUrl: string) => void;
}

export function PodcastScriptDialog({ isOpen, onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voice1, setVoice1] = useState('');
  const [voice2, setVoice2] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    autoContentApi.getAvailableVoices().then(setVoices).catch(() => {});
  }, []);

  const renderVoiceOption = (voice: Voice) => (
    <SelectItem key={voice.id} value={voice.id} className="flex items-center justify-between">
      <span>{voice.name} {voice.gender === 'f' ? '(Female)' : '(Male)'}</span>
      {voice.preview_url && (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); new Audio(voice.preview_url!).play(); }}>
          <PlayCircle className="h-4 w-4" />
        </Button>
      )}
    </SelectItem>
  );

  const handleCreate = async () => {
    if (!voice1 || !voice2) {
      toast({ title: 'Select voices', variant: 'destructive' });
      return;
    }
    if (!script) {
      toast({ title: 'Provide a script', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await autoContentApi.createPodcastCustomScript({
        script,
        voice1,
        voice2,
      });
      
      if (res.finalResult?.audio_url) {
        onCreated?.(res.finalResult.audio_url);
        toast({ title: 'Podcast created' });
        onClose();
      } else if (res.error_message) {
        throw new Error(res.error_message);
      } else {
        throw new Error('No audio URL received');
      }
    } catch (e) {
      toast({ 
        title: 'Failed to create podcast', 
        description: e instanceof Error ? e.message : 'An error occurred',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Podcast from Script</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Script</Label>
            <Textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="SPEAKER_00: Hello" />
          </div>
          <div className="space-y-2">
            <Label>First Voice</Label>
            <Select value={voice1} onValueChange={setVoice1}>
              <SelectTrigger><SelectValue placeholder="Select voice" /></SelectTrigger>
              <SelectContent>{voices.map(renderVoiceOption)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Second Voice</Label>
            <Select value={voice2} onValueChange={setVoice2}>
              <SelectTrigger><SelectValue placeholder="Select voice" /></SelectTrigger>
              <SelectContent>{voices.map(renderVoiceOption)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !voice1 || !voice2 || !script}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
