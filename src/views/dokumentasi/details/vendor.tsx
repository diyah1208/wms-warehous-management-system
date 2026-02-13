export default function VendorDoc() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <div>
        <h2 className="text-xl font-bold">Panduan Penggunaan – Vendor</h2>
        <p className="text-muted-foreground">
          Menu Vendor digunakan untuk mengelola data pemasok barang yang
          digunakan dalam proses pengadaan dan transaksi pembelian pada sistem
          Warehouse Management System.
        </p>
      </div>

      {/* SECTION 1 */}
      <div>
        <h3 className="font-semibold">1. Deskripsi Halaman</h3>
        <p>
          Halaman Vendor menampilkan daftar vendor yang telah terdaftar di dalam
          sistem. Data vendor digunakan sebagai referensi pada proses Purchase
          Order dan penerimaan barang.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <b>No Vendor</b> : Kode unik vendor
          </li>
          <li>
            <b>Nama Vendor</b> : Nama perusahaan atau pemasok
          </li>
          <li>
            <b>Telepon</b> : Nomor telepon vendor atau PIC
          </li>
          <li>
            <b>Kontak</b> : Nama PIC vendor
          </li>
          <li>
            <b>Status</b> : Menunjukkan status vendor (Aktif / Tidak Aktif)
          </li>
          <li>
            <b>Aksi</b> : Menu tindakan untuk pengelolaan data vendor
          </li>
        </ul>
      </div>

      {/* SECTION 2 */}
      <div>
        <h3 className="font-semibold">2. Fungsi Tombol</h3>

        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <b>Search</b> : Digunakan untuk mencari data vendor berdasarkan
            No Vendor.
          </li>
          <li>
            <b>Unduh</b> : Digunakan untuk mencari data vendor berdasarkan
            No Vendor.
          </li>
          <li>
            <b>Filter</b> : Digunakan untuk menyaring data vendor berdasarkan
            kriteria tertentu.
          </li>
          <li>
            <b>Reset</b> : Digunakan untuk menghapus pencarian atau filter yang
            sedang digunakan.
          </li>
          <li>
            <b>Edit</b> : Digunakan untuk mengubah data vendor yang sudah
            terdaftar.
          </li>
          <li>
            <b>Nonaktifkan</b> : Digunakan untuk mengubah status vendor menjadi
            tidak aktif.
          </li>
        </ul>
      </div>

      {/* SECTION 3 */}
      <div>
        <h3 className="font-semibold">3. Menambahkan Data Vendor</h3>
        <p>
          Untuk menambahkan vendor baru, user dapat mengisi form
          <b> Tambah Vendor</b> yang tersedia di bagian bawah halaman.
        </p>

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <b>No Vendor *</b> : Kode unik vendor
          </li>
          <li>
            <b>Nama Vendor *</b> : Nama vendor
          </li>
          <li>
            <b>Telepon *</b> : Nomor telepon yang dapat dihubungi
          </li>
          <li>
            <b>Nama Kontak *</b> : Nama PIC vendor
          </li>
        </ul>

        <p className="mt-2">
          Setelah seluruh data diisi dengan benar, klik tombol
          <b> Tambah</b> untuk menyimpan data vendor ke dalam sistem.
        </p>
      </div>

      {/* NOTE */}
      <div className="rounded-lg border bg-muted p-4">
        <p>
          <b>Catatan:</b> Field dengan tanda <b>*</b> wajib diisi.
          Vendor dengan status tidak aktif tidak dapat digunakan
          pada proses Purchase Order.
        </p>
      </div>
    </div>
  );
}
