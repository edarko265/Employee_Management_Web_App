import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Buttons';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useToast } from '../../hooks/use-toast';
import { 
  ClipboardList, 
  Users, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

const AssignTasks = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCleaner, setSelectedCleaner] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [workplaces, setWorkplaces] = useState<any[]>([]);
  const [priority, setPriority] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/supervisor/cleaners'),
      api.get('/supervisor/recent-tasks'),
      api.get('/supervisor/workplaces'),
    ])
      .then(([cleanersRes, tasksRes, workplacesRes]) => {
        setCleaners(cleanersRes.data);
        setRecentTasks(tasksRes.data);
        setWorkplaces(workplacesRes.data);
      })
      .catch(() => {
        toast({
          title: t("error"),
          description: t("failed_to_load"),
          variant: "destructive",
        });
      });
  }, [toast]);

  const handleAssignTask = async () => {
    if (!selectedCleaner || !taskTitle || !workplace || !priority) {
      toast({
        title: t("missing_info"),
        description: t("fill_required_fields"),
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post('/supervisor/assign-task', {
        cleanerId: selectedCleaner,
        title: taskTitle,
        description: taskDescription,
        workplaceId: workplace,
        priority,
        estimatedHours,
        dueDate: selectedDate ? selectedDate.toISOString() : undefined,
        startTime: startTime || undefined,
      });
      toast({
        title: t("task_assigned_success"),
        description: t("task_assigned_to", { taskTitle, cleaner: cleaners.find(c => c.id === selectedCleaner)?.name }),
      });
      const tasksRes = await api.get('/supervisor/recent-tasks');
      setRecentTasks(tasksRes.data);

      setSelectedCleaner('');
      setTaskTitle('');
      setTaskDescription('');
      setWorkplace('');
      setPriority('');
      setEstimatedHours('');
      setStartTime('');
      setSelectedDate(new Date());
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err?.response?.data?.message || t("failed_assign_task"),
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Busy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
  <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="SUPERVISOR" />
      </div>
      {/* Main Content */}
  <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="sticky top-3 z-20 bg-transparent">
          <Header />
        </div>
  <div className="space-y-8 max-w-6xl mx-auto py-8">
          {/* Title & Description */}
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: '#39092c' }}>{t("assign_tasks")}</h1>
            <p className="text-muted-foreground">
              {t("assign_new_cleaning_tasks")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assign New Task Form */}
            <Card className="lg:col-span-2 border-0 rounded-3xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[#39092c]">
                  <Plus className="w-6 h-6" />
                  {t("assign_new_task")}
                </CardTitle>
                <CardDescription className="text-base text-gray-500">
                  {t("fill_details_assign_task")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 px-2 md:px-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="taskTitle" className="font-semibold text-gray-700">{t("task_title")} *</Label>
                    <Input
                      id="taskTitle"
                      placeholder={t("deep_clean_office")}
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="workplace" className="font-semibold text-gray-700">{t("workplace")} *</Label>
                    <Select value={workplace} onValueChange={setWorkplace}>
                      <SelectTrigger className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm">
                        <SelectValue placeholder={t("select_workplace")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {workplaces.map((wp) => (
                          <SelectItem key={wp.id} value={wp.id} className="py-2 px-3 text-base">
                            {wp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="font-semibold text-gray-700">{t("task_description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("describe_task_details")}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">{t("cleaner")} *</Label>
                    <Select value={selectedCleaner} onValueChange={setSelectedCleaner}>
                      <SelectTrigger className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm">
                        <SelectValue placeholder={t("select_cleaner")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {cleaners.map((cleaner) => (
                          <SelectItem key={cleaner.id} value={cleaner.id} disabled={cleaner.status === 'Busy'} className="py-2 px-3 text-base">
                            <div className="flex items-center space-x-2">
                              <span>{cleaner.name}</span>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(cleaner.status)}`}>{cleaner.status}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">{t("priority")} *</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm">
                        <SelectValue placeholder={t("select_priority")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        <SelectItem value="high" className="py-2 px-3 text-base">{t("high")}</SelectItem>
                        <SelectItem value="medium" className="py-2 px-3 text-base">{t("medium")}</SelectItem>
                        <SelectItem value="low" className="py-2 px-3 text-base">{t("low")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="hours" className="font-semibold text-gray-700">{t("estimated_hours")}</Label>
                    <Input
                      id="hours"
                      type="number"
                      placeholder={t("hours_placeholder")}
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">{t("due_date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>{t("select_date")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl shadow-lg">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="startTime" className="font-semibold text-gray-700">{t("start_time")}</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="rounded-xl border-gray-300 focus:border-[#39092c] focus:ring-[#39092c]/30 shadow-sm"
                    />
                  </div>
                </div>

                <Button onClick={handleAssignTask} className="w-full bg-[#39092c] hover:bg-[#4e1850] text-white text-lg font-semibold py-3 rounded-xl shadow-md transition-all duration-150">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  {t("assign_task")}
                </Button>
              </CardContent>
            </Card>

            {/* Available Cleaners & Recent Tasks */}
            <div className="space-y-6">
              {/* Available Cleaners */}
              <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                    <Users className="w-5 h-5" />
                    {t("available_cleaners")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cleaners.slice(0, 4).map((cleaner) => (
                      <div key={cleaner.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{cleaner.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {cleaner.location?.name || t("n_a")}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(cleaner.status)}`}>
                          {cleaner.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                    <Clock className="w-5 h-5" />
                    {t("recent_tasks")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{task.title}</p>
                          <Badge variant="secondary" className={getTaskStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(task.employee?.name || task.cleaner || t("unknown")) + ' • ' + (task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd') : (task.date || ''))}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTasks;
