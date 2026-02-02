import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface PrintQrLabelProps {
  partNumber: string;
  partName: string;
  partDescription: string;
}

export default function PrintQrLabel({
  partNumber,
  partName,
  partDescription,
}: PrintQrLabelProps) {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    // QR berisi semua info penting
    QRCode.toDataURL(
      `${partNumber}|${partName}|${partDescription}`,
      {
        width: 120,
        margin: 1,
      }
    ).then(setQr);
  }, [partNumber, partName, partDescription]);

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* BUTTON PRINT */}
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-black text-white rounded mb-4 print:hidden"
      >
        Print Label
      </button>

      {/* ===== AREA PRINT ===== */}
      <div className="label">
        <div className="row">
          {/* LOGO */}
          <img src="/Logo-Lourdes.png" alt="Logo" className="logo" />

          {/* TEXT */}
          <div className="center">
            <div className="part-no">{partNumber}</div>
            <div className="part-name">{partName}</div>
            <div className="part-description">{partDescription}</div>
          </div>

          {/* QR */}
          {qr && <img src={qr} alt="QR" className="qr" />}
        </div>
      </div>

      {/* ===== STYLE ===== */}
      <style>{`
        @media print {
          body {
            margin: 0;
          }
          .label {
            page-break-inside: avoid;
          }
        }

        .label {
          width: 6cm;
          height: 3cm;
          padding: 6px;
          border: 1px solid #000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }

        .row {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 100%;
        }

        .logo {
          height: 22px;
          object-fit: contain;
        }

        .center {
          flex: 1;
          text-align: center;
          line-height: 1.2;
        }

        .part-no {
          font-size: 11px;
          font-weight: bold;
        }

        .part-name {
          font-size: 9px;
        }

        .part-description {
          font-size: 8px;
          opacity: 0.85;
        }

        .qr {
          width: 50px;
          height: 50px;
        }
      `}</style>
    </div>
  );
}
