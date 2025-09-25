import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/signup", formData);

      setMessage("✅ Sign up successful! Redirecting...");

      setTimeout(() => {
        navigate("/verify-email", {
          state: { email: formData.email },
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const resMessage = err?.response?.data?.message;

      const msg =
        typeof resMessage === "string"
          ? resMessage
          : Array.isArray(resMessage)
          ? resMessage.join(" ")
          : "❌ Something went wrong.";

      setMessage(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans items-center bg-white">
      {/* Left Section */}
      <div className="flex flex-col justify-center px-8 py-12 md:px-24">
        <img src="/knk-logo.png" alt="KNK Logo" className="w-16 h-16 mb-6" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">Hello Again!</h1>
          <p className="text-gray-500">Welcome Back</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#39092c] focus:border-transparent"
            />
          </div>

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
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#39092c] focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#39092c] focus:border-transparent"
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-red-600">{message}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-[#39092c] font-medium">
            Login
          </a>
        </p>

        <p className="mt-12 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} KNK Palvelut. All Rights Reserved
        </p>
      </div>

      {/* Right Section */}
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
