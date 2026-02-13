export default function DeliveryOrderDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Delivery Order</h2>

      <p className="text-sm text-muted-foreground">
        Delivery Order digunakan sebagai dokumen resmi pengiriman barang.
      </p>

      <ul className="list-disc pl-5 text-sm space-y-1">
        <li>Dibuat berdasarkan SPB atau Delivery</li>
        <li>Digunakan sebagai dokumen pengantar barang</li>
        <li>Dapat dicetak (PDF)</li>
      </ul>

      <div className="text-xs bg-muted p-3 rounded">
        💡 Delivery Order menjadi bukti fisik saat pengiriman.
      </div>
    </div>
  );
}
