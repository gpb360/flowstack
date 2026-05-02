import { useState } from 'react';
import { Button } from '@/components/ui/button-untitled';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Hash } from 'lucide-react';
import { generateHashtagSuggestions } from '../lib/composer';
import type { SocialPlatform } from '../lib/platforms';

interface HashtagSuggestionsProps {
  content: string;
  onSelect: (hashtag: string) => void;
  platform?: SocialPlatform;
}

export function HashtagSuggestions({ content, onSelect, platform = 'instagram' }: HashtagSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const suggestions = generateHashtagSuggestions(content, platform);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Hash className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Suggested Hashtags</h3>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((hashtag) => (
              <button
                key={hashtag}
                onClick={() => {
                  onSelect(hashtag);
                  setIsOpen(false);
                }}
                className="text-xs bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
              >
                {hashtag}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
