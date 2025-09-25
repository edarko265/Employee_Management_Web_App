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

const Reports = () => {
  const { t } = useTranslation();
  const { toast } = useToast?.() || {};

  // State for real data
  const [taskReports, setTaskReports] = useState<any[]>([]);
  const [attendanceReports, setAttendanceReports] = useState<any[]>([]);
  const [performanceReports, setPerformanceReports] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/supervisor/report/tasks'),
      api.get('/supervisor/report/attendance'),
      api.get('/supervisor/report/performance'),
    ])
      .then(([tasksRes, attendanceRes, perfRes]) => {
        setTaskReports(tasksRes.data);
        setAttendanceReports(attendanceRes.data);
        setPerformanceReports(perfRes.data);
      });
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
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
    toast?.({
    title: t('export_successful'),
    description: t('csv_downloaded', { filename }),
    });
  };

  const exportToPDF = (filename: string, type: 'tasks' | 'attendance' | 'performance') => {
    if (type === 'tasks') {
      const headers = [t('task'), t('assignee'), t('workplace'), t('status'), t('completed_date')];
      const rows = taskReports.map((task) => [
        task.task ?? '',
        task.assignee ?? '',
        task.workplace ?? t('unknown'),
        t(task.status?.toLowerCase?.() || String(task.status || '')),
        task.completedDate ?? '',
      ]);
      exportTableToPDF({ title: t('task_completion_report'), headers, rows, filename });
    } else if (type === 'attendance') {
      const headers = [t('employee'), t('date'), t('check_in'), t('check_out'), t('total_hours')];
      const rows = attendanceReports.map((r) => [
        r.employee ?? '', r.date ?? '', r.checkIn ?? '', r.checkOut ?? '', r.hours ?? ''
      ]);
      exportTableToPDF({ title: t('attendance_report'), headers, rows, filename });
    } else {
      const headers = [t('employee'), t('tasks_completed'), t('tasks_assigned'), t('efficiency'), t('rating')];
      const rows = performanceReports.map((r) => [
        r.employee ?? '', r.tasksCompleted ?? '', r.tasksAssigned ?? '', r.efficiency ?? '', r.rating ?? ''
      ]);
      exportTableToPDF({ title: t('performance_report'), headers, rows, filename });
    }
    toast?.({
      title: t('export_started', { defaultValue: 'Export started' }),
      description: t('use_browser_save_pdf', { defaultValue: 'Use your browser dialog to save as PDF.' }),
    });
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 z-30 flex-shrink-0 w-full md:w-64 h-16 md:h-screen">
        <Sidebar role="SUPERVISOR" />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-2 xs:p-4 sm:p-6 md:p-10 w-full">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-transparent">
          <Header />
        </div>
        <div className="space-y-8 mt-4 mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#39092c]">{t('reports_analytics')}</h1>
              <p className="text-muted-foreground mt-2">{t('reports_analytics_desc')}</p>
            </div>
          </div>
          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 bg-white rounded-lg shadow mb-6">
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
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-[#39092c]">{t('task_completion_report')}</CardTitle>
                    <CardDescription>{t('task_completion_report_desc')}</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(taskReports, 'task-report')}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t('export_csv')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF('task-report', 'tasks')}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('export_pdf')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">{t('task')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('assignee')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('workplace')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('status')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('completed_date')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskReports.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium truncate max-w-[120px]">{task.task}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{task.assignee}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{task.workplace}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{getStatusBadge(task.status)}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{task.completedDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance" className="space-y-4">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-[#39092c]">{t('attendance_report')}</CardTitle>
                    <CardDescription>{t('attendance_report_desc')}</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(attendanceReports, 'attendance-report')}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t('export_csv')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF('attendance-report', 'attendance')}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('export_pdf')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">{t('employee')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('date')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('check_in')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('check_out')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('total_hours')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceReports.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium truncate max-w-[120px]">{record.employee}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.date}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.checkIn}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.checkOut}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.hours}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="performance" className="space-y-4">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-[#39092c]">{t('performance_report')}</CardTitle>
                    <CardDescription>{t('performance_report_desc')}</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(performanceReports, 'performance-report')}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t('export_csv')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToPDF('performance-report', 'performance')}
                      className="flex items-center space-x-2 w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t('export_pdf')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">{t('employee')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('tasks_completed')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('tasks_assigned')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('efficiency')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('rating')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performanceReports.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium truncate max-w-[120px]">{record.employee}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.tasksCompleted}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.tasksAssigned}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{record.efficiency}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{getRatingBadge(record.rating)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Reports;
