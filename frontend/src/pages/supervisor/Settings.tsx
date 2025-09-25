// Remove loading state and conditional rendering

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/Buttons";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../lib/api";
import { useToast } from "../../hooks/use-toast";

const SupervisorSettings = () => {
  const { t } = require('react-i18next').useTranslation();
  const { toast } = useToast?.() || {};
  const [showPassword, setShowPassword] = useState(false);

  // State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    role: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReports: true,
    systemUpdates: false,
  });
  const [themeSettings, setThemeSettings] = useState({
    darkMode: false,
    compactView: false,
    showAnimations: true,
  });

  // Fetch settings on mount
  useEffect(() => {
    api.get("/supervisor/settings")
      .then(res => {
        const user = res.data;
        setProfileData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "",
        }));
        setNotifications(user.notificationSettings || notifications);
        setThemeSettings(user.themeSettings || themeSettings);
      });
    // eslint-disable-next-line
  }, []);

  // Save handlers
  const handleProfileSave = async () => {
    try {
      await api.put("/supervisor/settings/profile", {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      });
      toast?.({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (e: any) {
      toast?.({
        title: "Error",
        description: e?.response?.data?.message || "Could not update profile.",
      });
    }
  };

  const handleNotificationSave = async () => {
    try {
      await api.put("/supervisor/settings/notifications", notifications);
      toast?.({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (e: any) {
      toast?.({
        title: "Error",
        description: e?.response?.data?.message || "Could not update notifications.",
      });
    }
  };

  const handleThemeSave = async () => {
    try {
      await api.put("/supervisor/settings/theme", themeSettings);
      toast?.({
        title: "Theme Updated",
        description: "Your theme preferences have been applied.",
      });
    } catch (e: any) {
      toast?.({
        title: "Error",
        description: e?.response?.data?.message || "Could not update theme.",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await api.put("/supervisor/settings/password", {
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
        confirmPassword: profileData.confirmPassword,
      });
      toast?.({
        title: "Password Updated",
        description: "Your password has been changed.",
      });
      setProfileData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (e: any) {
      toast?.({
        title: "Error",
        description: e?.response?.data?.message || "Could not update password.",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary text-primary-foreground";
      case "supervisor":
        return "bg-accent text-accent-foreground";
      case "employee":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
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
        <div className="sticky top-3 z-20 bg-transparent">
          <Header />
        </div>
        <div className="space-y-8 mt-4 mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#39092c]">{t('settings')}</h1>
            <p className="text-muted-foreground">{t('settings_desc')}</p>
          </div>
          {/* User Profile Header */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-[#f3e8ff]">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-[#a21caf]">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profileData.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-[#39092c]">{profileData.name}</h2>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  <Badge className={`mt-2 ${getRoleColor(profileData.role || "")}`}>{t(profileData.role)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg shadow mb-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{t('profile')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>{t('notifications')}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{t('security')}</span>
              </TabsTrigger>
              {/* <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                <span>{t('appearance')}</span>
              </TabsTrigger> */}
            </TabsList>
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="shadow border-0">
                <CardHeader>
                  <CardTitle>{t('profile_information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('full_name')}</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('email_address')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone_number')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <Button
                    onClick={handleProfileSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('save_profile')}</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="shadow border-0">
                <CardHeader>
                  <CardTitle>{t('notification_preferences')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        label: t('email_notifications'),
                        desc: t('receive_email_updates'),
                        key: "emailNotifications",
                      },
                      {
                        label: t('push_notifications'),
                        desc: t('browser_push_notifications'),
                        key: "pushNotifications",
                      },
                      {
                        label: t('task_reminders'),
                        desc: t('reminders_upcoming_tasks'),
                        key: "taskReminders",
                      },
                      {
                        label: t('weekly_reports'),
                        desc: t('weekly_summary_emails'),
                        key: "weeklyReports",
                      },
                      {
                        label: t('system_updates'),
                        desc: t('updates_system_changes'),
                        key: "systemUpdates",
                      },
                    ].map((item, idx) => (
                      <React.Fragment key={item.key}>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{item.label}</Label>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked: boolean) =>
                              setNotifications({
                                ...notifications,
                                [item.key]: checked,
                              })
                            }
                          />
                        </div>
                        {idx < 4 && <Separator />}
                      </React.Fragment>
                    ))}
                  </div>
                  <Button
                    onClick={handleNotificationSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('save_preferences')}</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="shadow border-0">
                <CardHeader>
                  <CardTitle>{t('security_settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t('current_password')}</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={profileData.currentPassword}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('new_password')}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('confirm_new_password')}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    className="flex items-center gap-2"
                    onClick={handlePasswordUpdate}
                  >
                    <Shield className="w-4 h-4" />
                    <span>{t('update_password')}</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Appearance Tab */}
            {/* <TabsContent value="appearance">
              <Card className="shadow border-0">
                <CardHeader>
                  <CardTitle>{t('theme_settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('dark_mode')}</Label>
                        <p className="text-sm text-muted-foreground">{t('enable_dark_mode')}</p>
                      </div>
                      <Switch
                        checked={themeSettings.darkMode}
                        onCheckedChange={(checked: boolean) =>
                          setThemeSettings({ ...themeSettings, darkMode: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('compact_view')}</Label>
                        <p className="text-sm text-muted-foreground">{t('compact_view_desc')}</p>
                      </div>
                      <Switch
                        checked={themeSettings.compactView}
                        onCheckedChange={(checked: boolean) =>
                          setThemeSettings({ ...themeSettings, compactView: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('show_animations')}</Label>
                        <p className="text-sm text-muted-foreground">{t('show_animations_desc')}</p>
                      </div>
                      <Switch
                        checked={themeSettings.showAnimations}
                        onCheckedChange={(checked: boolean) =>
                          setThemeSettings({ ...themeSettings, showAnimations: checked })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleThemeSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('save_theme')}</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupervisorSettings;
