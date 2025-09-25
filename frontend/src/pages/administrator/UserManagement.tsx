import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { User, Users, ShieldCheck, Brush, MapPin, Mail, Phone, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Buttons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

const optionalPassword = z
  .union([z.string().min(6, 'Password must be at least 6 characters'), z.literal('')])
  .default('');

const supervisorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  locationId: z.string().min(1),
  password: optionalPassword,
});

const cleanerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  locationId: z.string().min(1),
  supervisorId: z.string().min(1),
  password: optionalPassword,
});

type SupervisorFormValues = z.input<typeof supervisorSchema>;
type CleanerFormValues = z.input<typeof cleanerSchema>;

const supervisorDefaultValues: SupervisorFormValues = {
  name: '',
  email: '',
  phone: '',
  locationId: '',
  password: '',
};

const cleanerDefaultValues: CleanerFormValues = {
  name: '',
  email: '',
  phone: '',
  locationId: '',
  supervisorId: '',
  password: '',
};

const UserManagement = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openSupervisorDialog, setOpenSupervisorDialog] = useState(false);
  const [openCleanerDialog, setOpenCleanerDialog] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<any | null>(null);
  const [editingCleaner, setEditingCleaner] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [supRes, clnRes] = await Promise.all([
        api.get('/admin/supervisors'),
        api.get('/admin/cleaners'),
      ]);
      setSupervisors(supRes.data);
      setCleaners(clnRes.data);
    } catch {
      toast({ title: t('error'), description: t('failed_to_fetch_users') });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch {
      toast({ title: t('error'), description: t('failed_to_load_locations') });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  const supervisorForm = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: supervisorDefaultValues,
  });

  const cleanerForm = useForm<CleanerFormValues>({
    resolver: zodResolver(cleanerSchema),
    defaultValues: cleanerDefaultValues,
  });

  const handleAddSupervisor = async (data: SupervisorFormValues) => {
    try {
      if (!editingSupervisor) {
        if (!data.password || data.password.length < 6) {
          supervisorForm.setError('password', {
            type: 'manual',
            message: t('password_min_length', { defaultValue: 'Password must be at least 6 characters' }),
          });
          return;
        }
        await api.post('/admin', { ...data, role: 'SUPERVISOR' });
        toast({ title: t('success'), description: t('supervisor_created') });
      } else {
        const payload = { ...data } as Record<string, any>;
        if (!payload.password) {
          delete payload.password;
        }
        await api.patch(`/admin/${editingSupervisor.id}`, { ...payload, role: 'SUPERVISOR' });
        toast({
          title: t('success'),
          description: t('supervisor_updated', { defaultValue: 'Supervisor updated successfully' }),
        });
      }
      supervisorForm.reset(supervisorDefaultValues);
      setEditingSupervisor(null);
      setOpenSupervisorDialog(false);
      fetchUsers();
    } catch {
      toast({
        title: t('error'),
        description: editingSupervisor
          ? t('failed_to_update_supervisor', { defaultValue: 'Failed to update supervisor' })
          : t('failed_to_create_supervisor'),
      });
    }
  };

  const handleAddCleaner = async (data: CleanerFormValues) => {
    try {
      if (!editingCleaner) {
        if (!data.password || data.password.length < 6) {
          cleanerForm.setError('password', {
            type: 'manual',
            message: t('password_min_length', { defaultValue: 'Password must be at least 6 characters' }),
          });
          return;
        }
        await api.post('/admin', { ...data, role: 'EMPLOYEE' });
        toast({ title: t('success'), description: t('cleaner_created') });
      } else {
        const payload = { ...data } as Record<string, any>;
        if (!payload.password) {
          delete payload.password;
        }
        await api.patch(`/admin/${editingCleaner.id}`, { ...payload, role: 'EMPLOYEE' });
        toast({
          title: t('success'),
          description: t('cleaner_updated', { defaultValue: 'Cleaner updated successfully' }),
        });
      }
      cleanerForm.reset(cleanerDefaultValues);
      setEditingCleaner(null);
      setOpenCleanerDialog(false);
      fetchUsers();
    } catch {
      toast({
        title: t('error'),
        description: editingCleaner
          ? t('failed_to_update_cleaner', { defaultValue: 'Failed to update cleaner' })
          : t('failed_to_create_cleaner'),
      });
    }
  };

  const openSupervisorCreate = () => {
    setEditingSupervisor(null);
    supervisorForm.reset(supervisorDefaultValues);
    supervisorForm.clearErrors();
  };

  const openCleanerCreate = () => {
    setEditingCleaner(null);
    cleanerForm.reset(cleanerDefaultValues);
    cleanerForm.clearErrors();
  };

  const handleEditSupervisor = (user: any) => {
    setEditingSupervisor(user);
    supervisorForm.reset({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      locationId: user.location?.id ?? '',
      password: '',
    });
    supervisorForm.clearErrors();
    setOpenSupervisorDialog(true);
  };

  const handleEditCleaner = (user: any) => {
    setEditingCleaner(user);
    cleanerForm.reset({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      locationId: user.location?.id ?? '',
      supervisorId: user.supervisor?.id ?? '',
      password: '',
    });
    cleanerForm.clearErrors();
    setOpenCleanerDialog(true);
  };

  const handleDeleteUser = async (user: any) => {
    const confirmed = window.confirm(
      t('confirm_delete_user', { defaultValue: 'Are you sure you want to delete this user?' }),
    );
    if (!confirmed) return;
    try {
      await api.delete(`/admin/${user.id}`);
      toast({
        title: t('success'),
        description: t('user_deleted', { defaultValue: 'User deleted successfully' }),
      });
      fetchUsers();
    } catch {
      toast({
        title: t('error'),
        description: t('failed_to_delete_user', { defaultValue: 'Failed to delete user' }),
      });
    }
  };

  useEffect(() => {
    if (!openSupervisorDialog) {
      setEditingSupervisor(null);
      supervisorForm.reset(supervisorDefaultValues);
      supervisorForm.clearErrors();
    }
  }, [openSupervisorDialog]);

  useEffect(() => {
    if (!openCleanerDialog) {
      setEditingCleaner(null);
      cleanerForm.reset(cleanerDefaultValues);
      cleanerForm.clearErrors();
    }
  }, [openCleanerDialog]);

  const groupUsersByLocation = (users: any[]) =>
    users.reduce((acc: Record<string, any[]>, user) => {
      const location = user.location?.name || 'Unknown';
      acc[location] = acc[location] || [];
      acc[location].push(user);
      return acc;
    }, {});

  const supervisorsByLocation = groupUsersByLocation(supervisors);
  const cleanersByLocation = groupUsersByLocation(cleaners);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="ADMIN" />
      </div>
      <div className="flex-1 p-6 md:p-10">
        <div className="sticky top-3 z-20 bg-transparent">
          <Header/>
        </div>
        <div className="space-y-8 mx-auto py-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-[#39092c]">{t('user_management')}</h1>
            <p className="text-muted-foreground">{t('manage_supervisors_cleaners')}</p>
          </div>

          <Tabs defaultValue="supervisors" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 bg-white rounded-lg shadow mb-6">
              <TabsTrigger value="supervisors">{t('supervisors')}</TabsTrigger>
              <TabsTrigger value="cleaners">{t('cleaners')}</TabsTrigger>
            </TabsList>

            <TabsContent value="supervisors" className="space-y-8">
              <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#39092c] flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> {t('supervisors')}
              </h2>
              <Dialog open={openSupervisorDialog} onOpenChange={setOpenSupervisorDialog}>
                <DialogTrigger asChild>
                <Button onClick={openSupervisorCreate}>
                  <Plus className="mr-2 h-4 w-4" /> {t('add_supervisor')}
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSupervisor
                      ? t('edit_supervisor', { defaultValue: 'Edit Supervisor' })
                      : t('add_supervisor')}
                  </DialogTitle>
                </DialogHeader>
                <Form {...supervisorForm}>
                  <form onSubmit={supervisorForm.handleSubmit(handleAddSupervisor)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="name" control={supervisorForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name')}</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="email" control={supervisorForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email_address')}</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="phone" control={supervisorForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone_number')}</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="locationId" control={supervisorForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('workplace')}</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_workplace')} />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map(loc => (
                              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="password" control={supervisorForm.control} render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        {editingSupervisor
                          ? t('new_password_optional', { defaultValue: 'New Password (optional)' })
                          : t('password')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            editingSupervisor
                              ? t('leave_blank_keep_password', {
                                  defaultValue: 'Leave blank to keep current password',
                                })
                              : ''
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">
                      {editingSupervisor
                        ? t('save_changes', { defaultValue: 'Save changes' })
                        : t('create')}
                    </Button>
                  </div>
                  </form>
                </Form>
                </DialogContent>
              </Dialog>
              </div>
              {Object.entries(supervisorsByLocation).map(([location, users]) => (
              <div key={location}>
                <h3 className="text-xl font-bold text-[#39092c] flex items-center gap-2">
                <MapPin className="text-purple-600" /> {location}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {(users as any[]).map(user => (
                  <Link to={`/supervisor/${user.id}`} key={user.id} className="block">
                    <Card className="shadow-lg hover:shadow-xl transition cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <User className="text-blue-500" />
                          <CardTitle>{user.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="flex items-center gap-2"><Mail size={16} /> {user.email}</p>
                        <p className="flex items-center gap-2"><Phone size={16} /> {user.phone}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users size={16} /> {t('cleaners')}: {user.subordinates?.length ?? 0}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleEditSupervisor(user);
                            }}
                          >
                            {t('edit', { defaultValue: 'Edit' })}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleDeleteUser(user);
                            }}
                          >
                            {t('delete', { defaultValue: 'Delete' })}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                </div>
              </div>
              ))}
            </TabsContent>

            <TabsContent value="cleaners" className="space-y-8">
              <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#39092c] flex items-center gap-2">
                <Brush className="text-green-600" /> {t('cleaners')}
              </h2>
              <Dialog open={openCleanerDialog} onOpenChange={setOpenCleanerDialog}>
                <DialogTrigger asChild>
                <Button onClick={openCleanerCreate}>
                  <Plus className="mr-2 h-4 w-4" /> {t('add_cleaner')}
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCleaner
                      ? t('edit_cleaner', { defaultValue: 'Edit Cleaner' })
                      : t('add_cleaner')}
                  </DialogTitle>
                </DialogHeader>
                <Form {...cleanerForm}>
                  <form onSubmit={cleanerForm.handleSubmit(handleAddCleaner)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="name" control={cleanerForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name')}</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="email" control={cleanerForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email_address')}</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="phone" control={cleanerForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone_number')}</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="locationId" control={cleanerForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('workplace')}</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_workplace')} />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map(loc => (
                              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="supervisorId" control={cleanerForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('supervisor')}</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_supervisor')} />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map(sup => (
                              <SelectItem key={sup.id} value={sup.id}>
                                {sup.name} - {sup.location?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="password" control={cleanerForm.control} render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        {editingCleaner
                          ? t('new_password_optional', { defaultValue: 'New Password (optional)' })
                          : t('password')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            editingCleaner
                              ? t('leave_blank_keep_password', {
                                  defaultValue: 'Leave blank to keep current password',
                                })
                              : ''
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">
                      {editingCleaner
                        ? t('save_changes', { defaultValue: 'Save changes' })
                        : t('create')}
                    </Button>
                  </div>
                  </form>
                </Form>
                </DialogContent>
              </Dialog>
              </div>
              {Object.entries(cleanersByLocation).map(([location, users]) => (
                <div key={location}>
                  <h3 className="text-xl font-bold text-[#39092c] flex items-center gap-2">
                    <MapPin className="text-purple-600" /> {location}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {(users as any[]).map(user => (
                      <Link to={`/cleaner/${user.id}`} key={user.id} className="block">
                        <Card className="shadow-lg hover:shadow-xl transition cursor-pointer">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <Brush className="text-green-500" />
                              <CardTitle>{user.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="flex items-center gap-2"><Mail size={16} /> {user.email}</p>
                            <p className="flex items-center gap-2"><Phone size={16} /> {user.phone}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <ShieldCheck size={16} /> Supervisor: {user.supervisor?.name ?? 'N/A'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  handleEditCleaner(user);
                                }}
                              >
                                {t('edit', { defaultValue: 'Edit' })}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  handleDeleteUser(user);
                                }}
                              >
                                {t('delete', { defaultValue: 'Delete' })}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
