import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Buttons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/badge';
import { FileText, FileSpreadsheet, Calendar, Users, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import api from '../../lib/api';
import { exportTableToPDF } from '../../lib/pdfExport';

const AdminReports = () => {
  const { toast } = useToast?.() || {};
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  // State for reports
  const [taskReports, setTaskReports] = useState<any[]>([]);
  const [attendanceReports, setAttendanceReports] = useState<any[]>([]);
  const [performanceReports, setPerformanceReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/reports/tasks'),
      api.get('/admin/reports/attendance'),
      api.get('/admin/reports/performance'),
    ])
      .then(([tasks, attendance, performance]) => {
        setTaskReports(tasks.data);
        setAttendanceReports(attendance.data);
        setPerformanceReports(performance.data);
      })
      .catch(() => {
    toast?.({ title: t('error'), description: t('failed_to_load_reports') });
      })
      .finally(() => setLoading(false));
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    setIsExporting(true);
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] ?? ''}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setIsExporting(false);
      toast?.({
        title: t('export_successful'),
        description: t('csv_downloaded', { filename }),
      });
    }, 1000);
  };

  const exportToPDF = (filename: string, type: 'tasks' | 'attendance' | 'performance') => {
    try {
      setIsExporting(true);
      if (type === 'tasks') {
        const headers = [t('task'), t('assignee'), t('workplace'), t('status'), t('completed_date')];
        const rows = taskReports.map((task) => [
          task.task ?? '',
          task.assignee ?? '',
          task.workplace ?? t('unknown'),
          t(task.status?.toLowerCase?.() || String(task.status || '')),
          task.completedDate ?? '',
        ]);
        exportTableToPDF({
          title: t('task_completion_report'),
          headers,
          rows,
          filename,
        });
      } else if (type === 'attendance') {
        const headers = [t('employee'), t('date'), t('check_in'), t('check_out'), t('total_hours')];
        const rows = attendanceReports.map((r) => [
          r.employee ?? '',
          r.date ?? '',
          r.checkIn ?? '',
          r.checkOut ?? '',
          r.hours ?? '',
        ]);
        exportTableToPDF({
          title: t('attendance_report'),
          headers,
          rows,
          filename,
        });
      } else {
        const headers = [t('employee'), t('tasks_completed'), t('tasks_assigned'), t('efficiency'), t('rating')];
        const rows = performanceReports.map((r) => [
          r.employee ?? '',
          r.tasksCompleted ?? '',
          r.tasksAssigned ?? '',
          r.efficiency ?? '',
          r.rating ?? '',
        ]);
        exportTableToPDF({
          title: t('performance_report'),
          headers,
          rows,
          filename,
        });
      }
      toast?.({
        title: t('export_started', { defaultValue: 'Export started' }),
        description: t('use_browser_save_pdf', { defaultValue: 'Use your browser dialog to save as PDF.' }),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t('completed')}</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('in_progress')}</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t('pending')}</Badge>;
      default:
        return <Badge variant="secondary">{t(status)}</Badge>;
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t('excellent')}</Badge>;
      case 'Good':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('good')}</Badge>;
      case 'Average':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('average')}</Badge>;
      default:
        return <Badge variant="secondary">{t(rating)}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="ADMIN" />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-transparent">
          <Header />
        </div>
        <div className="space-y-8 mt-4 mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#39092c]">{t('reports_analytics')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('reports_analytics_desc')}
              </p>
            </div>
          </div>
          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow mb-6">
              <TabsTrigger value="tasks" className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{t('task_reports')}</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{t('attendance')}</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{t('performance')}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-4">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-[#39092c]">{t('task_completion_report')}</CardTitle>
                    <CardDescription>
                      {t('task_completion_report_desc')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(taskReports, 'task-report')}
                      disabled={isExporting || !taskReports.length}
                      className="flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t('export_csv')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF('task-report', 'tasks')}
                      disabled={isExporting}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('export_pdf')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('task')}</TableHead>
                          <TableHead>{t('assignee')}</TableHead>
                          <TableHead>{t('workplace')}</TableHead>
                          <TableHead>{t('status')}</TableHead>
                          <TableHead>{t('completed_date')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taskReports.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.task}</TableCell>
                            <TableCell>{task.assignee}</TableCell>
                            <TableCell>{task.workplace ?? t('unknown')}</TableCell>
                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                            <TableCell>{task.completedDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance" className="space-y-4">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-[#39092c]">{t('attendance_report')}</CardTitle>
                    <CardDescription>
                      {t('attendance_report_desc')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(attendanceReports, 'attendance-report')}
                      disabled={isExporting || !attendanceReports.length}
                      className="flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t('export_csv')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF('attendance-report', 'attendance')}
                      disabled={isExporting}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('export_pdf')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('employee')}</TableHead>
                          <TableHead>{t('date')}</TableHead>
                          <TableHead>{t('check_in')}</TableHead>
                          <TableHead>{t('check_out')}</TableHead>
                          <TableHead>{t('total_hours')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceReports.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.employee}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.checkIn}</TableCell>
                            <TableCell>{record.checkOut}</TableCell>
                            <TableCell>{record.hours}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="performance" className="space-y-4">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-[#39092c]">{t('performance_report')}</CardTitle>
                    <CardDescription>
                      {t('performance_report_desc')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(performanceReports, 'performance-report')}
                      disabled={isExporting || !performanceReports.length}
                      className="flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t('export_csv')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF('performance-report', 'performance')}
                      disabled={isExporting}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('export_pdf')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('employee')}</TableHead>
                          <TableHead>{t('tasks_completed')}</TableHead>
                          <TableHead>{t('tasks_assigned')}</TableHead>
                          <TableHead>{t('efficiency')}</TableHead>
                          <TableHead>{t('rating')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceReports.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.employee}</TableCell>
                            <TableCell>{record.tasksCompleted}</TableCell>
                            <TableCell>{record.tasksAssigned}</TableCell>
                            <TableCell>{record.efficiency}</TableCell>
                            <TableCell>{getRatingBadge(record.rating)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
