'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Grid, List, MoreVertical } from 'lucide-react';
import { notebookStorage, Notebook } from '@/lib/notebook-storage';

export function DashboardContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  useEffect(() => {
    setNotebooks(notebookStorage.load());
  }, []);

  const handleCreate = () => {
    const nb = notebookStorage.add('Untitled notebook');
    setNotebooks(prev => [nb, ...prev]);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-gray-900 mb-4">My Notebooks</h2>
      
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" />
          Create new
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex">
            <Button
              variant={viewMode === 'list' ? 'outline' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-r-none border-r-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'outline' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm bg-white"
          >
            <option>Most recent</option>
            <option>Oldest</option>
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
          </select>
        </div>
      </div>

      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
        {notebooks.map((notebook) => (
          <Card
            key={notebook.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer group relative bg-gradient-to-br from-gray-50 to-white"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
              {notebook.title}
            </h3>
            <div className="text-sm text-gray-500">
              {new Date(notebook.createdAt).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}