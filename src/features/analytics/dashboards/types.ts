// Placeholder types - these tables don't exist yet in the database schema
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  config: DashboardConfig;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rowHeight: number;
  };
  refreshInterval?: number;
}

export interface DashboardMetadata {
  id: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
}

export interface DashboardViewOptions {
  readonly: boolean;
  editMode: boolean;
  showTitle: boolean;
  compactMode: boolean;
}

export interface DashboardExportOptions {
  format: 'json' | 'pdf' | 'png';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
