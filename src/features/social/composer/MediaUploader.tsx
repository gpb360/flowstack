import React, { useRef } from 'react';
import { Button } from '@/components/ui/button-untitled';
import { Upload, Image, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onUpload: (files: FileList) => void;
  isUploading?: boolean;
  maxFiles?: number;
  accept?: string;
}

export function MediaUploader({
  onUpload,
  isUploading = false,
  maxFiles = 10,
  accept = 'image/*,video/*'
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        Media
      </Button>
    </>
  );
}

interface MediaPreviewProps {
  file: {
    id: string;
    type: 'image' | 'video' | 'gif';
    url: string;
    thumbnail?: string;
  };
  onRemove: () => void;
}

export function MediaPreview({ file, onRemove }: MediaPreviewProps) {
  return (
    <div className="relative group">
      {file.type === 'image' || file.type === 'gif' ? (
        <img
          src={file.thumbnail || file.url}
          alt="Media preview"
          className="w-24 h-24 object-cover rounded-lg border"
        />
      ) : (
        <video
          src={file.url}
          className="w-24 h-24 object-cover rounded-lg border"
        />
      )}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
        {file.type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
      </div>
    </div>
  );
}
