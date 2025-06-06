'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { autoContentApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Avatar {
  Id: number;
  name: string;
  imageUrl: string;
  videoUrl: string;
  token: string;
  createdOn: string;
  voiceId: string;
}

interface CreateShortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (videoUrl: string) => void;
  defaultAudioUrl?: string;
}

export function CreateShortDialog({ isOpen, onClose, onCreated, defaultAudioUrl }: CreateShortDialogProps) {
  const [audioUrl, setAudioUrl] = useState(defaultAudioUrl || '');
  const [prompt, setPrompt] = useState('');
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [avatar1, setAvatar1] = useState<number | null>(null);
  const [avatar2, setAvatar2] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await autoContentApi.getAvatars();
        setAvatars(response);
      } catch (error) {
        console.error('Error fetching avatars:', error);
        setError('Failed to load avatars');
      } finally {
        setLoadingAvatars(false);
      }
    };

    if (isOpen) {
      fetchAvatars();
    }
  }, [isOpen]);

  const handleAvatarSelect = (avatarId: number) => {
    if (avatar1 === avatarId) {
      setAvatar1(null);
    } else if (avatar2 === avatarId) {
      setAvatar2(null);
    } else if (avatar1 === null) {
      setAvatar1(avatarId);
    } else if (avatar2 === null) {
      setAvatar2(avatarId);
    }
  };

  const handleCreate = async () => {
    if (!audioUrl) {
      setError('Please enter an audio URL');
      return;
    }

    if (!avatar1 || !avatar2) {
      setError('Please select both avatars');
      return;
    }

    setIsCreating(true);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch('/api/createshorts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl,
          prompt,
          avatar1,
          avatar2,
          callbackData: undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create short');
      }

      // Start polling for status
      let retries = 0;
      const maxRetries = 180; // 15 minutes with 5-second intervals
      const pollInterval = 5000; // 5 seconds

      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/content/${data.request_id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!statusResponse.ok) {
            throw new Error('Failed to check status');
          }

          const statusData = await statusResponse.json();
          console.log('Status check response:', statusData);

          // Update progress based on status
          setProgress(statusData.status || 0);

          if (statusData.status === 100 || statusData.video_url) {
            onCreated(statusData.video_url);
            onClose();
            return true;
          }

          return false;
        } catch (error) {
          console.error('Error checking status:', error);
          return false;
        }
      };

      // Initial status check
      let isComplete = await pollStatus();

      // Continue polling if not complete
      while (!isComplete && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        isComplete = await pollStatus();
        retries++;
      }

      if (!isComplete) {
        throw new Error('Timeout waiting for video generation');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Video Short</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Podcast Audio URL</Label>
            <Input 
              value={audioUrl} 
              onChange={(e) => setAudioUrl(e.target.value)} 
              placeholder="https://example.com/audio.mp3" 
            />
          </div>
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Input 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Focus on the intro" 
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Select Two Avatars</Label>
              <div className="text-sm text-muted-foreground">
                {avatar1 && avatar2 ? 'Both avatars selected' : 
                 avatar1 ? 'Select second avatar' : 
                 'Select first avatar'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {loadingAvatars ? (
                <div className="col-span-2 flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                avatars.map((avatar) => (
                  <div
                    key={avatar.Id}
                    className={`cursor-pointer rounded-lg border p-2 transition-all ${
                      avatar1 === avatar.Id || avatar2 === avatar.Id 
                        ? 'border-primary bg-primary/10' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleAvatarSelect(avatar.Id)}
                  >
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <p className="text-sm text-center mt-1">{avatar.name}</p>
                    {(avatar1 === avatar.Id || avatar2 === avatar.Id) && (
                      <p className="text-xs text-center text-primary mt-1">
                        {avatar1 === avatar.Id ? 'Avatar 1' : 'Avatar 2'}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {isCreating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {progress === 0 ? 'Initializing...' :
                   progress < 100 ? 'Processing...' :
                   'Completed!'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !audioUrl || avatar1 === null || avatar2 === null || loadingAvatars}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress === 0 ? 'Initializing...' :
                   progress < 100 ? 'Processing...' :
                   'Completed!'}
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
