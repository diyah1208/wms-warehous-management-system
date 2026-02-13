export default function SPBDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">SPB (Surat Permintaan Barang)</h2>

      <p className="text-sm text-muted-foreground">
        SPB digunakan untuk proses pengeluaran barang dari gudang.
      </p>

      <ol className="list-decimal pl-5 text-sm space-y-1">
        <li>Buka menu SPB</li>
        <li>Pilih jenis SPB (Internal / Eksternal)</li>
        <li>Tambahkan item dan qty</li>
        <li>Simpan SPB</li>
      </ol>

      <div className="text-xs bg-yellow-50 border p-3 rounded">
        ⚠️ SPB yang sudah diproses tidak dapat diubah kembali.
      </div>
    </div>
  );
}
