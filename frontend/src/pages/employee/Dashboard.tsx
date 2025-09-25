import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import ClockWidget from "../../components/ClockWidget";
import { MapPin, AlertCircle, Calendar, Clock, TrendingUp, UserCheck } from "lucide-react";
import { FaTasks } from "react-icons/fa";
import api from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

type Assignment = {
  id: string;
  workplace: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  priority: string;
  specialInstructions?: string | null;
  completedAt?: string | null;
};

type AttendanceItem = {
  id: string;
  clockIn: string;
  clockOut: string;
  createdAt: string;
};

interface DashboardData {
  punchInHours: number;
  punchInHoursYesterday: number;
  weeklyHours: number;
  weeklyHoursLastWeek: number;
  totalToDo: number;
  totalToDoYesterday: number;
  totalDone: number;
  totalDoneYesterday: number;
  assignments: Assignment[];
  attendance?: AttendanceItem[];
}

const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    api.get("/employee/dashboard").then((res: { data: DashboardData }) => setDashboard(res.data)).catch(() => setDashboard(null));
  }, []);

  const getChangeText = (current: number, previous: number, label: string) => {
    if (previous === 0) return t('no_previous_data');
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    const direction = diff > 0 ? "+" : "";
    return `${direction}${percent}% ${diff > 0 ? t('more') : t('less')} ${t('than')} ${t(label)}`;
  };

  // Stat Card using Card component, with icon and accent
  const statCards = [
    {
      title: t('total_punch_in_hours'),
      value: dashboard?.punchInHours?.toFixed(2) ?? "0",
      change: getChangeText(
        dashboard?.punchInHours ?? 0,
        dashboard?.punchInHoursYesterday ?? 0,
        "yesterday"
      ),
      icon: Clock,
      color: "text-[#39092c]",
      accent: "from-[#a21caf] to-[#39092c]",
    },
    {
      title: t('total_weekly_hours'),
      value: dashboard?.weeklyHours?.toFixed(2) ?? "0",
      change: getChangeText(
        dashboard?.weeklyHours ?? 0,
        dashboard?.weeklyHoursLastWeek ?? 0,
        "last_week"
      ),
      icon: TrendingUp,
      color: "text-green-700",
      accent: "from-green-200 to-green-400",
    },
    {
      title: t('total_task_to_do'),
      value: dashboard?.totalToDo ?? "0",
      change: getChangeText(
        dashboard?.totalToDo ?? 0,
        dashboard?.totalToDoYesterday ?? 0,
        "yesterday"
      ),
      icon: FaTasks,
      color: "text-yellow-600",
      accent: "from-yellow-100 to-yellow-300",
    },
    {
      title: t('total_task_done'),
      value: dashboard?.totalDone ?? "0",
      change: getChangeText(
        dashboard?.totalDone ?? 0,
        dashboard?.totalDoneYesterday ?? 0,
        "yesterday"
      ),
      icon: UserCheck,
      color: "text-[#a21caf]",
      accent: "from-[#f3e8ff] to-[#a21caf]",
    },
  ];

  // Assignment Card using Card component, with badges and description
  const AssignmentCard = ({ assignments }: { assignments: Assignment[] }) => {
    const today = new Date().toISOString().split("T")[0];
    const todayAssignments = (assignments || []).filter((a: Assignment) => a.date === today && a.status !== "COMPLETED");
    return (
      <Card className="w-full rounded-2xl shadow border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
            <MapPin className="w-5 h-5" />
            <span>{t('todays_assignment')}</span>
          </CardTitle>
          <CardDescription>{t('details_current_assignment')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAssignments.length > 0 ? todayAssignments.map((assignment: Assignment) => (
              <div key={assignment.id} className="flex flex-col gap-2 p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 transition">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-[#39092c]">{assignment.workplace}</p>
                  <Badge variant={assignment.status === "COMPLETED" ? "default" : "secondary"} className="text-xs">{assignment.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Start: {assignment.startTime} • Duration: {assignment.duration}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`text-xs ${assignment.priority === "High" ? "border-red-600 text-red-600" : assignment.priority === "Medium" ? "border-yellow-500 text-yellow-700" : "border-muted-foreground text-muted-foreground"}`}>{assignment.priority} Priority</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-1">{assignment.description}</p>
                {assignment.specialInstructions && (
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2 mt-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-700">{t('special_instructions')}</p>
                      <p className="text-sm text-yellow-700">{assignment.specialInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            )) : <div className="text-gray-500 text-center py-8">{t('no_assignment_today')}</div>}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Schedule Card using Card component, with badges and description
  const ScheduleCard = ({ assignments }: { assignments: Assignment[] }) => {
    // Show upcoming assignments (future date or status UPCOMING/PENDING)
    const now = new Date().toISOString().split("T")[0];
    const upcoming = (assignments || []).filter((a: Assignment) => a.date > now || ["UPCOMING", "PENDING"].includes(a.status));
    return (
      <Card className="w-full rounded-2xl shadow border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
            <Calendar className="w-6 h-6 text-[#39092c]" />
            <span>{t('upcoming_schedule')}</span>
          </CardTitle>
          <CardDescription>{t('assignments_next_days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcoming.length > 0 ? upcoming.map((assignment: Assignment, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#e0e7ff]/60 transition">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-[#39092c]">{assignment.workplace}</p>
                  <Badge variant={assignment.status === "COMPLETED" ? "default" : "secondary"} className="text-xs">{assignment.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Date: {assignment.date} • Start: {assignment.startTime}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`text-xs ${assignment.priority === "High" ? "border-red-600 text-red-600" : assignment.priority === "Medium" ? "border-yellow-500 text-yellow-700" : "border-muted-foreground text-muted-foreground"}`}>{assignment.priority} Priority</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-1">{assignment.description}</p>
              </div>
            )) : <div className="text-gray-500 text-center py-8">{t('no_upcoming_schedule')}</div>}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Attendance Overview using Card component, with icon and description
  const AttendanceOverview = ({ attendance }: { attendance: AttendanceItem[] }) => {
    const getDuration = (inTime: string, outTime: string) => {
      const inDate = new Date(inTime);
      const outDate = new Date(outTime);
      const diff = outDate.getTime() - inDate.getTime();
      if (isNaN(diff) || diff <= 0) return "—";
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };
    const logs = (attendance || []).slice(0, 5);
    return (
      <Card className="w-full rounded-2xl shadow border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
            <TrendingUp className="w-5 h-5" />
            <span>{t('recent_attendance')}</span>
          </CardTitle>
          <CardDescription>{t('latest_punch_records')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">{t('no_recent_records')}</p>
            ) : (
              logs.map((log: AttendanceItem) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 transition">
                  <div>
                    <p className="font-medium text-[#a21caf]">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-500 text-xs">{new Date(log.clockIn).toLocaleTimeString()} - {log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : "—"}</p>
                  </div>
                  <span className="font-semibold text-xs">{getDuration(log.clockIn, log.clockOut)}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sticky Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="EMPLOYEE" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10">
        {/* Sticky Header */}
        <div className="sticky top-3 z-20 bg-transparent">
          <Header />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4 mb-8 gap-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#39092c] mb-2">{t('dashboard')}</h2>
        </div>

        {/* Widgets and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <ClockWidget />
          <div className="grid grid-cols-2 gap-6 w-full">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className="relative overflow-hidden rounded-2xl shadow-lg border-0 bg-white"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${stat.accent} opacity-10 pointer-events-none`}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold text-[#39092c]">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`rounded-full p-2 bg-[#f3e8ff] ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-extrabold text-[#39092c]">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Assignments and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          <AssignmentCard assignments={dashboard?.assignments ?? []} />
          <ScheduleCard assignments={dashboard?.assignments ?? []} />
        </div>

        {/* Recent Attendance Overview */}
        <div className="mt-12">
          <AttendanceOverview attendance={dashboard?.attendance ?? []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

