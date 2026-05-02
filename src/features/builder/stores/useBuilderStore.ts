import { create } from 'zustand';
import type { Block, Page, SiteSettings, ViewMode } from '../types';
import { supabase } from '@/lib/supabase';

// ============================================================================
// HELPERS
// ============================================================================

const findBlock = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findAndRemoveBlock = (blocks: Block[], id: string): { block: Block | null; newBlocks: Block[] } => {
  const newBlocks: Block[] = [];
  let foundBlock: Block | null = null;

  for (const block of blocks) {
    if (block.id === id) {
      foundBlock = block;
      continue;
    }
    if (block.children) {
      const result = findAndRemoveBlock(block.children, id);
      if (result.block) {
        foundBlock = result.block;
        newBlocks.push({ ...block, children: result.newBlocks });
      } else {
        newBlocks.push(block);
      }
    } else {
      newBlocks.push(block);
    }
  }

  return { block: foundBlock, newBlocks };
};

const findAndUpdateBlock = (blocks: Block[], id: string, updates: Partial<Block>): Block[] => {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, ...updates };
    }
    if (block.children) {
      return { ...block, children: findAndUpdateBlock(block.children, id, updates) };
    }
    return block;
  });
};

const duplicateBlock = (block: Block): Block => ({
  ...block,
  id: crypto.randomUUID(),
  children: block.children ? block.children.map(duplicateBlock) : undefined,
});

const generateId = (): string => crypto.randomUUID();

// ============================================================================
// DB ROW ↔ APP TYPE MAPPERS
// ============================================================================

