'use client';

import { useState } from 'react';
import { MessageSquare, Settings, Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { autoContentApi as api } from '@/lib/api';
import { StudioSidebarProps, ContentType } from '@/lib/types/studio';

export function StudioSidebar(props: StudioSidebarProps) {
  const {
    usage,
    onCustomize,
    onGenerate,
    isGenerating,
    isCustomizing,
    hasSelectedSources,
    onRefreshUsage,
    onRefreshContent,
  } = props;

  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ContentType>('study_guide');

  const handleGenerate = async () => {
    try {
      await onGenerate(selectedType);
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <aside className="space-y-4">
      <Card className="p-4 bg-secondary/50 border-border/50 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#F2F3F5]">Usage</h4>
          <Button size="sm" variant="outline" onClick={onRefreshUsage}>
            <History className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
        <Progress value={(usage.requests_used / usage.requests_limit) * 100} />
        <p className="text-xs text-muted-foreground">
          {usage.requests_used} / {usage.requests_limit} requests
        </p>
      </Card>

      <Card className="p-4 bg-secondary/50 border-border/50 space-y-2">
        <h4 className="flex items-center gap-2 text-sm font-medium text-[#F2F3F5]">
          <Sparkles className="w-4 h-4" /> Generate
        </h4>
        <select
          className="w-full bg-background border rounded p-2 text-sm"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ContentType)}
        >
          <option value="study_guide">Study Guide</option>
          <option value="flashcards">Flashcards</option>
          <option value="questions">Questions</option>
          <option value="timeline">Timeline</option>
        </select>
        <Button
          onClick={handleGenerate}
          disabled={!hasSelectedSources || isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </Card>

      <Button
        variant="outline"
        onClick={onCustomize}
        disabled={isCustomizing}
        className="w-full flex gap-1"
      >
        <Settings className="w-4 h-4" /> Customize
      </Button>

      <Button variant="outline" onClick={onRefreshContent} className="w-full flex gap-1">
        <MessageSquare className="w-4 h-4" /> Refresh Content
      </Button>
    </aside>
  );
}
