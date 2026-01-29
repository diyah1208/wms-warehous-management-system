import { useParams } from "react-router-dom";
import { useState } from "react";
import SignaturePad from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { submitSignature } from "@/services/purchase-request";
import { toast } from "sonner";

export default function PRSign() {
  const { kode } = useParams<{ kode: string }>();
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!signature || !kode) return;

    try {
      setLoading(true);
      await submitSignature(kode, signature);
 decodeURIComponent(kode!), 
      setSubmitted(true);
      toast.success("Tanda tangan berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan tanda tangan");
    } finally {
      setLoading(false);
    }
  }

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
            Tanda Tangan Berhasil!
          </h2>
          
          <p className="text-muted-foreground">
            Silakan kembali ke laptop untuk melanjutkan print dokumen.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmitted(false);
              setSignature(null);
            }}
          >
            Tanda Tangan Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-md w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-semibold text-xl">
            Tanda Tangan Purchase Request
          </h1>
          <p className="text-sm text-muted-foreground">
            Kode: <span className="font-medium">{kode}</span>
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