import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/Buttons';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Users, Clock, CheckCircle, AlertCircle, Plus, UserCheck, UserX, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import api from '../../lib/api';

const MyTeam = () => {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedCleaner, setSelectedCleaner] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  // Mark task as complete
  const handleMarkComplete = async (taskId: string) => {
    setLoadingTaskId(taskId);
    try {
      await api.post(`/supervisor/mark-task-complete/${taskId}`);
      // Update tasks state locally
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? { ...task, status: 'completed' } : task
      ));
    } catch (error) {
      // Optionally show error toast
    }
    setLoadingTaskId(null);
  };

  useEffect(() => {
    api.get('/supervisor/team')
      .then(res => setTeamMembers(res.data));
  }, []);

  const handleSelectCleaner = async (cleanerId: string) => {
    setSelectedCleaner(cleanerId);
    const res = await api.get(`/supervisor/cleaner-tasks/${cleanerId}`);
    setTasks(res.data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'break':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'break':
        return <Clock className="w-4 h-4" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'in-progress':
        return 'bg-[#f3e8ff] text-[#39092c] border border-[#e9e3f5]';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalHours = teamMembers.reduce((sum, member) => sum + (member.hoursWorked || 0), 0);
  const totalTasks = teamMembers.reduce((sum, member) => sum + (member.tasksCompleted || 0), 0);

  const selectedMember = selectedCleaner ? teamMembers.find(m => m.id === selectedCleaner) : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-16 md:h-screen z-30 w-full md:w-auto">
        <Sidebar role="SUPERVISOR" />
      </div>
      {/* Main Content */}
      <div className="flex-1 px-2 py-4 sm:px-4 md:px-10 md:py-10 w-full">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-transparent">
          <Header />
        </div>
        <div className="space-y-8 mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#39092c]">{t('my_team')}</h1>
              <p className="text-muted-foreground text-sm md:text-base">{t('manage_monitor_team')}</p>
            </div>
          </div>

          {/* Team Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="rounded-2xl shadow border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#39092c]">{t('total_team_members')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#a21caf]" />
                  <span className="text-2xl font-bold text-[#39092c] truncate max-w-[100px]">{teamMembers.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#39092c]">{t('active_now')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700 truncate max-w-[100px]">{activeMembers}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#39092c]">{t('total_hours_week')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#a21caf]" />
                  <span className="text-2xl font-bold text-[#39092c] truncate max-w-[100px]">{totalHours.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow border-0 bg-gradient-to-tr from-white to-[#f3e8ff]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#39092c]">{t('tasks_completed')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#a21caf]" />
                  <span className="text-2xl font-bold text-[#39092c] truncate max-w-[100px]">{totalTasks}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members List */}
          <Card className="rounded-2xl shadow border-0">
            <CardHeader>
              <CardTitle className="text-[#39092c]">{t('team_members')}</CardTitle>
              <CardDescription>
                {t('monitor_team_activity')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={member.id}>
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border bg-[#f7f8fa] hover:bg-[#f3e8ff]/60 cursor-pointer transition-colors gap-4 md:gap-0"
                      onClick={() => handleSelectCleaner(member.id)}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <Avatar className="h-12 w-12 ring-2 ring-[#a21caf]">
                          <AvatarFallback className="bg-[#a21caf] text-white text-lg">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2 min-w-0">
                            <h3 className="font-medium text-[#39092c] truncate max-w-[120px]">{member.name}</h3>
                            <Badge className={getStatusColor(member.status)} variant="outline">
                              {getStatusIcon(member.status)}
                              <span className="ml-1 capitalize">{member.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-[160px]">{member.email}</p>
                          {member.currentTask && (
                            <p className="text-sm text-blue-600 truncate max-w-[160px]">{member.currentTask}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row flex-wrap md:flex-nowrap items-center space-x-4 md:space-x-6 mt-4 md:mt-0">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-medium text-[#39092c] truncate max-w-[60px]">{member.tasksCompleted}</p>
                          <p className="text-xs text-muted-foreground">{t('tasks')}</p>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-medium text-[#39092c] truncate max-w-[60px]">{member.hoursWorked}h</p>
                          <p className="text-xs text-muted-foreground">{t('hours')}</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-medium text-[#39092c] truncate max-w-[80px]">{member.lastClockIn}</p>
                          <p className="text-xs text-muted-foreground">{t('last_clock_in')}</p>
                        </div>
                      </div>
                    </div>
                    {index < teamMembers.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cleaner Tasks Dialog */}
          <Dialog open={!!selectedCleaner} onOpenChange={() => setSelectedCleaner(null)}>
            <DialogContent className="max-w-full sm:max-w-2xl md:max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl px-2 sm:px-6">
              <DialogHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCleaner(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center space-x-3">
                    {selectedMember && (
                      <>
                        <Avatar className="h-10 w-10 ring-2 ring-[#a21caf]">
                          <AvatarFallback className="bg-[#a21caf] text-white">
                            {selectedMember.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <DialogTitle className="text-xl text-[#39092c] truncate max-w-[180px]">{selectedMember.name}'s Tasks</DialogTitle>
                          <p className="text-sm text-muted-foreground truncate max-w-[180px]">{selectedMember.email}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-6">
                {tasks.length > 0 ? (
                  tasks.map((task: any) => (
                    <Card key={task.id} className="border-l-4 border-l-[#a21caf] rounded-xl shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="space-y-3 min-w-0 flex-1">
                            <div className="flex items-center space-x-3 min-w-0">
                              <h3 className="font-semibold text-lg text-[#39092c] truncate max-w-[180px]">{task.title}</h3>
                              <Badge className={getTaskStatusColor(task.status)} variant="outline">
                                <span className="capitalize">{task.status}</span>
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-[120px]">{task.workplace}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span className="truncate max-w-[120px]">{task.assignedTime}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span className="truncate max-w-[120px]">{task.estimatedDuration}</span>
                              </div>
                            </div>
                            <p className="text-sm text-[#39092c] truncate max-w-[220px]">{task.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-0 md:ml-4">
                            {task.status !== 'completed' ? (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleMarkComplete(task.id)}
                                disabled={loadingTaskId === task.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {loadingTaskId === task.id ? t('marking') : t('mark_complete')}
                              </Button>
                            ) : (
                              <div className="flex items-center text-green-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t('completed')}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('no_tasks_assigned')}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
