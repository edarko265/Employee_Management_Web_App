// Remove loading state and conditional rendering for loading/error
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/Buttons';
import {
  Users,
  CheckCircle,
  AlertCircle,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from "../../lib/api";

const getStatusColor = (status: string, t: any) => {
  switch (status) {
    case t('active'):
      return 'bg-green-100 text-green-700 border border-green-200';
    case t('break'):
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case t('offline'):
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getPerformanceBadge = (performance: string, t: any) => {
  switch (performance) {
    case t('excellent'):
      return <Badge className="bg-green-100 text-green-800 border-green-200">{t('excellent')}</Badge>;
    case t('good'):
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('good')}</Badge>;
    default:
      return <Badge variant="secondary">{performance}</Badge>;
  }
};

const SupervisorDashboard = () => {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/supervisor/dashboard")
      .then(res => {
        setDashboard(res.data);
      })
      .catch(err => {
        setError(t("failed_to_load_dashboard"));
      });
  }, [t]);

  if (!dashboard) return null;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  const stats = [
    {
      title: t('my_team'),
      value: dashboard.stats.teamSize,
      change: t('cleaners_supervised'),
      icon: Users,
      color: 'text-[#39092c]',
      accent: 'from-[#a21caf] to-[#39092c]',
    },
    {
      title: t('active_tasks'),
      value: dashboard.stats.activeTasks,
      change: t('currently_assigned'),
      icon: ClipboardList,
      color: 'text-[#a21caf]',
      accent: 'from-[#f3e8ff] to-[#a21caf]',
    },
    {
      title: t('completed_today'),
      value: dashboard.stats.completedToday,
      change: t('tasks_finished'),
      icon: CheckCircle,
      color: 'text-green-700',
      accent: 'from-green-200 to-green-400',
    },
    {
      title: t('alerts'),
      value: dashboard.stats.alerts,
      change: t('require_attention'),
      icon: AlertCircle,
      color: 'text-red-600',
      accent: 'from-red-100 to-red-300',
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="SUPERVISOR" />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="sticky top-3 z-20 bg-transparent">
          <Header />
        </div>
        <div className="space-y-10 mx-auto max-w-7xl">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#39092c]">{t('supervisor_dashboard')}</h1>
              <p className="text-muted-foreground mt-1">{t('monitor_manage_team')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="rounded-lg bg-[#39092c] hover:bg-[#39092c] text-white"
                onClick={() => navigate('/assign-tasks')}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {t('assign_tasks')}
              </Button>
            </div>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="relative overflow-hidden rounded-2xl shadow-lg border-0 bg-white hover:shadow-2xl transition">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${stat.accent} opacity-10 pointer-events-none`} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold text-[#39092c]">{stat.title}</CardTitle>
                    <div className={`rounded-full p-2 bg-[#f3e8ff] ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-extrabold text-[#39092c]">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Status */}
            <Card className="rounded-2xl shadow border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
                  <UserCheck className="w-5 h-5" />
                  <span>{t('team_status')}</span>
                </CardTitle>
                <CardDescription>{t('current_team_status')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.teamMembers.map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-[#a21caf]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#39092c]">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.location} • {member.hours}h {t('today')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(t(member.status.toLowerCase()), t)}`}>
                          {t(member.status.toLowerCase())}
                        </span>
                        <div className="mt-1">{getPerformanceBadge(t(member.performance.toLowerCase()), t)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Pending Reviews */}
            <Card className="rounded-2xl shadow border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#39092c] text-lg font-bold">
                  <ClipboardList className="w-5 h-5" />
                  <span>{t('pending_reviews')}</span>
                </CardTitle>
                <CardDescription>{t('tasks_awaiting_review')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.pendingReviews
                    .filter((review: any) => review.status !== 'COMPLETED')
                    .map((review: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 transition">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#39092c]">{review.task}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('cleaner')}: {review.cleaner} • {t('completed')}: {review.completed}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              review.priority === t('high') ? 'border-red-600 text-red-600' :
                              review.priority === t('medium') ? 'border-yellow-500 text-yellow-700' :
                              'border-muted-foreground text-muted-foreground'
                            }`}
                          >
                            {t(review.priority.toLowerCase())} {t('priority')}
                          </Badge>
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

export default SupervisorDashboard;
