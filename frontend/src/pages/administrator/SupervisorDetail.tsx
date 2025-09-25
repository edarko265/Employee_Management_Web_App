import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/Buttons';
import { ArrowLeft, MapPin, Users2, Phone, Mail, Calendar, User } from 'lucide-react';
import api from '../../lib/api';

const SupervisorDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/admin/supervisor/${id}`)
      .then(res => setSupervisor(res.data))
      .catch(() => setSupervisor(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <span className="text-lg text-[#39092c]">{t('loading')}</span>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">{t('supervisor_not_found')}</h2>
        <p className="text-muted-foreground">{t('supervisor_not_exist')}</p>
        <Button onClick={() => navigate('/users')} variant="outline" className="border-[#39092c] text-[#39092c] hover:bg-[#39092c] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back_to_users')}
        </Button>
      </div>
    );
  }

  const assignedCleaners = supervisor.assignedCleaners || [];
  const stats = supervisor.stats || {};

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
        <div className="space-y-8 max-w-6xl mx-auto py-8">
          {/* Top Bar */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/users')}
              className="border-[#39092c] text-[#39092c] hover:bg-[#39092c] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back_to_users')}
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: '#39092c' }}>{supervisor.name}</h1>
              <p className="text-muted-foreground">{t('supervisor_details')}</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Supervisor Information */}
            <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                  <User className="w-5 h-5 text-[#39092c]" />
                  <span>{t('supervisor_information')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-[#39092c] text-white text-xl font-bold">
                      {supervisor.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: '#39092c' }}>{supervisor.name}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 capitalize">
                      {t(supervisor.status)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#39092c]" />
                    <span>{supervisor.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#39092c]" />
                    <span>{supervisor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#39092c]" />
                    <span>{supervisor.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#39092c]" />
                    <span>{t('joined')}: {supervisor.joinDate ? new Date(supervisor.joinDate).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                  <Users2 className="w-5 h-5 text-[#39092c]" />
                  <span>{t('quick_stats')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[#f7f8fa] rounded-lg">
                    <div className="text-2xl font-bold" style={{ color: '#39092c' }}>{stats.assignedCleaners}</div>
                    <div className="text-sm text-muted-foreground">{t('assigned_cleaners')}</div>
                  </div>
                  <div className="text-center p-4 bg-[#f7f8fa] rounded-lg">
                    <div className="text-2xl font-bold" style={{ color: '#39092c' }}>
                      {stats.totalTasks}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('total_tasks_completed')}</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-[#f7f8fa] rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: '#39092c' }}>
                    {stats.avgTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('avg_tasks_per_cleaner')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Cleaners */}
          <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between" style={{ color: '#39092c' }}>
                <div className="flex items-center gap-2">
                  <Users2 className="w-5 h-5 text-[#39092c]" />
                  <span>{t('assigned_cleaners')} ({assignedCleaners.length})</span>
                </div>
              </CardTitle>
              <CardDescription>
                {t('cleaners_assigned_to_supervisor')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedCleaners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('no_cleaners_assigned')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {assignedCleaners.map((cleaner: any) => (
                    <Card
                      key={cleaner.id}
                      className="border-0 rounded-xl bg-gradient-to-tr from-white to-[#f3e8ff] hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/cleaner/${cleaner.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#39092c] text-white font-bold">
                              {cleaner.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base" style={{ color: '#39092c' }}>{cleaner.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#39092c]" />
                              <span>{cleaner.location}</span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{cleaner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{cleaner.phone}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-muted-foreground">{t('tasks')}</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {cleaner.tasksCompleted}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDetail;