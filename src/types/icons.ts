/**
 * Icon Types and Exports
 *
 * Centralized exports for Lucide React icons used throughout the application.
 * All Untitled UI components import icons from this file.
 */

import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Home,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  Check,
  Send,
  Paperclip,
  Smile,
  Loader2,
  Play,
} from 'lucide-react';

// Re-export the Lucide icon type
export type LucideIcon = ComponentType<LucideProps>;

// Re-export commonly used Lucide icons as values
export {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Home,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  Check,
  Send,
  Paperclip,
  Smile,
  Loader2,
  Play,
};
