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
  defaultAudioUrl?: string;
}

export function SeparateSpeakersDialog({ isOpen, onClose, onSeparated, defaultAudioUrl }: Props) {
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState(defaultAudioUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSeparate = async () => {
    if (!audioUrl) {
      toast({ 
        title: 'Error', 
        description: 'Please provide an audio URL',
        variant: 'destructive' 
      });
      return;
    }

    if (!audioUrl.match(/\.(mp3|wav)$/i)) {
      toast({ 
        title: 'Error', 
        description: 'Audio URL must be an MP3 or WAV file',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await autoContentApi.separateSpeakers({ 
        audioUrl,
        callbackData: 'separate-speakers-request'
      });

      if (res.request_id) {
        toast({ 
          title: 'Success', 
          description: 'Audio separation process has started. You will be notified when it\'s complete.'
        });
        if (onSeparated) onSeparated(res.request_id);
        onClose();
      } else if (res.error_message) {
        throw new Error(res.error_message);
      }
    } catch (e) {
      toast({ 
        title: 'Error', 
        description: e instanceof Error ? e.message : 'Failed to process audio',
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
          <DialogTitle>Separate Speakers Audio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Audio URL</Label>
            <Input 
              value={audioUrl} 
              onChange={(e) => setAudioUrl(e.target.value)} 
              placeholder="https://example.com/audio.mp3" 
            />
            <p className="text-sm text-gray-500">
              Enter the URL of an MP3 or WAV file containing multiple speakers. The audio will be separated into individual speaker tracks.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSeparate} 
              disabled={loading || !audioUrl}
            >
              {loading ? 'Processing...' : 'Separate Speakers'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
