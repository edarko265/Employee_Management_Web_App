import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Button } from '../../components/ui/Buttons';
import { Calendar, Clock, MapPin, Euro, Download } from 'lucide-react';

type AttendanceRecord = {
  id: string | number;
  assignmentTitle: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  workplace: string;
  overtime: number;
  sundayHours?: number;
  weekdayOvertimeHours?: number;
  status: string;
};

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [rates, setRates] = useState<{ regularRate: number; overtimeRate: number; sundayOvertimeRate: number }>({ regularRate: 18.5, overtimeRate: 18.5 * 1.5, sundayOvertimeRate: 18.5 * 2 });
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/employee/attendance-history')
      .then((res) => setAttendanceData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAttendanceData([]));
  }, []);

  useEffect(() => {
    api.get('/employee/payment-settings')
      .then((res) => setRates({
        regularRate: res.data.regularRate ?? 18.5,
        overtimeRate: res.data.overtimeRate ?? ((res.data.regularRate ?? 18.5) * 1.5),
        sundayOvertimeRate: res.data.sundayOvertimeRate ?? ((res.data.regularRate ?? 18.5) * 2),
      }));
  }, []);

  const totalHoursThisWeek = attendanceData.reduce((sum, record) => sum + record.totalHours, 0);
  const totalOvertimeThisWeek = attendanceData.reduce((sum, record) => sum + record.overtime, 0);

  // Calculate total earnings including Sunday overtime
  const getTotalEarningsThisWeek = () => {
    let total = 0;
    attendanceData.forEach(record => {
      // Prefer server-provided breakdown when available
      if (typeof record.sundayHours === 'number' && typeof record.weekdayOvertimeHours === 'number') {
        const regular = Math.max(0, record.totalHours - (record.weekdayOvertimeHours || 0) - (record.sundayHours || 0));
        total += regular * rates.regularRate + (record.weekdayOvertimeHours || 0) * rates.overtimeRate + (record.sundayHours || 0) * rates.sundayOvertimeRate;
        return;
      }
      const dateObj = new Date(record.date);
      const isSunday = dateObj.getDay() === 0;
      if (isSunday) {
        total += record.totalHours * rates.sundayOvertimeRate;
      } else {
        total += (record.totalHours - record.overtime) * rates.regularRate + record.overtime * rates.overtimeRate;
      }
    });
    return total.toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getEarnings = (record: AttendanceRecord) => {
    // Parse the date string to a Date object
    const dateObj = new Date(record.date);
    const isSunday = dateObj.getDay() === 0; // Sunday is 0

    // Prefer server-provided breakdown when available
    if (typeof record.sundayHours === 'number' && typeof record.weekdayOvertimeHours === 'number') {
      const regular = Math.max(0, record.totalHours - (record.weekdayOvertimeHours || 0) - (record.sundayHours || 0));
      return (
        regular * rates.regularRate +
        (record.weekdayOvertimeHours || 0) * rates.overtimeRate +
        (record.sundayHours || 0) * rates.sundayOvertimeRate
      ).toFixed(2);
    }

    if (isSunday) {
      return (record.totalHours * rates.sundayOvertimeRate).toFixed(2);
    } else {
      return (
        (record.totalHours - record.overtime) * rates.regularRate +
        record.overtime * rates.overtimeRate
      ).toFixed(2);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="EMPLOYEE" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-transparent">
          <Header />
        </div>

        <div className="space-y-10 mx-auto">
          {/* Page Title & Export */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#39092c]">{t('attendance_history')}</h1>
              <p className="text-muted-foreground">{t('track_work_hours')}</p>
            </div>
            {/* <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button> */}
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 ">
            <div className="rounded-2xl bg-gradient-to-r from-white to-[#f3e8ff] shadow-lg p-6 flex flex-col gap-2 border border-[#f3e8ff]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#39092c]">{t('hours_this_week')}</span>
                <Clock className="h-5 w-5 text-[#39092c]" />
              </div>
              <div className="text-3xl font-bold text-[#39092c] truncate max-w-[120px]">{totalHoursThisWeek}h</div>
              <p className="text-xs text-gray-500">{t('regular')}: {(totalHoursThisWeek - totalOvertimeThisWeek).toFixed(2)}h</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-white to-[#f3e8ff] shadow-lg p-6 flex flex-col gap-2 border border-[#f3e8ff]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#39092c]">{t('overtime')}</span>
                <Clock className="h-5 w-5 text-[#39092c]" />
              </div>
              <div className="text-3xl font-bold text-[#39092c] truncate max-w-[120px]">{totalOvertimeThisWeek}h</div>
              <p className="text-xs text-gray-500">{t('this_week')}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-white to-[#f3e8ff] shadow-lg p-6 flex flex-col gap-2 border border-[#f3e8ff]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#39092c]">{t('total_earnings')}</span>
                <Euro className="h-5 w-5 text-[#39092c]" />
              </div>
              <div className="text-3xl font-bold text-green-700 truncate max-w-[120px]">
                €{getTotalEarningsThisWeek()}
              </div>
              <p className="text-xs text-gray-500">{t('this_week')}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-white to-[#f3e8ff] shadow-lg p-6 flex flex-col gap-2 border border-[#f3e8ff]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#39092c]">{t('days_worked')}</span>
                <Calendar className="h-5 w-5 text-[#39092c]" />
              </div>
              <div className="text-3xl font-bold text-[#39092c] truncate max-w-[120px]">{attendanceData.length}</div>
              <p className="text-xs text-gray-500">{t('this_week')}</p>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div>
            <h2 className="text-xl font-semibold text-[#39092c] mb-6 ">{t('attendance')}</h2>
            <div className="space-y-4">
              {attendanceData.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Clock className="w-14 h-14 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t('no_attendance_records')}</p>
                </div>
              ) : (
                attendanceData.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-white to-[#f3e8ff] shadow border border-[#f3e8ff] hover:shadow-xl transition"
                  >
                    {/* <span className="font-medium text-[#39092c]">{record.assignmentTitle}</span> */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#39092c]" />
                          <span className="font-medium text-[#39092c]">{record.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{record.workplace}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">{t('clock_in')}</div>
                        <div className="font-medium text-[#39092c]">{record.clockIn}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">{t('clock_out')}</div>
                        <div className="font-medium text-[#39092c]">{record.clockOut}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">{t('total_hours')}</div>
                        <div className="font-medium text-[#39092c]">{record.totalHours}h</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">{t('earnings')}</div>
                        <div className="font-medium text-green-700">
                          €{getEarnings(record)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