interface PageRow {
  id: string;
  organization_id: string;
  site_id: string;
  funnel_id: string | null;
  path: string;
  title: string;
  content: unknown;
  compiled_html: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

function rowToPage(row: PageRow): Page {
  return {
    id: row.id,
    siteId: row.site_id,
    path: row.path,
    title: row.title,
    content: (row.content as Block[]) || [],
    compiledHtml: row.compiled_html || undefined,
    isPublished: row.is_published,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================================
// STORE
// ============================================================================

interface BuilderStore {
  // Current page and site
  currentPage: Page | null;
  currentSite: any | null;
  pages: Page[];
  currentPageId: string;

  // Site settings
  siteSettings: SiteSettings;

  // Canvas state
  blocks: Block[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;

  // View mode
  viewMode: ViewMode;
  isPreview: boolean;
  deviceOrientation: 'portrait' | 'landscape';
  zoom: number;

  // History for undo/redo
  history: { blocks: Block[]; timestamp: number }[];
  historyIndex: number;

  // UI state
  leftPanelWidth: number;
  rightPanelWidth: number;
  showLeftPanel: boolean;
  showRightPanel: boolean;

  // Persistence
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: string | null;

  // Page management
  setCurrentPage: (page: Page | null) => void;
  setCurrentSite: (site: any | null) => void;
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;

  // Site settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  // Canvas actions
  addBlock: (block: Omit<Block, 'id'>, parentId?: string | null, index?: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (dragId: string, hoverId: string, parentId?: string) => void;
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;
  setBlocks: (blocks: Block[]) => void;

  // View mode
  setViewMode: (mode: ViewMode) => void;
  setPreview: (isPreview: boolean) => void;

  // Persistence
  loadPage: (pageId: string) => Promise<void>;
  savePage: () => Promise<void>;

  // History
  undo: () => void;
  redo: () => void;

  // UI panels
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;

  // Responsive
  setDeviceOrientation: (orientation: 'portrait' | 'landscape') => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  // Initial state
  currentPage: null,
  currentSite: null,
  pages: [],
  currentPageId: '',
  siteSettings: { favicon: '', logo: '', customCss: '', customJs: '' },
  blocks: [],
  selectedBlockId: null,
  hoveredBlockId: null,
  viewMode: 'desktop',
  isPreview: false,
  deviceOrientation: 'portrait',
  zoom: 100,
  history: [{ blocks: [], timestamp: Date.now() }],
  historyIndex: 0,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  showLeftPanel: true,
  showRightPanel: true,
  isSaving: false,
  isDirty: false,
  lastSavedAt: null,

  // ========================================================================
  // PERSISTENCE
  // ========================================================================

  loadPage: async (pageId: string) => {
    const { data, error } = await (supabase
      .from('pages') as any)
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) throw new Error(`Failed to load page: ${error.message}`);
    if (!data) throw new Error('Page not found');

    const page = rowToPage(data);
    set({
      currentPage: page,
      currentPageId: page.id,
      blocks: page.content || [],
      history: [{ blocks: page.content || [], timestamp: Date.now() }],
      historyIndex: 0,
      isDirty: false,
      lastSavedAt: data.updated_at,
    });
  },

  savePage: async () => {
    const { currentPage, blocks } = get();
    if (!currentPage) return;

    set({ isSaving: true });
    try {
      const { error } = await (supabase
        .from('pages') as any)
        .update({
          content: blocks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentPage.id);

      if (error) throw new Error(`Failed to save page: ${error.message}`);

      const now = new Date().toISOString();
      set({
        isSaving: false,
        isDirty: false,
        lastSavedAt: now,
        currentPage: { ...currentPage, content: blocks, updatedAt: new Date(now) },
      });
    } catch (err) {
      set({ isSaving: false });
      throw err;
    }
  },

  // ========================================================================
  // PAGE MANAGEMENT
  // ========================================================================

  setCurrentPage: (page) => set({
    currentPage: page,
    currentPageId: page?.id || '',
    blocks: page?.content || [],
    history: [{ blocks: page?.content || [], timestamp: Date.now() }],
    historyIndex: 0,
    isDirty: false,
  }),

  setCurrentSite: (site) => set({ currentSite: site }),

  addPage: (pageData) => {
    const newPage: Page = {
      ...pageData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ pages: [...state.pages, newPage] }));
  },

  updatePage: (pageId, updates) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId ? { ...page, ...updates, updatedAt: new Date() } : page
      ),
      currentPage:
        state.currentPage?.id === pageId
          ? { ...state.currentPage, ...updates, updatedAt: new Date() }
          : state.currentPage,
    }));
  },

  deletePage: (pageId) => {
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== pageId),
      currentPage: state.currentPage?.id === pageId ? null : state.currentPage,
    }));
  },

  duplicatePage: (pageId) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const duplicated: Page = {
      ...page,
      id: generateId(),
      title: `${page.title} (Copy)`,
      path: `${page.path}-copy`,
      content: page.content.map(duplicateBlock),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ pages: [...state.pages, duplicated] }));
  },

  // ========================================================================
  // SITE SETTINGS
  // ========================================================================

  updateSiteSettings: (settings) => {
    set((state) => ({
      siteSettings: { ...state.siteSettings, ...settings },
    }));
  },

  // ========================================================================
  // CANVAS ACTIONS
  // ========================================================================

  addBlock: (blockData, parentId = null, index) => {
    const { blocks, history, historyIndex } = get();
    const newBlock: Block = {
      ...blockData,
      id: generateId(),
      parent: parentId,
    };

    let newBlocks: Block[];
    if (!parentId) {
      if (index !== undefined) {
        newBlocks = [...blocks];
        newBlocks.splice(index, 0, newBlock);
      } else {
        newBlocks = [...blocks, newBlock];
      }
    } else {
      const addToParent = (blocks: Block[]): Block[] =>
        blocks.map((block) => {
          if (block.id === parentId) {
            const children = block.children || [];
            const newChildren = index !== undefined
              ? [...children.slice(0, index), newBlock, ...children.slice(index)]
              : [...children, newBlock];
            return { ...block, children: newChildren };
          }
          if (block.children) {
            return { ...block, children: addToParent(block.children) };
          }
          return block;
        });
      newBlocks = addToParent(blocks);
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, timestamp: Date.now() });

    set({
      blocks: newBlocks,
      selectedBlockId: newBlock.id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  updateBlock: (id, updates) => {
    const { blocks, history, historyIndex } = get();
    const newBlocks = findAndUpdateBlock(blocks, id, updates);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, timestamp: Date.now() });

    set({
      blocks: newBlocks,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  deleteBlock: (id) => {
    const { blocks, history, historyIndex, selectedBlockId } = get();
    const { newBlocks } = findAndRemoveBlock(blocks, id);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, timestamp: Date.now() });

    set({
      blocks: newBlocks,
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  duplicateBlock: (id) => {
    const { blocks, history, historyIndex } = get();
    const block = findBlock(blocks, id);
    if (!block) return;

    const duplicated = duplicateBlock(block);

    const findParentAndPosition = (
      blocks: Block[], id: string, parent: Block | null = null
    ): { parent: Block | null; index: number } | null => {
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].id === id) return { parent, index: i };
        if (blocks[i].children) {
          const found = findParentAndPosition(blocks[i].children!, id, blocks[i]);
          if (found) return found;
        }
      }
      return null;
    };

    const result = findParentAndPosition(blocks, id);
    if (!result) return;

    const { parent, index } = result;
    const newBlock = { ...duplicated, parent: parent?.id || null };

    let newBlocks: Block[];
    if (parent) {
      newBlocks = findAndUpdateBlock(blocks, parent.id, {
        children: [...(parent.children || []), newBlock],
      });
    } else {
      newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, timestamp: Date.now() });

    set({
      blocks: newBlocks,
      selectedBlockId: newBlock.id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  moveBlock: (dragId, hoverId, parentId) => {
    const { blocks } = get();
    const { block: draggedBlock, newBlocks: blocksAfterRemoval } = findAndRemoveBlock(blocks, dragId);
    if (!draggedBlock) return;

    const insertAtPosition = (
      blocks: Block[], hoverId: string, blockToInsert: Block, parentId?: string
    ): Block[] => {
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].id === hoverId) {
          const newBlocks = [...blocks];
          newBlocks.splice(i, 0, { ...blockToInsert, parent: parentId || null });
          return newBlocks;
        }
        if (blocks[i].children) {
          return blocks.map((b, idx) => {
            if (idx === i && b.children) {
              return { ...b, children: insertAtPosition(b.children, hoverId, blockToInsert, b.id) };
            }
            return b;
          });
        }
      }
      return [...blocks, { ...blockToInsert, parent: parentId || null }];
    };

    const newBlocks = insertAtPosition(blocksAfterRemoval, hoverId, draggedBlock, parentId);
    set({ blocks: newBlocks, isDirty: true });
  },

  selectBlock: (id) => set({ selectedBlockId: id }),
  hoverBlock: (id) => set({ hoveredBlockId: id }),

  setBlocks: (blocks) => set({
    blocks,
    history: [{ blocks, timestamp: Date.now() }],
    historyIndex: 0,
    isDirty: true,
  }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setPreview: (isPreview) => set({ isPreview }),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ blocks: history[newIndex].blocks, historyIndex: newIndex, isDirty: true });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ blocks: history[newIndex].blocks, historyIndex: newIndex, isDirty: true });
    }
  },

  toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),
  toggleRightPanel: () => set((state) => ({ showRightPanel: !state.showRightPanel })),
  setLeftPanelWidth: (width) => set({ leftPanelWidth: width }),
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),

  setDeviceOrientation: (orientation) => set({ deviceOrientation: orientation }),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(150, zoom)) }),
  zoomIn: () => {
    const zoomLevels = [25, 50, 75, 100, 125, 150];
    const idx = zoomLevels.indexOf(get().zoom);
    if (idx < zoomLevels.length - 1) set({ zoom: zoomLevels[idx + 1] });
  },
  zoomOut: () => {
    const zoomLevels = [25, 50, 75, 100, 125, 150];
    const idx = zoomLevels.indexOf(get().zoom);
    if (idx > 0) set({ zoom: zoomLevels[idx - 1] });
  },
  resetZoom: () => set({ zoom: 100 }),
}));
