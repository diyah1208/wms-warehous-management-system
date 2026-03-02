import { RegisterForm } from "@/components/register-form";
import { registerUser } from "@/services/auth";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  const [error, setError] = useState<string>(""); // State untuk pesan error
  const [loading, setLoading] = useState<boolean>(false); // State untuk loading
  const navigate = useNavigate(); // Inisialisasi router

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Reset error
    setLoading(true); // Mulai loading

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const nama = formData.get("nama") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("confirm-password") as string;
    const lokasi = formData.get("lokasi") as string;

    // --- Validasi Sisi Klien ---
    if (!email || !nama || !password || !passwordConfirm || !lokasi) {
      setError("Semua kolom harus diisi.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    // Optional: Tambahkan validasi kekuatan password di sini
    // Contoh: Minimal 6 karakter
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      await registerUser({ email, nama, password, lokasi });
      navigate("/login");
    } catch (err: any) {
      console.error("Failed to register:", err);
      // Tampilkan pesan error dari fungsi registerUser
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setLoading(false); // Hentikan loading
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error || "Terjadi kesalahan yang tidak diketahui.");
      setError("");
    }
  }, [error]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/wh2.webp"
          alt="Image"
          className="mx-auto absolute inset-0 h-full w-full object-cover brightness-40 dark:grayscale"
        />
        <div className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] select-none flex flex-col gap-4 items-center justify-center text-6xl font-extrabold text-white">
          <h1>WAREHOUSE</h1>
          <h1>MANAGEMENT</h1>
          <h1>SYSTEM</h1>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex w-full justify-center gap-2">
          {/* <img src="gis_logo.png" alt="Logo GMI" /> */}
           <img
          src="/gmi-logo.webp"
          alt="Logo GMI"
          className="h-20 object-contain"
        />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm onSubmit={handleRegister} loading={loading} />{" "}
          </div>
        </div>
      </div>
    </div>
  );
}