import { useParams } from "react-router-dom";
import { useState } from "react";
import SignaturePad from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { submitReceiveSignature } from "@/services/receive-item";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ReceiveSign() {
  const { kode } = useParams<{ kode: string }>();
  const { user } = useAuth();


  const [signature, setSignature] = useState<string | null>(null);
  const signedName = user?.nama;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!signature || !kode || !signedName) return;

    try {
      setLoading(true);
      await submitReceiveSignature(kode, signature, signedName);

      setSubmitted(true);
      toast.success("Tanda tangan berhasil disimpan");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan tanda tangan");
    } finally {
      setLoading(false);
    }
  }

  /* ================= SUCCESS SCREEN ================= */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-md w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-green-600">
            Tanda Tangan Berhasil
          </h2>

          <p className="text-muted-foreground">
            Silakan kembali ke laptop untuk melanjutkan proses cetak dokumen.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmitted(false);
              setSignature(null);
            }}
          >
            Tanda Tangan Ulang
          </Button>
        </div>
      </div>
    );
  }

  /* ================= FORM SIGN ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-md w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-semibold text-xl">
            Tanda Tangan Penerimaan Barang / Receive
          </h1>

          <p className="text-sm text-muted-foreground">
            Receive Code:
            <span className="font-medium ml-1">{kode}</span>
          </p>
        </div>

        <SignaturePad onSave={setSignature} />

        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={!signature || loading}
            onClick={handleSubmit}
          >
            {loading ? "Menyimpan..." : "Simpan Tanda Tangan"}
          </Button>

          {signature && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSignature(null)}
            >
              Hapus & Ulangi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
