import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Handle code input
  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {  // from 3 → 5
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setCode(digits);
      // Optionally focus the last input
      inputRefs.current[5]?.focus();
      e.preventDefault();
    }
  };


  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    setMessage("");

    try {
      const res = await api.post("/auth/verify-email", {
        email,
        code: fullCode,
      });

      if (res.status === 201 || res.status === 200) {
        setMessage("✅ Email verified! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "❌ Invalid code.");
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setMessage("");

    try {
      await api.post("/auth/send-verification", { email });
      setTimer(30);
      setMessage("✅ Code resent!");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "❌ Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-white">
      {/* Left Panel */}
      <div className="flex flex-col justify-center px-8 py-12 md:px-24">
        <img src="/knk-logo.png" alt="KNK Logo" className="w-16 h-16 mb-28" />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Please Check Your Email</h1>
          <p className="text-gray-500 text-sm mt-1">
            We've sent a code to{" "}
            <span className="font-medium">{email || "your@email.com"}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center gap-4 mb-4">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el!;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center border border-gray-400 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-[#39092c] focus:border-transparent"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#39092c] hover:bg-[#290a1f] text-white py-2 rounded-full font-semibold"
          >
            Verify Code
          </button>

          {message && (
            <p className="text-center text-sm text-red-600">{message}</p>
          )}
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Didn't get a code?{" "}
          {timer > 0 ? (
            <span className="text-[#39092c] font-medium">
              00:{timer.toString().padStart(2, "0")}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-[#39092c]"
            >
              {resending ? "Resending..." : "Resend Now"}
            </button>
          )}
        </div>

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
