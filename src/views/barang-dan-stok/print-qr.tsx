import PrintQrLabel from "@/components/qr/PrintQrLabel";
import { useParams } from "react-router-dom";

export default function PrintPartQr() {
  const { partNumber, partName, partDescription } = useParams();

  if (!partNumber) {
    return <p>Data part tidak ditemukan</p>;
  }

  return (
    <PrintQrLabel
      partNumber={partNumber}
      partName={decodeURIComponent(partName ?? "")}
      partDescription={decodeURIComponent(partDescription ?? "")}
    />
  );
}

