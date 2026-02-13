export default function PODoc() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">Purchase Order (PO)</h2>
        <p className="text-muted-foreground max-w-2xl">
          Purchase Order (PO) merupakan dokumen resmi pemesanan barang kepada
          vendor yang dibuat berdasarkan Purchase Request (PR) yang telah
          disetujui. PO digunakan sebagai acuan pengiriman dan penerimaan barang.
        </p>
      </div>

      {/* STATUS */}
      <section className="space-y-3">
        <h3 className="font-semibold">Status Purchase Order</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PENDING / OPEN */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-yellow-700">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              Pending
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              PO telah dibuat dan menunggu proses pengiriman dari vendor.
            </p>
          </div>

          {/* PARTIAL */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-orange-700">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Partial Received
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sebagian barang telah diterima, pengiriman belum lengkap.
            </p>
          </div>

          {/* CLOSE */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-green-700">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Received
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Seluruh barang telah diterima sesuai Purchase Order.
            </p>
          </div>
        </div>
      </section>

      {/* SCREEN AREA */}
      <section className="space-y-3">
        <h3 className="font-semibold">Bagian Halaman PO</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Daftar Purchase Order</b> : Menampilkan seluruh PO yang telah
            dibuat dan status penerimaannya.
          </li>
          <li>
            <b>Form Tambah PO Baru</b> : Digunakan untuk membuat PO berdasarkan
            PR dan vendor yang dipilih.
          </li>
          <li>
            <b>Daftar Item PO</b> : Menampilkan item, qty PR, qty PO, dan harga
            barang.
          </li>
        </ul>
      </section>

      {/* STEPS */}
      <section className="space-y-3">
        <h3 className="font-semibold">Langkah Penggunaan</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Buka menu <b>Purchase Order</b>.</li>
          <li>Isi <b>Kode PO</b> dan <b>Tanggal PO</b>.</li>
          <li>Pilih <b>Purchase Request (PR)</b> sebagai referensi.</li>
          <li>Pilih <b>Vendor</b> dan isi tanggal estimasi.</li>
          <li>Periksa item dan masukkan <b>Qty PO</b> serta harga.</li>
          <li>Klik <b>Tambah PO</b> untuk menyimpan data.</li>
        </ol>
      </section>

      {/* QTY RULE */}
      <section className="space-y-3">
        <h3 className="font-semibold">Aturan Quantity</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Qty PO tidak boleh melebihi Qty PR.</li>
          <li>Satu PR dapat digunakan untuk beberapa PO.</li>
          <li>
            PR akan berstatus <b>Close</b> jika seluruh quantity telah
            diproses ke PO.
          </li>
        </ul>
      </section>

      {/* FLOW */}
      <section className="space-y-3">
        <h3 className="font-semibold">Alur Proses</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>PR dibuat dan disetujui.</li>
          <li>PO dibuat oleh Purchasing berdasarkan PR.</li>
          <li>Vendor melakukan pengiriman barang.</li>
          <li>Warehouse melakukan proses Receive.</li>
          <li>Setelah seluruh barang diterima, PO berstatus <b>Received</b>.</li>
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
                <th className="border px-3 py-2 text-center">Receive</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-medium">Admin</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Purchasing</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✖</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Warehouse</td>
                <td className="border px-3 py-2 text-center">✔</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✖</td>
                <td className="border px-3 py-2 text-center">✔</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Viewer</td>
                <td className="border px-3 py-2 text-center">✔</td>
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
          <b>Catatan:</b> Purchase Order yang sudah memiliki proses Receive
          tidak dapat diubah kembali. Pastikan data PO sudah benar sebelum
          proses penerimaan dilakukan.
        </p>
      </div>
    </div>
  );
}
