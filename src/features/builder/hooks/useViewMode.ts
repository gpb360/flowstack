import { useBuilderStore } from '../stores/useBuilderStore';

// ============================================================================
// VIEW MODE HOOK - Handle responsive breakpoints
// ============================================================================

export interface ViewModeConfig {
  mode: 'desktop' | 'tablet' | 'mobile';
  canvasWidth: string;
  breakpoint: number;
}

const VIEW_MODES: Record<'desktop' | 'tablet' | 'mobile', ViewModeConfig> = {
  desktop: {
    mode: 'desktop',
    canvasWidth: '100%',
    breakpoint: 1200,
  },
  tablet: {
    mode: 'tablet',
    canvasWidth: '768px',
    breakpoint: 768,
  },
  mobile: {
    mode: 'mobile',
    canvasWidth: '375px',
    breakpoint: 375,
  },
};

export const useViewMode = () => {
  const viewMode = useBuilderStore((state) => state.viewMode);
  const config = VIEW_MODES[viewMode];

  return {
    mode: config.mode,
    canvasWidth: config.canvasWidth,
    breakpoint: config.breakpoint,
    isDesktop: viewMode === 'desktop',
    isTablet: viewMode === 'tablet',
    isMobile: viewMode === 'mobile',
  };
};
