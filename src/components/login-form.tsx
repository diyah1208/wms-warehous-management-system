"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "@/services/auth"; // auth.ts
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
interface LoginFormProps extends React.ComponentProps<"form"> {
  loading?: boolean;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await signIn({ email, password });
      toast.success(`Selamat datang, ${user.nama}!`);
      //console.log("Login sukses:", user);
      // redirect ke dashboard misal
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Masuk ke akun anda</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Masukkan email dan kata sandi anda untuk masuk.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-1">
          <Label htmlFor="email">
            Email<span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="username@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

<div className="grid gap-1">
  <div className="flex items-center">
    <Label htmlFor="password">
      Kata Sandi<span className="text-red-500">*</span>
    </Label>
    <a
      href="/forgot-password"
      className="ml-auto text-sm underline underline-offset-4 text-red-500 hover:text-red-600"
    >
      Lupa kata sandi?
    </a>
  </div>

  <div className="relative">
    <Input
      id="password"
      disabled={loading}
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="masukkan kata sandi anda"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-10"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      tabIndex={-1}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Masuk"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Belum memiliki akun?{" "}
        <a href="/register" className="underline underline-offset-4 decoration-red-500 text-red-600 hover:text-red-700">
          Daftar
        </a>
      </div>
    </form>
  );
}