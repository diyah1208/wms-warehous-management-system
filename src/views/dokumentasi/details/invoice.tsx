export default function InvoiceDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Invoice</h2>

      <p className="text-sm text-muted-foreground">
        Invoice digunakan sebagai dokumen penagihan atas transaksi pengiriman atau pembelian.
      </p>

      <ol className="list-decimal pl-5 text-sm space-y-1">
        <li>Invoice dibuat berdasarkan PO atau Delivery</li>
        <li>Menampilkan detail barang dan nilai transaksi</li>
        <li>Dapat dicetak dan diarsipkan</li>
      </ol>

      <div className="text-xs bg-yellow-50 border p-3 rounded">
        ⚠️ Pastikan data sudah benar sebelum mencetak invoice.
      </div>
    </div>
  );
}
