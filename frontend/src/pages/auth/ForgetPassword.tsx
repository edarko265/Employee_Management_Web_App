import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });

      setMessage("✅ Reset code sent to your email.");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "❌ Something went wrong.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-white">
      {/* Left Section */}
      <div className="flex flex-col justify-center px-8 py-12 md:px-24">
        <img src="/knk-logo.png" alt="KNK Logo" className="w-16 h-16 mb-28" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Forget Password?</h1>
          <p className="text-gray-500 text-sm">
            Don’t worry! It happens. Please enter the email associated with your
            account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#39092c] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39092c] hover:bg-[#290a1f] text-white py-2 rounded-full font-semibold"
          >
            {loading ? "Sending..." : "Send Code"}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-red-600">{message}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember password?{" "}
          <a href="/login" className="text-[#39092c] font-medium">
            Log in
          </a>
        </p>

        <p className="mt-12 text-xs text-gray-400 text-center">
          © 2023 KNK Palvelut. All Rights Reserved
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
