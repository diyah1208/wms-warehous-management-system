import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { signInWithGoogle } from "@/services/auth";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";


import { LokasiList } from "@/types/enum";
// Tambahkan type untuk props: loading
interface RegisterFormProps extends React.ComponentProps<"form"> {
  loading?: boolean; // Tambahkan prop loading
}


export function RegisterForm({
  className,
  loading,
  ...props
}: RegisterFormProps) {
const [lokasi, setLokasi] = useState("");
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Daftar akun baru anda</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Masukkan seluruh informasi yang dibutuhkan untuk mendaftarkan akun
          baru.
        </p>
      </div>
      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="username@gmail.com"
            required
            disabled={loading} // Disable input saat loading
          />
        </div>
        {/* Full Name */}
        <div className="grid gap-3">
          <Label htmlFor="name">Nama<span className="text-red-500">*</span></Label>
          <Input
            id="name"
            type="text"
            name="nama"
                 placeholder="nama lengkap anda"
            required
            disabled={loading}
          />
        </div>
        {/* Pass */}
        <div className="grid gap-3">
          <Label htmlFor="password">Kata Sandi<span className="text-red-500">*</span></Label>
          <Input
            id="password"
            type="password"
            name="password"
                 placeholder="minimal 6 karakter"
            required
            disabled={loading}
          />
        </div>
        {/* Konfirmasi Pass */}
        <div className="grid gap-3">
          <Label htmlFor="password-confirm">Konfirmasi Kata Sandi<span className="text-red-500">*</span></Label>
          <Input
            id="password-confirm"
            type="password"
            name="confirm-password"
            placeholder="ulangi kata sandi"
            required
            disabled={loading} // Disable input saat loading
          />
        </div>

<div className="grid gap-3">
  <Label>Lokasi<span className="text-red-500">*</span></Label>

  <Select value={lokasi} onValueChange={setLokasi} disabled={loading}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Pilih lokasi" />
    </SelectTrigger>

    <SelectContent>
      {LokasiList.map((item) => (
        <SelectItem key={item.nama} value={item.nama}>
          {item.nama}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* supaya ikut ke FormData saat submit */}
  <input type="hidden" name="lokasi" value={lokasi} required />
</div>


        {/* Login Button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Daftar"}{" "}
          {/* Ubah teks tombol saat loading */}
        </Button>
        {/* Alternatif */}
        {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Atau
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={hanldeGoogleLogin}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Lanjutkan dengan akun Google
        </Button> */}
      </div>
      <div className="text-center text-sm">
        Sudah memiliki akun?{" "}
        <a href="/login" className="underline underline-offset-4 decoration-red-500 text-red-600 hover:text-red-700">
          Masuk
        </a>
      </div>
    </form>
  );
}