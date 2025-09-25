import { useToast } from "../../hooks/use-toast";
import api from "../../lib/api";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  EyeOff
} from "lucide-react";

const EmployeeSettings = () => {
  // All state, handlers, and logic are now inside the component
  const { t } = useTranslation();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  // Removed loading state
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
    // Notification preference loading/error state
    const [notifLoading, setNotifLoading] = useState<{[key: string]: boolean}>({});
    const [notifError, setNotifError] = useState<{[key: string]: string}>({});

    // Save a single notification preference immediately when toggled
    const handleNotificationToggle = async (key: string, checked: boolean) => {
      setNotifLoading((prev) => ({ ...prev, [key]: true }));
      setNotifError((prev) => ({ ...prev, [key]: "" }));
      try {
        await api.patch("/employee/settings/notifications", { [key]: checked });
        setNotifications((prev) => ({ ...prev, [key]: checked }));
        toast({
          title: t('notifications_updated'),
          description: t(key) + ': ' + (checked ? t('enabled') : t('disabled')),
        });
      } catch (err: any) {
        setNotifError((prev) => ({ ...prev, [key]: err?.response?.data?.message || t('failed_update_notification') }));
        toast({
          title: t('error'),
          description: err?.response?.data?.message || t('failed_update_notification'),
        });
      }
      setNotifLoading((prev) => ({ ...prev, [key]: false }));
    };
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [user, setUser] = useState<{ name: string; email: string; role: string }>({ name: "", email: "", role: "employee" });
    const API_BASE = "/api/employee";

    useEffect(() => {
      api.get("/employee/settings")
        .then(res => {
          const userData = res.data;
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "employee",
          });
          setProfileData(prev => ({
            ...prev,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            role: userData.role || "",
          }));
          setNotifications(userData.notificationSettings || notifications);
          setThemeSettings(userData.themeSettings || themeSettings);
          if (userData.profilePictureUrl) setProfilePic(userData.profilePictureUrl);
        });
    }, []);

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        setProfilePicFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setProfilePic(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
        toast({ title: "Profile Picture Selected", description: `Selected file: ${file.name}` });
      } else if (file) {
        toast({ title: "Invalid File", description: "Please select an image file." });
      }
    };

    const handleProfileSave = async () => {
      try {
        await api.patch("/employee/settings/profile", {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        });
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to update profile.",
        });
      }
    };

    const handleNotificationSave = async () => {
      try {
        await api.patch("/employee/settings/notifications", notifications);
        toast({
          title: "Notifications Updated",
          description: "Your notification preferences have been saved.",
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to update notifications.",
        });
      }
    };

    const handleThemeSave = async () => {
      try {
        await api.patch("/employee/settings/theme", themeSettings);
        toast({
          title: "Theme Updated",
          description: "Your theme preferences have been applied.",
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to update theme.",
        });
      }
    };

    const handlePasswordSave = async () => {
      if (!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all password fields.",
        });
        return;
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New passwords do not match.",
        });
        return;
      }
      try {
        await api.patch("/employee/settings/password", {
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
          confirmPassword: profileData.confirmPassword,
        });
        toast({
          title: "Password Updated",
          description: "Your password has been changed.",
        });
        setProfileData({
          ...profileData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to update password.",
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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        setCvFile(file);
        toast({ title: "CV Selected", description: `Selected file: ${file.name}` });
      } else if (file) {
        toast({ title: "Invalid File", description: "Please select a PDF file." });
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        setCvFile(file);
        toast({ title: "CV Selected", description: `Selected file: ${file.name}` });
      } else if (file) {
        toast({ title: "Invalid File", description: "Please select a PDF file." });
      }
    };

    const handleRemoveFile = () => {
      setCvFile(null);
      setUploadProgress(0);
    };

    const handleUpload = async () => {
      if (!cvFile) {
        toast({ title: "No File Selected", description: "Please select a PDF CV to upload." });
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", cvFile);
      try {
        const res = await api.post("/employee/upload-cv", formData);
        toast({ title: "Upload Complete", description: `${cvFile.name} uploaded successfully!` });
      } catch (err) {
        toast({ title: "Error", description: "Failed to upload CV." });
      }
      setUploading(false);
      setUploadProgress(100);
    };

    const handleProfilePicUpload = async () => {
      if (!profilePicFile) {
        toast({ title: "No Image Selected", description: "Please select a profile picture to upload." });
        return;
      }
      const formData = new FormData();
      formData.append("file", profilePicFile);
      try {
        const res = await api.post("/employee/upload-profile-picture", formData);
        toast({ title: "Profile Picture Updated", description: "Your profile picture has been uploaded." });
        // Re-fetch settings to update profilePic
        const settingsRes = await api.get("/employee/settings");
        setProfilePic(settingsRes.data.profilePictureUrl);
      } catch (err) {
        toast({ title: "Error", description: "Failed to upload profile picture." });
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
        <div className="sticky top-3 z-20 bg-transparent">
          <Header/>
        </div>
        <div className="space-y-8 mt-4 mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#39092c]">{t('settings')}</h1>
            <p className="text-muted-foreground">
              {t('settings_desc')}
            </p>
          </div>
          {/* User Profile Header */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-[#f3e8ff]">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 ring-4 ring-[#a21caf] overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic ? `/uploads/profile-pictures/${profilePic}` : undefined} alt="Profile" className="object-cover w-full h-full rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {user?.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    id="profile-pic-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                  <button
                    type="button"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer shadow"
                    onClick={() => document.getElementById('profile-pic-input')?.click()}
                  >
                    {t('change')}
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-[#39092c]">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge className={`mt-2 ${getRoleColor(user?.role || "")}`}>
                    {t(user?.role)}
                  </Badge>
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

                  {/* Modern PDF CV Upload Section */}
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="cv-upload">{t('upload_pdf_cv')}</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:border-primary bg-gradient-to-br from-white to-[#f3e8ff] ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => !uploading && document.getElementById('cv-upload-input')?.click()}
                    >
                      <Input
                        id="cv-upload-input"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      {!cvFile ? (
                        <span className="text-muted-foreground text-center">
                          {t('drag_drop_cv')} <span className="underline text-primary">{t('browse')}</span>
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-medium text-primary">{cvFile.name}</span>
                          <Button variant="ghost" size="sm" onClick={handleRemoveFile} disabled={uploading}>
                            {t('remove')}
                          </Button>
                        </div>
                      )}
                      {uploading && (
                        <div className="w-full mt-4">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block text-center">{t('uploading')}... {uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="mt-2 flex items-center gap-2"
                      onClick={handleUpload}
                      disabled={!cvFile || uploading}
                    >
                      <Save className="w-4 h-4" />
                      <span>{uploading ? t('uploading') + '...' : t('upload_cv')}</span>
                    </Button>
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
                        label: "Email Notifications",
                        desc: "Receive updates via email",
                        key: "emailNotifications",
                      },
                      {
                        label: "Push Notifications",
                        desc: "Browser push notifications",
                        key: "pushNotifications",
                      },
                      {
                        label: "Task Reminders",
                        desc: "Reminders for upcoming tasks",
                        key: "taskReminders",
                      },
                      {
                        label: "Weekly Reports",
                        desc: "Weekly summary emails",
                        key: "weeklyReports",
                      },
                      {
                        label: "System Updates",
                        desc: "Updates about system changes",
                        key: "systemUpdates",
                      },
                    ].map((item, idx) => (
                      <React.Fragment key={item.key}>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{t(item.key)}</Label>
                            <p className="text-sm text-muted-foreground">{t(item.key + '_desc')}</p>
                            {notifError && notifError[item.key] && (
                              <p className="text-xs text-red-500 mt-1">{notifError[item.key]}</p>
                            )}
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked: boolean) => handleNotificationToggle(item.key, checked)}
                            disabled={notifLoading && !!notifLoading[item.key]}
                          />
                          {notifLoading && notifLoading[item.key] && (
                            <span className="ml-2 text-xs text-muted-foreground">{t('saving')}...</span>
                          )}
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
                    onClick={handlePasswordSave}
                    className="flex items-center gap-2"
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
                        <p className="text-sm text-muted-foreground">
                          {t('enable_dark_mode')}
                        </p>
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
                        <p className="text-sm text-muted-foreground">
                          {t('compact_view_desc')}
                        </p>
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
                        <p className="text-sm text-muted-foreground">
                          {t('show_animations_desc')}
                        </p>
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
}

export default EmployeeSettings;
