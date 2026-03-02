import { useState } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/forgot-password", { email });
      setMessage({ type: "success", text: res.data.message || "OTP berhasil dikirim" });
      setStep("reset");
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Terjadi kesalahan" });
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Kata sandi dan konfirmasi tidak sama" });
      return;
    }

    try {
      await api.post("/reset-password", {
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword, // wajib untuk validasi Laravel
      });
      setMessage({ type: "success", text: "Password berhasil direset. Redirecting..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "OTP salah atau kadaluarsa" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center"> Atur Ulang Kata Sandi</h1>
        <p className="text-center text-sm mb-4">Masukkan informasi yang diperlukan</p>

        {message && (
          <div
            className={`mb-4 p-2 rounded text-center ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700">
              Kirim OTP
            </button>
          </form>
        )}

{step === "reset" && (
  <form onSubmit={handleResetPassword} className="flex flex-col gap-4">

    <input
      type="text"
      placeholder="OTP"
      maxLength={6}
      className="border p-2 rounded"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      required
    />

    {/* Password Baru */}
    <div className="relative">
      <input
        type={showNewPassword ? "text" : "password"}
        placeholder="Kata sandi baru"
        className="border p-2 rounded w-full pr-10"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <button
        type="button"
        onClick={() => setShowNewPassword(!showNewPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

    {/* Konfirmasi Password */}
    <div className="relative">
      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Konfirmasi kata sandi"
        className="border p-2 rounded w-full pr-10"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

    <button
      type="submit"
      className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700"
    >
      Atur Ulang Kata Sandi
    </button>
  </form>
)}
      </div>
    </div>
  );
}