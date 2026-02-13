export default function ReportSPBDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Report SPB</h2>

      <p className="text-sm text-muted-foreground">
        Report SPB digunakan untuk melihat rekapitulasi data SPB yang telah dibuat.
      </p>

      <ul className="list-disc pl-5 text-sm space-y-1">
        <li>Menampilkan daftar SPB berdasarkan periode</li>
        <li>Filter berdasarkan lokasi dan status</li>
        <li>Export data untuk kebutuhan laporan</li>
      </ul>

      <div className="text-xs bg-muted p-3 rounded">
        💡 Digunakan oleh manajemen untuk monitoring pengeluaran barang.
      </div>
    </div>
  );
}
