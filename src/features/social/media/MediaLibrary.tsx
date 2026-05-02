// @ts-nocheck
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { Upload, Search, Filter, FolderOpen, Image, Video, Trash2, Edit } from 'lucide-react';
import { useSocialMedia } from '../hooks/useMediaLibrary';
import { format } from 'date-fns';

export function MediaLibrary() {
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'gif'>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');

  const { media, isLoading, uploadMedia, deleteMedia } = useSocialMedia({
    search: searchQuery || undefined,
    type: filterType === 'all' ? undefined : filterType,
    folder: filterFolder === 'all' ? undefined : filterFolder,
  });

  const filteredMedia = media;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        await Promise.all(Array.from(files).map(file => uploadMedia(file)));
      } catch (error) {
        console.error('Failed to upload media:', error);
      }
    }
  };

  const handleToggleSelect = (mediaId: string) => {
    const newSelected = new Set(selectedMedia);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedMedia(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMedia.size === filteredMedia.length) {
      setSelectedMedia(new Set());
    } else {
      setSelectedMedia(new Set(filteredMedia.map(m => m.id)));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(Array.from(selectedMedia).map(id => deleteMedia(id)));
      setSelectedMedia(new Set());
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const folders = ['all', ...new Set(media.map(m => m.folder))];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Media Library"
        description="Manage images and videos for social posts"
        actions={
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button as="span">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </label>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4 border-b">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="gif">GIFs</option>
        </select>

        <select
          value={filterFolder}
          onChange={(e) => setFilterFolder(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Folders</option>
          {folders.filter(f => f !== 'all').map(folder => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>

        {selectedMedia.size > 0 && (
          <>
            <div className="flex-1" />
            <span className="text-sm text-text-secondary">
              {selectedMedia.size} selected
            </span>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedMedia.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No media yet"
            description="Upload images and videos to use in your social posts"
            action={{
              label: 'Upload Media',
              onClick: () => document.querySelector('input[type="file"]')?.click(),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  'cursor-pointer overflow-hidden transition-all hover:shadow-lg',
                  selectedMedia.has(item.id) && 'ring-2 ring-primary'
                )}
                onClick={() => handleToggleSelect(item.id)}
              >
                <div className="relative aspect-square">
                  {item.file_type === 'image' || item.file_type === 'gif' ? (
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {item.file_type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                    </Badge>
                  </div>

                  {selectedMedia.has(item.id) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate">{item.file_name}</p>
                  <p className="text-xs text-text-secondary">{format(new Date(item.uploaded_at), 'MMM d')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
