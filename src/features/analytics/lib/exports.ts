import type { Dashboard, DashboardWidget, ExportOptions } from '../types';

// =====================================================
// Export Utilities
// =====================================================

export async function exportDashboardAsPDF(
  dashboard: Dashboard,
  options: ExportOptions = { format: 'pdf' }
): Promise<Blob> {
  // This is a placeholder - actual PDF generation would require a library like jsPDF or html2pdf
  // For now, we'll create a simple HTML-based export that can be printed to PDF

  const { format, includeTitle = true, includeTimestamp = true, filename: _filename } = options;

  const html = generateDashboardHTML(dashboard, { includeTitle, includeTimestamp });

  if (format === 'pdf') {
    // In a real implementation, you would use a library here
    // For now, return as HTML blob that can be opened and printed
    return new Blob([html], { type: 'text/html' });
  }

  throw new Error(`Format ${format} not yet implemented for dashboard export`);
}

export async function exportWidgetData(
  widget: DashboardWidget,
  data: any[],
  options: ExportOptions = { format: 'csv' }
): Promise<Blob> {
  const { format, filename } = options;

  switch (format) {
    case 'csv':
      return exportToCSV(data, filename || `${widget.id}.csv`);
    case 'json':
      return exportToJSON(data, filename || `${widget.id}.json`);
    case 'excel':
      return exportToExcel(data, filename || `${widget.id}.xlsx`);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export async function exportReportData(
  data: any[],
  options: ExportOptions = { format: 'csv' }
): Promise<Blob> {
  const { format, filename = 'report' } = options;

  switch (format) {
    case 'csv':
      return exportToCSV(data, `${filename}.csv`);
    case 'json':
      return exportToJSON(data, `${filename}.json`);
    case 'excel':
      return exportToExcel(data, `${filename}.xlsx`);
    case 'pdf':
      // Placeholder for PDF export
      const html = generateReportHTML(data);
      return new Blob([html], { type: 'text/html' });
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// =====================================================
// CSV Export
// =====================================================

function exportToCSV(data: any[], _filename: string): Blob {
  if (data.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

// =====================================================
// JSON Export
// =====================================================

function exportToJSON(data: any[], _filename: string): Blob {
  const jsonContent = JSON.stringify(data, null, 2);
  return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
}

// =====================================================
// Excel Export (Simplified)
// =====================================================

function exportToExcel(data: any[], filename: string): Blob {
  // This is a simplified version - a real implementation would use a library like xlsx
  // For now, we'll export as CSV with .xlsx extension
  // In production, you would use: import * as XLSX from 'xlsx';
  console.warn('Excel export not fully implemented - falling back to CSV');
  return exportToCSV(data, filename.replace('.xlsx', '.csv'));
}

// =====================================================
// HTML Generation for PDF Export
// =====================================================

function generateDashboardHTML(
  dashboard: Dashboard,
  options: { includeTitle?: boolean; includeTimestamp?: boolean }
): string {
  const { includeTitle, includeTimestamp } = options;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${dashboard.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .dashboard-header {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .dashboard-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 8px 0;
    }
    .dashboard-description {
      color: #666;
      margin: 0;
    }
    .dashboard-timestamp {
      color: #999;
      font-size: 12px;
      margin-top: 8px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .widget {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      break-inside: avoid;
    }
    .widget-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    .widget-content {
      min-height: 200px;
    }
    @media print {
      body {
        background: white;
      }
      .widget {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
`;

  // Add header
  if (includeTitle || includeTimestamp) {
    html += '<div class="dashboard-header">';
    if (includeTitle) {
      html += `<h1 class="dashboard-title">${dashboard.name}</h1>`;
      if (dashboard.description) {
        html += `<p class="dashboard-description">${dashboard.description}</p>`;
      }
    }
    if (includeTimestamp) {
      html += `<div class="dashboard-timestamp">Generated: ${new Date().toLocaleString()}</div>`;
    }
    html += '</div>';
  }

  // Add widgets
  html += '<div class="dashboard-grid">';
  dashboard.widgets.forEach((widget) => {
    html += `
      <div class="widget">
        <h3 class="widget-title">${widget.title}</h3>
        <div class="widget-content">
          <p style="color: #999; text-align: center; padding: 40px 0;">
            Widget content would be rendered here
          </p>
        </div>
      </div>
    `;
  });
  html += '</div>';

  html += `
</body>
</html>`;

  return html;
}

function generateReportHTML(data: any[]): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <h1>Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
`;

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    html += '<thead><tr>';
    headers.forEach((header) => {
      html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.forEach((row) => {
      html += '<tr>';
      headers.forEach((header) => {
        html += `<td>${row[header] ?? ''}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody>';
  }

  html += `
  </table>
</body>
</html>`;

  return html;
}

// =====================================================
// File Download Helper
// =====================================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =====================================================
// Print Helper
// =====================================================

export function printDashboard(dashboard: Dashboard): void {
  const html = generateDashboardHTML(dashboard, {
    includeTitle: true,
    includeTimestamp: true,
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

// =====================================================
// Share Helper
// =====================================================

export async function generateShareableLink(
  dashboard: Dashboard,
  baseUrl: string
): Promise<string> {
  // In a real implementation, this would create a shareable link
  // possibly with authentication tokens or public access settings
  const shareId = btoa(`${dashboard.id}:${Date.now()}`);
  return `${baseUrl}/analytics/dashboards/shared/${shareId}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}
