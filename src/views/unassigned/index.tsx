import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeHelp, LogOutIcon, MailWarning } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/services/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function PendingApprovalPage() {
  const controls = useAnimation();
  const [count, setCount] = useState(0);
  const nav = useNavigate();

  const jump = async () => {
    setCount((prev) => prev + 1);
    await controls.start({
      y: [0, -30, 0],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.5 },
    });
  };

  useEffect(() => {
    async function checkUser() {
      const result = await getCurrentUser();
      if (result) {
        if (result.role !== "unassigned" && result.lokasi !== "unassigned") {
          nav("/dashboard");
        }
      } else {
        nav("/login");
      }
    }

    checkUser();
  }, []);

  useEffect(() => {
    if (count === 10) {
      toast.info("Kamu suka balon atau ngekliknya? 🎈");
    }

    if (count === 30) {
      toast.info("Gabut banget ya? 🎈");
    }

    if (count === 100) {
      toast.info("100 Klik 🎈!!! Orang tua kamu pasti bangga!");
    }
  }, [count]);

  const handleLogout = () => {
    //console.log("CIHUYY");
    logout();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
            <MailWarning className="text-destructive" />
            Akun Belum Disetujui
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Admin kami sedang meninjau akun Anda. Setelah disetujui, Anda akan
            mendapatkan akses sesuai role Anda.
          </p>

          <div className="flex items-center justify-center">
            <motion.button
              animate={controls}
              onClick={jump}
              className="text-4xl hover:scale-110 transition-transform"
              aria-label="Emoji"
            >
              🎈
            </motion.button>
          </div>

          <p className="text-sm text-muted-foreground">
            Klik balon! 🎈 Sudah diklik <strong>{count}</strong> kali.
          </p>

          <div className="w-full flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => location.reload()}
              className="flex items-center justify-center"
            >
              <BadgeHelp className="h-4 w-4" />
              Cek Status Lagi
            </Button>

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center justify-center"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
