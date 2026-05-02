import { Link } from 'react-router-dom';
import { Plus, FileText, Download, Calendar } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled, CardContent } from '@/components/ui/card-untitled';

export function ReportList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">
            Create, schedule, and manage your reports
          </p>
        </div>
        <Link to="/analytics/reports/new">
          <ButtonUntitled variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </ButtonUntitled>
        </Link>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardUntitled className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Custom Reports</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Build your own reports with custom queries
            </p>
            <ButtonUntitled variant="outline" size="sm">
              Create Report
            </ButtonUntitled>
          </CardContent>
        </CardUntitled>

        <CardUntitled className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Scheduled Reports</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Automate report delivery to your inbox
            </p>
            <ButtonUntitled variant="outline" size="sm">
              Schedule Report
            </ButtonUntitled>
          </CardContent>
        </CardUntitled>

        <CardUntitled className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Download className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Export Data</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Export your data as CSV, PDF, or Excel
            </p>
            <ButtonUntitled variant="outline" size="sm">
              Export Now
            </ButtonUntitled>
          </CardContent>
        </CardUntitled>
      </div>

      {/* Recent Reports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
        <CardUntitled>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No reports yet. Create your first report!
            </p>
            <Link to="/analytics/reports/new">
              <ButtonUntitled variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </ButtonUntitled>
            </Link>
          </CardContent>
        </CardUntitled>
      </div>
    </div>
  );
}
