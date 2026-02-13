import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function MRDocumentation() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {/* HEADER */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Material Request (MR)</h2>
        <p className="text-muted-foreground max-w-2xl">
          Material Request (MR) digunakan untuk mengajukan permintaan barang
          sebagai dasar pembuatan Purchase Request (PR) dan Delivery
          (Transfer Gudang).
        </p>
      </div>

      {/* STATUS */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Status Material Request</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* OPEN */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-red-700">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Open
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              MR baru dibuat dan belum terdapat quantity yang diproses.
            </p>
          </div>

          {/* PARTIAL */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-orange-700">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Partial
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sebagian item sudah diproses, quantity belum terpenuhi.
            </p>
          </div>

          {/* CLOSE */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-green-700">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Close
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Seluruh item telah selesai diproses dan quantity terpenuhi.
            </p>
          </div>
        </div>
      </section>

      {/* SCREEN AREA */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Bagian Halaman MR</h3>

        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Daftar Material Request</b> : Menampilkan seluruh MR yang telah
            dibuat dan dapat dicari berdasarkan kode MR.
          </li>
          <li>
            <b>Form Tambah MR Baru</b> : Digunakan untuk membuat MR baru
            beserta detail barang yang diminta.
          </li>
          <li>
            <b>Daftar Item MR</b> : Menampilkan part, quantity, satuan,
            dan prioritas yang diajukan.
          </li>
        </ul>
      </section>

      {/* STEPS */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Langkah Penggunaan</h3>

        <ol className="list-decimal ml-6 space-y-1">
          <li>Buka menu <b>Material Request</b>.</li>
          <li>Periksa <b>Kode MR</b> yang di-generate otomatis.</li>
          <li>Pastikan <b>Lokasi</b> dan <b>PIC</b> sudah sesuai.</li>
          <li>Isi <b>Tanggal Due Date</b>.</li>
          <li>Tambahkan part melalui tombol <b>Tambah Barang</b>.</li>
          <li>Masukkan quantity dan prioritas barang.</li>
          <li>Klik <b>Tambah MR</b> untuk menyimpan data.</li>
        </ol>
      </section>

      {/* ACCESS */}
    <section className="space-y-3">
    <h3 className="text-lg font-semibold">Hak Akses Pengguna</h3>

    <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-xs border-collapse">
        <thead className="bg-muted">
            <tr>
            <th className="border px-3 py-2 text-left">Role</th>
            <th className="border px-3 py-2 text-center">Lihat</th>
            <th className="border px-3 py-2 text-center">Buat</th>
            <th className="border px-3 py-2 text-center">Edit</th>
            <th className="border px-3 py-2 text-center">Approval</th>
            <th className="border px-3 py-2 text-center">Gunakan ke PR</th>
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


      {/* APPROVAL */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Panduan Persetujuan MR</h3>

        <p className="text-muted-foreground max-w-2xl">
          Persetujuan MR dilakukan setelah seluruh data dan item MR diinput
          dengan benar.
        </p>

        <ol className="list-decimal ml-6 space-y-1">
          <li>Buka detail MR melalui menu daftar MR.</li>
          <li>Periksa data MR dan item barang.</li>
          <li>Klik tombol <b>Tanda Tangan</b>.</li>
          <li>Lakukan proses tanda tangan sesuai instruksi.</li>
          <li>Setelah disetujui, MR dapat dicetak dalam bentuk PDF.</li>
        </ol>
      </section>

      {/* NOTE */}
      <div className="rounded-lg border bg-muted p-4">
        <p>
          <b>Catatan:</b> Material Request dengan status <b>Close</b> tidak dapat
          diubah kembali. Pastikan seluruh data dan item sudah sesuai sebelum
          MR diselesaikan.
        </p>
      </div>
    </div>
  );
}
