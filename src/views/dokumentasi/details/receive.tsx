export default function RIDoc() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Receive Item (RI)</h2>

      <p className="text-sm text-muted-foreground">
        Receive Item digunakan untuk mencatat penerimaan barang dari vendor
        berdasarkan Purchase Order (PO) yang telah dibuat.
      </p>

      {/* FUNGSI UTAMA */}
      <section className="space-y-2">
        <h3 className="font-semibold">Fungsi Utama</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Mencatat barang yang diterima dari vendor</li>
          <li>Menambah stok barang ke gudang</li>
          <li>Menentukan status penerimaan PO</li>
        </ul>
      </section>

      {/* ALUR PENGGUNAAN */}
      <section className="space-y-2">
        <h3 className="font-semibold">Alur Penggunaan</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Buka menu <b>Receive Item</b></li>
          <li>Pilih <b>Purchase Order (PO)</b> sebagai referensi</li>
          <li>Periksa item dan quantity</li>
          <li>Isi quantity yang diterima</li>
          <li>Simpan Receive Item</li>
        </ol>
      </section>

      {/* ATURAN QTY */}
      <section className="space-y-2">
        <h3 className="font-semibold">Aturan Quantity</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Qty RI tidak boleh melebihi Qty PO</li>
          <li>Penerimaan dapat dilakukan bertahap (partial)</li>
          <li>Stok akan bertambah sesuai Qty yang diterima</li>
        </ul>
      </section>

      {/* STATUS RI / PO */}
      <section className="space-y-2">
        <h3 className="font-semibold">Status Penerimaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="border rounded-md p-3 bg-slate-50">
            <b>Open</b>
            <p className="text-muted-foreground mt-1">
              Belum ada barang yang diterima.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-yellow-50">
            <b>Partial</b>
            <p className="text-muted-foreground mt-1">
              Sebagian barang sudah diterima.
            </p>
          </div>

          <div className="border rounded-md p-3 bg-green-50">
            <b>Close</b>
            <p className="text-muted-foreground mt-1">
              Seluruh barang sudah diterima.
            </p>
          </div>
        </div>
      </section>

      {/* CATATAN */}
      <section className="border rounded-md p-4 bg-yellow-50 text-sm">
        💡 <b>Catatan:</b> Receive Item yang sudah disimpan tidak dapat diubah.
      </section>
    </div>
  );
}
