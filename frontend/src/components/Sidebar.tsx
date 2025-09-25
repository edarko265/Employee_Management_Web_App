import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { Icon } from "@iconify/react";
import { useState } from "react";



const Sidebar = ({ role }: { role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const roleLinks = {
    EMPLOYEE: [
      { to: "/employee-dashboard", label: t("dashboard"), icon: <Icon icon="mage:dashboard" width={20} /> },
      { to: "/my-tasks", label: t("my_tasks"), icon: <Icon icon="mdi:clipboard-list-outline" width={20} /> },
      { to: "/attendance-history", label: t("attendance_history"), icon: <Icon icon="mdi:clock-outline" width={20} /> },
    ],
    SUPERVISOR: [
      { to: "/supervisor-dashboard", label: t("dashboard"), icon: <Icon icon="mage:dashboard" width={20} /> },
      { to: "/my-team", label: t("my_team"), icon: <Icon icon="mdi:clipboard-list-outline" width={20} /> },
      { to: "/supervisor-reports", label: t("reports"), icon: <Icon icon="mdi:clock-outline" width={20} /> },
    ],
    ADMIN: [
      { to: "/admin-dashboard", label: t("dashboard"), icon: <Icon icon="mage:dashboard" width={20} /> },
      { to: "/users", label: t("user_management"), icon: <Icon icon="mdi:clipboard-list-outline" width={20} /> },
      { to: "/add-workplace", label: t("add_workplace"), icon: <Icon icon="mdi:office-building-outline" width={20} /> },
      {
        label: t("payment"),
        icon: <Icon icon="mdi:credit-card-outline" width={20} />,
        submenu: [
          { to: "/payment-settings", label: t("payment_settings"), icon: <Icon icon="mdi:cog-outline" width={18} /> },
          { to: "/salary-calculator", label: t("salary_calculator"), icon: <Icon icon="mdi:calculator-variant-outline" width={18} /> },
        ],
      },
      { to: "/admin-reports", label: t("reports"), icon: <Icon icon="mdi:clock-outline" width={20} /> },
    ],
  };

  const links = [...(roleLinks[role] || [])];

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Icon icon="mdi:menu" width={28} />
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-50
          w-64 h-full
          bg-gradient-to-b from-[#f8fafc] to-[#f3e8ff] border-r rounded-r-lg flex flex-col justify-between p-4 shadow-xl
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:rounded-lg md:m-4 md:h-[98vh]
        `}
      >
        <div>
          <div className="mb-8 px-4 flex flex-col items-center">
            <img src="/knk-logo.png" className="w-12 h-12 rounded-lg shadow" alt="Logo" />
            <h2 className="text-2xl font-bold mt-4 text-[#39092c] tracking-tight">{t('app_name')}</h2>
          </div>

          <nav className="space-y-2">
            {links.map((link) =>
              "submenu" in link ? (
                <div key={link.label}>
                  <button
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium w-full ${
                      location.pathname.startsWith("/admin-payment")
                        ? "bg-gradient-to-r from-[#39092c] to-[#3a1731] text-white shadow"
                        : "text-gray-700 hover:bg-purple-50 hover:text-[#39092c]"
                    }`}
                    onClick={() => setPaymentExpanded((prev) => !prev)}
                    type="button"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                    <span className="ml-auto">
                      <Icon icon={paymentExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} width={18} />
                    </span>
                  </button>
                  {paymentExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {link.submenu?.map((sublink) => (
                        <Link
                          key={sublink.to}
                          to={sublink.to || "#"}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition text-sm ${
                            location.pathname === sublink.to
                              ? "bg-[#39092c] text-white"
                              : "text-[#39092c] hover:bg-purple-50 hover:text-[#39092c]"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {sublink.icon}
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                link.to && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium ${
                      location.pathname === link.to
                        ? "bg-gradient-to-r from-[#39092c] to-[#3a1731] text-white shadow"
                        : "text-gray-700 hover:bg-purple-50 hover:text-[#39092c]"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                )
              )
            )}
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="px-4">
          <div
            className="flex items-center justify-between cursor-pointer py-2 rounded-lg hover:bg-purple-50 transition"
            onClick={() => setProfileExpanded(!profileExpanded)}
          >
            <div className="flex items-center gap-3">
              {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-purple-200 shadow"
              />
              ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200 shadow">
                <span className="text-[#39092c] font-bold text-lg">
                {user?.name
                  ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                  : "U"}
                </span>
              </div>
              )}
              <div className="text-sm">
              <p className="font-semibold text-[#39092c]">{user?.name || t('user')}</p>
              <p className="text-gray-500 capitalize">{t(role.toLowerCase())}</p>
              </div>
            </div>
            <div>
              {profileExpanded ? (
                <Icon icon="mdi:chevron-up" width={20} />
              ) : (
                <Icon icon="mdi:chevron-down" width={20} />
              )}
            </div>
          </div>

          {profileExpanded && (
            <div className="mt-2 bg-white p-4 rounded-xl text-sm space-y-2 border shadow transition">
              <div>
                <p className="font-medium text-[#39092c]">{user?.name}</p>
                <p className="text-[#39092c]/70 text-xs">{user?.email}</p>
              </div>
              <hr className="border-[#39092c]/10" />
              <Link
                to={
                  role === "ADMIN"
                    ? "/admin-settings"
                    : role === "SUPERVISOR"
                    ? "/supervisor-settings"
                    : "/employee-settings"
                }
                className="flex items-center gap-2 text-[#39092c] hover:text-white hover:bg-[#39092c] px-3 py-2 rounded transition"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon icon="mdi:cog-outline" width={18} />
                {t('settings')}
              </Link>
              <button className="flex items-center gap-2 text-[#39092c] hover:text-white hover:bg-red-500 px-3 py-2 rounded transition"
                onClick={logout}
              >
                <Icon icon="mdi:power" width={18} />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 bg-white p-2 rounded shadow"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <Icon icon="mdi:close" width={24} />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
