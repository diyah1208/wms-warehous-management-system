export default function BarangDoc() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Barang & Stok</h2>

      <p className="text-sm text-muted-foreground">
        Menu Barang & Stok digunakan untuk mengelola data master barang,
        stok per lokasi gudang, serta QR Code part.
      </p>

      {/* FUNGSI UTAMA */}
      <section className="space-y-2">
        <h3 className="font-semibold">Fungsi Utama</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Melihat daftar master barang</li>
          <li>Melihat stok barang per lokasi gudang</li>
          <li>Mencetak QR Code untuk setiap part</li>
        </ul>
      </section>

      {/* ALUR PENGGUNAAN */}
      <section className="space-y-2">
        <h3 className="font-semibold">Alur Penggunaan</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Buka menu <b>Barang & Stok</b></li>
          <li>Cari barang berdasarkan <b>Part Number</b> atau <b>Nama</b></li>
          <li>Lihat stok di setiap lokasi gudang</li>
          <li>Jika ingin menambah stock pilih tombol aksi dengan icon pensil</li>
          <li>Gunakan QR Code untuk identifikasi barang</li>
        </ol>
      </section>

      {/* QR CODE */}
      <section className="space-y-2">
        <h3 className="font-semibold">QR Code Barang</h3>
        <p className="text-sm text-muted-foreground">
          Setiap barang memiliki QR Code yang dapat digunakan untuk
          mempercepat proses identifikasi dan transaksi.
        </p>

        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>QR Code berisi informasi part</li>
          <li>QR Code dapat dicetak dari menu Barang</li>
        </ul>
      </section>

      {/* CATATAN */}
      <section className="border rounded-md p-4 bg-yellow-50 text-sm">
        💡 <b>Catatan:</b> Stok barang akan otomatis berubah berdasarkan
        transaksi <b>Receive</b>, <b>Delivery</b>, dan <b>Stock Out</b>.
      </section>
    </div>
  );
}
