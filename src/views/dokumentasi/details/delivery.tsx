export default function DeliveryDoc() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Delivery (Transer Stock Gudang)</h2>

      <p className="text-sm text-muted-foreground">
        Delivery digunakan untuk proses pengiriman barang dari gudang asal ke
        gudang tujuan, baik melalui ekspedisi maupun hand carry.
      </p>

      {/* ALUR UMUM */}
      <section className="space-y-2">
        <h3 className="font-semibold">Alur Umum Delivery</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Buka menu <b>Delivery</b></li>
          <li>Pilih data Material Request (MR</li>
          <li>Tentukan metode pengiriman</li>
          <li>Proses packing barang</li>
          <li>Lakukan pengiriman hingga status <b>Delivered</b></li>
        </ol>
      </section>

      {/* JENIS DELIVERY */}
      <section className="space-y-3">
        <h3 className="font-semibold">Jenis Delivery</h3>

        {/* EKSPEDISI */}
        <div className="border rounded-md p-4 bg-slate-50 space-y-2">
          <h4 className="font-semibold">🚚 Delivery Ekspedisi</h4>
          <p className="text-sm text-muted-foreground">
            Pengiriman menggunakan jasa ekspedisi pihak ketiga.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="border rounded p-2 bg-red-50">
              <b>Pending</b>
              <p className="text-muted-foreground">
                Delivery dibuat, belum diproses.
              </p>
            </div>

            <div className="border rounded p-2 bg-orange-50">
              <b>Packing</b>
              <p className="text-muted-foreground">
                Barang sedang dikemas.
              </p>
            </div>

            <div className="border rounded p-2 bg-yellow-50">
              <b>Ready to Pick Up</b>
              <p className="text-muted-foreground">
                Barang siap diambil ekspedisi.
              </p>
            </div>

            <div className="border rounded p-2 bg-blue-50">
              <b>Pick Up</b>
              <p className="text-muted-foreground">
                Barang sudah diambil ekspedisi.
              </p>
            </div>

            <div className="border rounded p-2 bg-purple-50">
              <b>On Delivery</b>
              <p className="text-muted-foreground">
                Barang dalam perjalanan.
              </p>
            </div>

            <div className="border rounded p-2 bg-green-50">
              <b>Delivered</b>
              <p className="text-muted-foreground">
                Barang sudah diterima.
              </p>
            </div>
          </div>
        </div>

        {/* HAND CARRY */}
        <div className="border rounded-md p-4 bg-slate-50 space-y-2">
          <h4 className="font-semibold">🧍‍♂️ Delivery Hand Carry</h4>
          <p className="text-sm text-muted-foreground">
            Pengiriman dilakukan langsung oleh internal tanpa ekspedisi.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="border rounded p-2 bg-red-50">
              <b>Pending</b>
              <p className="text-muted-foreground">
                Delivery dibuat.
              </p>
            </div>

            <div className="border rounded p-2 bg-orange-50">
              <b>Packing</b>
              <p className="text-muted-foreground">
                Barang sedang dikemas.
              </p>
            </div>

            <div className="border rounded p-2 bg-green-50">
              <b>Delivered</b>
              <p className="text-muted-foreground">
                Barang diterima tujuan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TTD */}
      <section className="space-y-3 border rounded-md p-4 bg-yellow-50">
        <h3 className="font-semibold">✍️ Tanda Tangan (Delivered)</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>TTD hanya muncul saat status <b>Delivered</b></li>
          <li>TTD dilakukan oleh <b>Warehouse</b> gudang tujuan</li>
          <li>TTD melalui scan QR Code</li>
          <li>Setelah TTD, Delivery tidak bisa diubah</li>
        </ul>
      </section>
    </div>
  );
}
