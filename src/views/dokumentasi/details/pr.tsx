export default function PRDoc() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">Purchase Request (PR)</h2>
        <p className="text-muted-foreground max-w-2xl">
          Purchase Request (PR) digunakan untuk mengajukan pembelian barang
          berdasarkan Material Request (MR) yang telah dibuat dan disetujui.
          PR menjadi dasar proses pengadaan hingga Purchase Order (PO).
        </p>
      </div>

      {/* STATUS */}
      <section className="space-y-3">
        <h3 className="font-semibold">Status Purchase Request</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-red-700">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Open
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              PR baru dibuat dan belum diproses ke Purchase Order.
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-orange-700">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Partial
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sebagian item PR telah dibuatkan Purchase Order.
            </p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-green-700">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Close
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Seluruh item PR telah selesai diproses.
            </p>
          </div>
        </div>
      </section>

      {/* SCREEN AREA */}
      <section className="space-y-3">
        <h3 className="font-semibold">Bagian Halaman PR</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Daftar Purchase Request</b> : Menampilkan seluruh PR.</li>
          <li><b>Form Tambah PR Baru</b> : Membuat PR berdasarkan MR.</li>
          <li><b>Daftar Item PR</b> : Menampilkan part, qty MR, dan qty PR.</li>
        </ul>
      </section>

      {/* STEPS */}
      <section className="space-y-3">
        <h3 className="font-semibold">Langkah Penggunaan</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Buka menu <b>Purchase Request</b>.</li>
          <li>Isi <b>Kode PR</b> dan <b>Tanggal PR</b>.</li>
          <li>Pastikan <b>Lokasi</b> dan <b>PIC</b> sudah sesuai.</li>
          <li>Pilih <b>Material Request (MR)</b> sebagai referensi.</li>
          <li>Isi <b>Qty PR</b> sesuai kebutuhan.</li>
          <li>Klik <b>Tambah PR</b> untuk menyimpan data.</li>
        </ol>
      </section>

      {/* QTY RULE */}
      <section className="space-y-3">
        <h3 className="font-semibold">Aturan Quantity</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Qty PR tidak boleh melebihi Qty MR.</li>
          <li>Satu MR dapat digunakan untuk beberapa PR (partial).</li>
          <li>MR akan berstatus <b>Close</b> jika seluruh qty terpenuhi.</li>
        </ul>
      </section>

      {/* ACCESS */}
      <section className="space-y-3">
        <h3 className="font-semibold">Hak Akses Pengguna</h3>

        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="border px-3 py-2 text-left">Role</th>
                <th className="border px-3 py-2 text-center">Lihat</th>
                <th className="border px-3 py-2 text-center">Buat</th>
                <th className="border px-3 py-2 text-center">Edit</th>
                <th className="border px-3 py-2 text-center">Approval</th>
                <th className="border px-3 py-2 text-center">Gunakan ke PO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-medium">Admin</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Warehouse</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✖</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Purchasing</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Viewer</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✖</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* NOTE */}
      <div className="rounded-lg border bg-muted p-4">
        <p>
          <b>Catatan:</b> Purchase Request yang telah diproses ke Purchase Order
          tidak dapat diubah kembali. Pastikan quantity dan data PR sudah sesuai
          sebelum disimpan.
        </p>
      </div>
    </div>
  );
}
