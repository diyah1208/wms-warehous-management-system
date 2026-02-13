export default function DashboardDoc() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div>
        <h2 className="text-xl font-bold">Panduan Penggunaan – Dashboard</h2>
        <p className="text-muted-foreground">
          Dashboard merupakan halaman utama yang menampilkan ringkasan aktivitas
          dan kondisi operasional gudang secara keseluruhan. Informasi pada
          dashboard digunakan untuk keperluan monitoring dan pengambilan
          keputusan secara cepat.
        </p>
      </div>

      {/* SECTION 1 */}
      <div>
        <h3 className="font-semibold">1. Filter Data</h3>
        <p>
          Filter digunakan untuk menampilkan data sesuai lokasi dan periode
          waktu yang dipilih.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><b>Lokasi</b> : Menampilkan data berdasarkan lokasi gudang.</li>
          <li><b>Start Date</b> : Menentukan tanggal awal periode data.</li>
          <li><b>End Date</b> : Menentukan tanggal akhir periode data.</li>
        </ul>
      </div>

      {/* SECTION 2 */}
      <div>
        <h3 className="font-semibold">2. Ringkasan Data</h3>
        <p>
          Bagian Ringkasan menampilkan jumlah data utama berdasarkan filter
          yang dipilih.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><b>Material Request (MR)</b> : Jumlah permintaan material.</li>
          <li><b>Delivery</b> : Jumlah proses pengiriman.</li>
          <li><b>Receive</b> : Jumlah barang yang telah diterima.</li>
        </ul>
      </div>

      {/* SECTION 3 – FIXED */}
      <div>
        <h3 className="font-semibold">3. Indikasi Warna Status</h3>
        <p>
          Dashboard menggunakan indikator warna untuk memberikan gambaran
          status proses secara visual dan cepat.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {/* MR */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-yellow-700">
              {/* <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> */}
              Material Request
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Proses permintaan material yang masih berjalan.
            </p>
          </div>

          {/* DELIVERY */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-blue-700">
              {/* <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> */}
              Delivery
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Proses pengiriman yang sedang aktif.
            </p>
          </div>

          {/* RECEIVE */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-green-700">
              {/* <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> */}
              Receive
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Barang yang telah diterima dan diproses.
            </p>
          </div>
        </div>

        <p className="mt-2">
          Indikator warna bersifat informatif dan digunakan sebagai panduan
          visual pada dashboard.
        </p>
      </div>

      {/* SECTION 4 */}
      <div>
        <h3 className="font-semibold">4. Grafik Status Ringkas</h3>
        <p>
          Grafik menampilkan perbandingan jumlah MR, Delivery, dan Receive
          berdasarkan indikator warna masing-masing.
        </p>
      </div>

      {/* SECTION 5 */}
      <div>
        <h3 className="font-semibold">5. Latest Material Request</h3>
        <p>
          Menampilkan daftar Material Request terbaru untuk kebutuhan monitoring.
        </p>
      </div>

      {/* NOTE */}
      <div className="rounded-lg border bg-muted p-4">
        <p>
          <b>Catatan:</b> Dashboard digunakan sebagai alat monitoring.
          Untuk proses lanjutan, silakan masuk ke menu terkait.
        </p>
      </div>
    </div>
  );
}
