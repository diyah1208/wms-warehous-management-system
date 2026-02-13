export default function CustomerDoc() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div>
        <h2 className="text-xl font-bold">Panduan Penggunaan – Customer</h2>
        <p className="text-muted-foreground">
          Menu Customer digunakan untuk mengelola data customer sebagai tujuan
          pengiriman barang pada sistem Warehouse Management System.
        </p>
      </div>

      {/* SECTION 1 */}
      <div>
        <h3 className="font-semibold">1. Deskripsi Halaman</h3>
        <p>
          Halaman Customer menampilkan daftar customer yang telah terdaftar
          di dalam sistem. Data pada halaman ini digunakan sebagai referensi
          pada proses pengiriman dan transaksi terkait lainnya.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <b>No Customer</b> : Kode unik yang digunakan untuk mengidentifikasi
            customer
          </li>
          <li>
            <b>Nama Customer</b> : Nama perusahaan atau individu customer
          </li>
          <li>
            <b>Telepon</b> : Nomor telepon customer atau PIC
          </li>
          <li>
            <b>Kontak</b> : Nama PIC customer
          </li>
          <li>
            <b>Status</b> : Menunjukkan status customer (Aktif / Tidak Aktif)
          </li>
          <li>
            <b>Aksi</b> : Menu tindakan untuk pengelolaan data customer
          </li>
        </ul>
      </div>

      {/* SECTION 2 */}
      <div>
        <h3 className="font-semibold">2. Fungsi Tombol</h3>

        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <b>Search</b> : Digunakan untuk mencari data customer berdasarkan
            No Customer.
          </li>
          <li>
            <b>Unduh</b> : Digunakan untuk mengunduh data Customer.
          </li>
          <li>
            <b>Filter</b> : Digunakan untuk menyaring data customer berdasarkan
            kriteria tertentu.
          </li>
          <li>
            <b>Reset</b> : Digunakan untuk menghapus pencarian atau filter yang
            sedang digunakan.
          </li>
          <li>
            <b>Edit</b> : Digunakan untuk mengubah data customer yang sudah
            terdaftar.
          </li>
          <li>
            <b>Nonaktifkan</b> : Digunakan untuk mengubah status customer menjadi
            tidak aktif.
          </li>
        </ul>
      </div>

      {/* SECTION 3 */}
      <div>
        <h3 className="font-semibold">3. Menambahkan Data Customer</h3>
        <p>
          Untuk menambahkan data customer baru, user dapat mengisi form
          <b> Tambah Customer</b> yang tersedia di bagian bawah halaman.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <b>No Customer *</b> : Kode unik customer
          </li>
          <li>
            <b>Nama Customer *</b> : Nama customer
          </li>
          <li>
            <b>Telepon *</b> : Nomor telepon yang dapat dihubungi
          </li>
          <li>
            <b>Nama Kontak *</b> : Nama PIC customer
          </li>
        </ul>

        <p className="mt-2">
          Setelah seluruh data diisi dengan benar, klik tombol
          <b> Tambah</b> untuk menyimpan data customer ke dalam sistem.
        </p>
      </div>

      {/* NOTE */}
      <div className="rounded-lg border bg-muted p-4">
        <p>
          <b>Catatan:</b> Field dengan tanda <b>*</b> wajib diisi.
          Customer dengan status tidak aktif tidak dapat digunakan
          sebagai tujuan pengiriman.
        </p>
      </div>
    </div>
  );
}
