import { Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import ForgetPassword from './pages/auth/ForgetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
import Unauthorized from './pages/auth/Unauthorized';

import EmployeeDashboard from './pages/employee/Dashboard';
import MyTask from './pages/employee/MyTask';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import EmployeeSettings from './pages/employee/Settings';

import SupervisorDashboard from './pages/supervisor/Dashboard';
import MyTeam from './pages/supervisor/MyTeam';
import Reports from './pages/supervisor/Report';
import SupervisorSettings from './pages/supervisor/Settings';
import AssignTasks from './pages/supervisor/AssignTasks';

import AdminDashboard from './pages/administrator/Dashboard';
import UserManagement from './pages/administrator/UserManagement';
import CleanerDetail from './pages/administrator/CleanerDetail';
import SupervisorDetail from './pages/administrator/SupervisorDetail';
import PaymentSettings from './pages/administrator/PaymentSettings';
import SalaryCalculator from './pages/administrator/SalaryCalculator';
import AdminSettings from './pages/administrator/Settings';
import AdminReports from './pages/administrator/Report';
import AdminAssignTask from './pages/administrator/AssignTask';

import PrivateRoute from './components/PrivateRoute';
import AddWorkplace from './pages/administrator/Add_Workplace';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin protected routes */}
      <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/cleaner/:id" element={<CleanerDetail />} />
        <Route path="/supervisor/:id" element={<SupervisorDetail />} />
        <Route path="/payment-settings" element={<PaymentSettings />} />
        <Route path="/salary-calculator" element={<SalaryCalculator />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
        <Route path="/admin-reports" element={<AdminReports />} />
        <Route path="/admin-assign-task" element={<AdminAssignTask />} />
        <Route path="/add-workplace" element={<AddWorkplace />} />
      </Route>

      {/* Supervisor protected routes */}
      <Route element={<PrivateRoute allowedRoles={['SUPERVISOR']} />}>
        <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        <Route path="/my-team" element={<MyTeam />} />
        <Route path="/supervisor-reports" element={<Reports />} />
        <Route path="/supervisor-settings" element={<SupervisorSettings />} />
        <Route path="/assign-tasks" element={<AssignTasks />} />
      </Route>

      {/* Employee protected routes */}
      <Route element={<PrivateRoute allowedRoles={['EMPLOYEE']} />}>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/my-tasks" element={<MyTask />} />
        <Route path="/attendance-history" element={<AttendanceHistory />} />
        <Route path="/employee-settings" element={<EmployeeSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
