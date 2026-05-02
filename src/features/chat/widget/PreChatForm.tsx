/**
 * Pre-Chat Form Component
 * Collects visitor information before starting a chat
 */

import { useState } from 'react';
import { X, Mail, User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputUntitled } from '@/components/ui/input-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import type { ChatSettings, PreChatFormData } from '../types';

interface PreChatFormProps {
  onSubmit: (data: PreChatFormData) => void;
  onClose: () => void;
  theme?: {
    color?: string;
    position?: 'bottom-right' | 'bottom-left';
  };
  settings?: ChatSettings | null;
}

export function PreChatForm({ onSubmit, onClose, theme, settings }: PreChatFormProps) {
  const [formData, setFormData] = useState<PreChatFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const collectEmail = settings?.collect_email;
  const collectName = settings?.collect_name;
  const collectPhone = settings?.collect_phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (collectName && !formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (collectEmail && !formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (collectEmail && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (collectPhone && !formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const position = theme?.position || 'bottom-right';

  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
  };

  return (
    <div
      className={cn(
        'fixed z-50 w-[400px] rounded-lg shadow-2xl',
        positionClasses[position]
      )}
      style={{ backgroundColor: 'white' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between rounded-t-lg px-4 py-3"
        style={{ backgroundColor: theme?.color || '#3B82F6' }}
      >
        <h3 className="text-lg font-semibold text-white">
          Before we start...
        </h3>
        <ButtonUntitled
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={onClose}
          className="text-white hover:text-white hover:opacity-80"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </ButtonUntitled>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <p className="text-sm text-gray-600">
          Please provide some information to help us assist you better.
        </p>

        {collectName && (
          <InputUntitled
            id="name"
            label="Name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name}
            helperText={errors.name}
          />
        )}

        {collectEmail && (
          <InputUntitled
            id="email"
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email}
            helperText={errors.email}
          />
        )}

        {collectPhone && (
          <InputUntitled
            id="phone"
            label="Phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone}
            helperText={errors.phone}
          />
        )}

        <ButtonUntitled
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={(e: any) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          style={{ backgroundColor: theme?.color || '#3B82F6' }}
        >
          {isSubmitting ? 'Starting Chat...' : 'Start Chat'}
        </ButtonUntitled>
      </form>
    </div>
  );
}
