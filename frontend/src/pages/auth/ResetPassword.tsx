import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { code, newPassword, confirmPassword } = formData;

    if (!code) {
      setMessage("❌ Please enter the verification code.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", {
        email,
        code,
        password: newPassword,
      });

      if (res.status === 200 || res.status === 201) {
        setMessage("✅ Password has been reset.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage("❌ Failed to reset password.");
      }
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message || err.message || "❌ Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-white">
      {/* Left Panel */}
      <div className="flex flex-col justify-center px-8 py-12 md:px-24">
        <img src="/knk-logo.png" alt="KNK Logo" className="w-16 h-16 mb-28" />
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            A reset code has been sent to{" "}
            <span className="font-semibold text-[#39092c]">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#39092c] focus:outline-none"
              placeholder="Enter the code sent to your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password<span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#39092c] focus:outline-none"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#39092c] focus:outline-none"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39092c] hover:bg-[#290a1f] text-white py-2 rounded-full font-semibold"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-red-600">{message}</p>
          )}
        </form>

        <p className="mt-12 text-xs text-gray-400 text-center">
          © 2023 KNK Palvelut. All Rights Reserved
        </p>
      </div>

      {/* Right Panel */}
      <div className="hidden md:flex items-center justify-center bg-[#39092c] text-white h-full">
        <div className="relative w-[90%] max-w-[500px] h-[500px] bg-white/10 backdrop-blur-md rounded-2xl border border-white p-6 flex flex-col justify-between">
          <p className="text-3xl font-semibold text-white leading-snug z-10 p-6">
            "Attendance is the first step to success, be present to win."
          </p>
          <img
            src="/f-cleaner.png"
            alt="Motivational"
            className="absolute bottom-4 right-4 w-72 h-72 object-contain z-0"
          />
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            <span className="w-3 h-3 bg-white rounded-full opacity-80" />
            <span className="w-3 h-3 bg-white/30 rounded-full" />
            <span className="w-3 h-3 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
