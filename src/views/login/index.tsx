import { LoginForm } from "@/components/login-form";
import { signIn } from "@/services/auth";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";

    try {
      const user = await signIn({ email, password });
      setUser(user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError("");
    }
  }, [error]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex w-full justify-center">
        <img
          src="/gmi-logo.webp"
          alt="Logo GMI"
          className="h-20 object-contain"
        />
      </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm loading={loading} onSubmit={handleLogin} />
          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden lg:block">
        <img
          src="/wh-1.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-40"
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none flex flex-col gap-4 items-center justify-center text-6xl font-extrabold text-white">
          <h1>WAREHOUSE</h1>
          <h1>MANAGEMENT</h1>
          <h1>SYSTEM</h1>
        </div>
      </div>
    </div>
  );
}
