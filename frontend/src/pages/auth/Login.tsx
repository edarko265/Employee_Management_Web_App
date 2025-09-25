import { useState } from "react";
import { useAuth } from "../../hooks/useAuth"; // adjust path if needed

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const { login, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-white">
      {/* Left Side */}
      <div className="flex flex-col justify-center px-8 py-12 md:px-24">
        <img src="/knk-logo.png" alt="KNK Logo" className="w-16 h-16 mb-6" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">Hello Again!</h1>
          <p className="text-gray-500">Welcome Back</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#39092c] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#39092c] focus:outline-none"
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

          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="accent-[#39092c] focus:ring-2 focus:ring-[#39092c] focus:outline-none"
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="text-[#39092c] font-medium">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#39092c] hover:bg-[#290a1f] text-white py-2 rounded-full font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="text-center text-sm mt-2 text-red-600">{error}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-[#39092c] font-medium">
            Sign Up
          </a>
        </p>

        <p className="mt-12 text-xs text-gray-400 text-center">
          © 2023 KNK Palvelut. All Rights Reserved
        </p>
      </div>

      {/* Right Side */}
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
