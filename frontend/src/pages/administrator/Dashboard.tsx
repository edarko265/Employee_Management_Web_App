import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Users,
  MapPin,
  Clock,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { FaEuroSign } from 'react-icons/fa';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Buttons';

interface StatData {
  totalCleaners: number;
  activeAssignments: number;
  totalHours: number;
  totalPayroll: number;
}

interface Activity {
  name: string;
  action: string;
  location: string;
  time: string;
}

interface Assignment {
  workplace: string;
  cleaner: string;
  status: string;
  priority: string;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatData>({
    totalCleaners: 0,
    activeAssignments: 0,
    totalHours: 0,
    totalPayroll: 0,
  });

  const [activity, setActivity] = useState<Activity[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        const activityRes = await api.get('/admin/recent-activity');
        const assignmentsRes = await api.get('/admin/assignments');

        setStats({
          totalCleaners: statsRes.data.totalCleaners ?? 0,
          activeAssignments: statsRes.data.activeAssignments ?? 0,
          totalHours: statsRes.data.hoursThisWeek ?? 0,
          totalPayroll: statsRes.data.payrollThisWeek ?? 0,
        });

        setActivity(activityRes.data || []);
        setAssignments(assignmentsRes.data || []);
      } catch (error) {
        console.error('Dashboard load error:', error);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: t('total_cleaners'),
      value: stats.totalCleaners.toString(),
      change: t('change_total_cleaners'),
      icon: Users,
      color: 'text-[#39092c]',
      accent: 'from-[#a21caf] to-[#39092c]',
    },
    {
      title: t('active_assignments'),
      value: stats.activeAssignments.toString(),
      change: t('change_active_assignments'),
      icon: MapPin,
      color: 'text-[#a21caf]',
      accent: 'from-[#f3e8ff] to-[#a21caf]',
    },
    {
      title: t('hours_this_week'),
      value: stats.totalHours.toFixed(1),
      change: t('change_hours_this_week'),
      icon: Clock,
      color: 'text-green-700',
      accent: 'from-green-200 to-green-400',
    },
    {
      title: t('total_payroll'),
      value: stats.totalPayroll ? `€${stats.totalPayroll.toFixed(2)}` : '€0.00',
      change: t('change_total_payroll'),
      icon: FaEuroSign,
      color: 'text-yellow-600',
      accent: 'from-yellow-100 to-yellow-300',
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="ADMIN" />
      </div>

      <div className="flex-1 p-6 md:p-10">
        <div className="sticky top-0 z-20 bg-transparent">
          <Header />
        </div>

        <div className="space-y-10 mt-4 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#39092c]">
                {t('admin_dashboard')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('overview_cleaning_operations')}
              </p>
            </div>
            <Button
              className="bg-[#39092c] hover:bg-[#4e1850] text-white px-6 py-2 rounded-lg font-semibold"
              onClick={() => navigate('/admin-assign-task')}
            >
              {t('assign_task')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="rounded-2xl shadow border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('recent_activity')}</span>
                </CardTitle>
                <CardDescription>
                  {t('latest_updates_cleaning_team')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-[#a21caf]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#39092c]">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.action} • {item.location}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assignments */}
            <Card className="rounded-2xl shadow border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
                  <MapPin className="w-5 h-5" />
                  <span>{t('current_assignments')}</span>
                </CardTitle>
                <CardDescription>
                  {t('active_cleaning_assignments_overview')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-[#39092c]">
                            {assignment.workplace}
                          </p>
                          <Badge
                            variant={
                              assignment.status === t('completed')
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {t(assignment.status?.toLowerCase())}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {t('assigned_to')}: {assignment.cleaner}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              assignment.priority === t('high')
                                ? 'border-red-600 text-red-600'
                                : assignment.priority === t('medium')
                                ? 'border-yellow-500 text-yellow-700'
                                : 'border-muted-foreground text-muted-foreground'
                            }`}
                          >
                            {t(assignment.priority?.toLowerCase())} {t('priority')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
