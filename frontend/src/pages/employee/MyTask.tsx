import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import api from '../../lib/api';
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';

const ICONS = {
  location: "mdi:map-marker",
  calendar: "mdi:calendar",
  clock: "mdi:clock-outline",
  checkCircle: "mdi:check-circle-outline",
  alertCircle: "mdi:alert-circle-outline",
  playCircle: "mdi:play-circle-outline",
  star: "mdi:star-outline"
};

type Task = {
  id: string | number;
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

const todayStr = new Date().toISOString().split("T")[0];

export default function MyTask() {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<Task[]>([]);
  const fetchAssignments = useCallback(() => {
    api
      .get('/employee/assignments')
      .then((res) => setAssignments(res.data))
      .catch(() => setAssignments([]));
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border border-green-200';
      case 'in-progress': return 'bg-[#f3e8ff] text-[#39092c] border border-[#e9e3f5]';
      case 'upcoming': return 'bg-blue-100 text-blue-700 border border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return ICONS.checkCircle;
      case 'in-progress': return ICONS.playCircle;
      case 'upcoming': return ICONS.clock;
      default: return ICONS.clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Low': return 'bg-gray-100 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Normalize backend status (e.g. IN_PROGRESS) to frontend format (in-progress)
  const normalizeStatus = (status: string) =>
    status.toLowerCase().replace('_', '-');

  // Update filterTasks to use normalized status
  const filterTasks = (tab: string) => {
    if (tab === "current") {
      // "Current" includes in-progress and today's upcoming
      return assignments.filter(
        task =>
          normalizeStatus(task.status) === "in-progress" ||
          (normalizeStatus(task.status) === "upcoming" && task.date === todayStr) ||
          (normalizeStatus(task.status) === "pending" && task.date === todayStr)
      );
    }
    if (tab === "upcoming") {
      // Upcoming is future tasks only
      return assignments.filter(
        task => normalizeStatus(task.status) === "upcoming" && task.date > todayStr
      );
    }
    if (tab === "completed") {
      return assignments.filter(
        task =>
          normalizeStatus(task.status) === "completed" ||
          (normalizeStatus(task.status) === "review" && task.completedAt)
      );
    }
    return [];
  };

  // Update TaskCard logic to use normalized status
  const TaskCard = ({ task }: { task: Task }) => {
    const statusIcon = getStatusIcon(normalizeStatus(task.status));

    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = task.date === todayStr;

    // Show Clock In if status is upcoming and today
    let showClockIn =
      (normalizeStatus(task.status) === "upcoming" || normalizeStatus(task.status) === "pending")
      && isToday;
    // Show Clock Out if status is in-progress
    let showClockOut = normalizeStatus(task.status) === "in-progress";

    const handleClockIn = async () => {
      try {
        await api.post(`/employee/tasks/${task.id}/clock-in`);
        fetchAssignments();
      } catch (err) {
        alert(t('failed_clock_in'));
      }
    };

    const handleClockOut = async () => {
      try {
        await api.post(`/employee/tasks/${task.id}/clock-out`);
        fetchAssignments();
      } catch (err) {
        alert(t('failed_clock_out'));
      }
    };

    return (
      <div className="mb-6">
        <div className="rounded-2xl shadow-lg bg-white p-7 hover:shadow-xl transition border border-[#f3e8ff]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Icon icon={statusIcon} className="w-8 h-8 mt-1 text-[#a21caf]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#39092c]">{task.workplace}</h3>
                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}> 
                {t(normalizeStatus(task.status))}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}> 
                {t(task.priority.toLowerCase())} {t('priority')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-6">
            <div>
              <p className="text-gray-400 flex items-center gap-1">
                <Icon icon={ICONS.calendar} className="w-4 h-4" /> {t('date')}
              </p>
              <p className="font-medium text-[#39092c]">{task.date}</p>
            </div>
            <div>
              <p className="text-gray-400 flex items-center gap-1">
                <Icon icon={ICONS.clock} className="w-4 h-4" /> {t('time')}
              </p>
              <p className="font-medium text-[#39092c]">{task.startTime} - {task.endTime}</p>
            </div>
            <div>
              <p className="text-gray-400 flex items-center gap-1">
                <Icon icon={ICONS.clock} className="w-4 h-4" /> {t('duration')}
              </p>
              <p className="font-medium text-[#39092c]">{task.duration}</p>
            </div>
            {task.completedAt && (
              <div>
                <p className="text-gray-400 flex items-center gap-1">
                  <Icon icon={ICONS.checkCircle} className="w-4 h-4" /> {t('completed')}
                </p>
                <p className="font-medium text-green-700">{task.completedAt}</p>
              </div>
            )}
          </div>
          {task.specialInstructions && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3 mt-6">
              <Icon icon={ICONS.alertCircle} className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-700">{t('special_instructions')}</p>
                <p className="text-sm text-gray-700">{task.specialInstructions}</p>
              </div>
            </div>
          )}
          {/* Single Clock In/Out Button */}
          {showClockIn && (
            <div className="mt-6 flex gap-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
                onClick={handleClockIn}
              >
                {t('clock_in')}
              </button>
            </div>
          )}
          {showClockOut && (
            <div className="mt-6 flex gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
                onClick={handleClockOut}
              >
                {t('clock_out')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f7f8fa]">
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="EMPLOYEE" />
      </div>
      <div className="flex-1 p-6 md:p-10">
        <div className="sticky top-3 z-20 bg-[#f7f8fa]">
          <Header />
        </div>
        <div className="mt-4 mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-[#39092c]">
            <Icon icon={ICONS.star} className="w-8 h-8 text-[#a21caf]" />
            <span>{t('all_assigned_tasks')}</span>
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            {t('view_all_assignments')}
          </p>
        </div>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow mb-6">
            <TabsTrigger value="current">{t('current')} ({filterTasks('current').length})</TabsTrigger>
            <TabsTrigger value="upcoming">{t('upcoming')} ({filterTasks('upcoming').length})</TabsTrigger>
            <TabsTrigger value="completed">{t('completed')} ({filterTasks('completed').length})</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-2">
            {filterTasks('current').length > 0 ? (
              filterTasks('current').map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Icon icon={ICONS.clock} className="w-14 h-14 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('no_current_tasks')}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-2">
            {filterTasks('upcoming').length > 0 ? (
              filterTasks('upcoming').map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Icon icon={ICONS.clock} className="w-14 h-14 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('no_upcoming_tasks')}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-2">
            {filterTasks('completed').length > 0 ? (
              filterTasks('completed').map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Icon icon={ICONS.checkCircle} className="w-14 h-14 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t('no_completed_tasks')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

