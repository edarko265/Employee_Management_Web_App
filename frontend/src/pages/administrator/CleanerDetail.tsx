import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/Buttons';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { ArrowLeft, MapPin, Phone, Mail, Calendar as CalendarIcon, Users2, Calculator, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

const CleanerDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [cleaner, setCleaner] = useState<any>(null);
  const [workRecords, setWorkRecords] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<{ regularRate: number; overtimeRate: number; sundayOvertimeRate: number }>({ regularRate: 0, overtimeRate: 0, sundayOvertimeRate: 0 });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/cleaner/${id}`)
      .then(res => {
        const data = res.data;
        setCleaner(data);
        setWorkRecords(data.workRecords || []);
        setPaymentSettings(data.paymentSettings || { regularRate: 0, overtimeRate: 0, sundayOvertimeRate: 0 });
      })
      .catch(() => setCleaner(null))
      .finally(() => setLoading(false));
  }, [id]);

  const salaryData = useMemo(() => {
    if (!startDate || !endDate || !workRecords.length) return { totalHours: 0, totalOvertime: 0, regularPay: 0, overtimePay: 0, totalPay: 0 };
    const filteredRecords = workRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    const totalHours = filteredRecords.reduce((sum: number, record: any) => sum + (record.hours || 0), 0);
    const totalOvertime = filteredRecords.reduce((sum: number, record: any) => sum + (record.overtime || 0), 0);
    const regularPay = totalHours * (paymentSettings.regularRate || 0);
    const overtimePay = filteredRecords.reduce((sum: number, record: any) => {
      const rate = record.isSunday ? (paymentSettings.sundayOvertimeRate || 0) : (paymentSettings.overtimeRate || 0);
      return sum + (record.overtime || 0) * rate;
    }, 0);
    const totalPay = regularPay + overtimePay;
    return { totalHours, totalOvertime, regularPay, overtimePay, totalPay };
  }, [startDate, endDate, workRecords, paymentSettings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
        <span className="text-lg text-[#39092c]">{t('loading')}</span>
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
        <span className="text-lg text-red-600">{t('cleaner_not_found')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="ADMIN" />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="sticky top-3 z-20 bg-transparent">
          <Header  />
        </div>
        <div className="space-y-8 max-w-4xl mx-auto py-8">
          {/* Top Bar */}
          <div className="flex items-center gap-4">
            <Link to="/users">
              <Button variant="outline" size="sm" className="border-[#39092c] text-[#39092c] hover:bg-[#39092c] hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back_to_users')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: '#39092c' }}>{t('cleaner_details')}</h1>
              <p className="text-muted-foreground">{t('view_manage_cleaner_info')}</p>
            </div>
          </div>

          {/* Cleaner Info Card */}
          <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#39092c] text-white text-xl font-bold">
                    {cleaner.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl" style={{ color: '#39092c' }}>{cleaner.name}</CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#39092c]" />
                    <span>{cleaner.location}</span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 capitalize">
                  {t(cleaner.status?.toLowerCase())}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#39092c]" />
                    <span>{cleaner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#39092c]" />
                    <span>{cleaner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#39092c]" />
                    <span>{t('joined')}: {cleaner.joinDate ? new Date(cleaner.joinDate).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-[#39092c]" />
                    <span>{t('supervisor')}: {cleaner.supervisor}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('tasks_completed')}:</span>
                    <Badge className="bg-blue-100 text-blue-800">{cleaner.tasksCompleted}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('total_hours')}:</span>
                    <Badge variant="outline" className="border-[#39092c] text-[#39092c] bg-white">{cleaner.totalHours}h</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('overtime_hours')}:</span>
                    <Badge variant="outline" className="border-[#39092c] text-[#39092c] bg-white">{cleaner.overtimeHours}h</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('monthly_average')}:</span>
                    <Badge variant="outline" className="border-[#39092c] text-[#39092c] bg-white">{cleaner.monthlyAverage}h</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Calculator */}
          <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                <Calculator className="w-5 h-5 text-[#39092c]" />
                <span>{t('salary_calculator')}</span>
              </CardTitle>
              <CardDescription>
                {t('calculate_salary_date_range')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: '#39092c' }}>{t('start_date')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-[#39092c] text-[#39092c]",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : t('pick_a_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: '#39092c' }}>{t('end_date')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-[#39092c] text-[#39092c]",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : t('pick_a_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Salary Calculation Results */}
              {startDate && endDate && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-semibold mb-3" style={{ color: '#39092c' }}>{t('salary_calculation')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t('regular_hours')}:</span>
                          <span>{salaryData.totalHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('overtime_hours')}:</span>
                          <span>{salaryData.totalOvertime}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('hourly_rate')}:</span>
                          <span>€{paymentSettings.regularRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('overtime_rate')}:</span>
                          <span>€{paymentSettings.overtimeRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('sunday_hours')} (2x):</span>
                          <span>€{paymentSettings.sundayOvertimeRate.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t('regular_pay')}:</span>
                          <span>€{salaryData.regularPay.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('overtime_pay')}:</span>
                          <span>€{salaryData.overtimePay.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-semibold">
                          <span>{t('total_pay')}:</span>
                          <span>€{salaryData.totalPay.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Records Table */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2" style={{ color: '#39092c' }}>
                  <Clock className="w-4 h-4 text-[#39092c]" />
                  <span>{t('recent_work_records')}</span>
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3" style={{ color: '#39092c' }}>{t('date')}</th>
                        <th className="text-left p-3" style={{ color: '#39092c' }}>{t('regular_hours')}</th>
                        <th className="text-left p-3" style={{ color: '#39092c' }}>{t('overtime_hours')}</th>
                        <th className="text-left p-3" style={{ color: '#39092c' }}>{t('total_hours')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workRecords.map((record, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="p-3">{record.hours}h</td>
                          <td className="p-3">{record.overtime}h</td>
                          <td className="p-3">{(record.hours || 0) + (record.overtime || 0)}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CleanerDetail;
