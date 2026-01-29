<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Purchase Order {{ $po->po_kode }}</title>

    <style>
        body {
            font-family: Calibri, Times, serif;
            font-size: 12px;
            margin: 40px 40px 30px 40px;
        }
        table { width: 100%; border-collapse: collapse; }
        .label { font-weight: bold; white-space: nowrap; }
        .data th, .data td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
        }
        .data th { background: #f2f2f2; }
        .left { text-align: left; }
        .right { text-align: right; }
        .sign td { padding-top: 60px; text-align: center; }
    </style>
</head>

<body>

{{-- ================= HEADER ================= --}}
<table>
    <tr>
        <td>
            <img src="{{ public_path('images/Logo Garuda Mart Indonesia.png') }}"
                 style="height:50px; display:block;">
            <div style="font-size:12px; margin-top:4px; line-height:1.4;">
                <strong>PT. Garuda Mart Indonesia</strong><br>
                RT.002/RW.012, Jatiasih, Kec. Jatiasih<br>
                Kota Bekasi, Jawa Barat 17423<br>
                Telp: (021) 82407309
            </div>
        </td>
        <td width="30%" align="right" valign="top">
            <img src="{{ public_path('images/Logo-Lourdes.png') }}"
                 style="height:45px;">
        </td>
    </tr>
</table>

<table style="margin-top:10px; margin-bottom:18px;">
    <tr><td style="border-bottom:1px solid #000;"></td></tr>
</table>

<div style="text-align:center; margin: 10px 0 18px 0;">
    <div style="font-size:15px; font-weight:bold; letter-spacing:0.5px;">
        PURCHASE ORDER
    </div>
</div>

{{-- ================= INFO PO ================= --}}
<table width="100%" style="margin-bottom:18px;">
    <tr>
        <td width="50%" valign="top">
            <table width="100%">
                <tr>
                    <td class="label" style="width:140px;">Kode PO</td>
                    <td style="width:10px;">:</td>
                    <td>{{ $po->po_kode }}</td>
                </tr>

                <tr>
                    <td class="label">Status</td>
                    <td>:</td>
                    <td>{{ $po->po_status }}</td>
                </tr>

                <tr>
                    <td class="label">Detail Status</td>
                    <td>:</td>
                    <td>{{ $po->po_detail_status }}</td>
                </tr>

                <tr>
                    <td class="label">Tanggal PO</td>
                    <td>:</td>
                    <td>
                        {{ $po->created_at
                            ? \Carbon\Carbon::parse($po->created_at)
                                ->locale('id')
                                ->translatedFormat('l, d F Y')
                            : '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">Estimasi Kedatangan</td>
                    <td>:</td>
                    <td>
                        {{ $po->po_estimasi
                            ? \Carbon\Carbon::parse($po->po_estimasi)
                                ->translatedFormat('d F Y')
                            : '-' }}
                    </td>
                </tr>

                <tr>
                    <td class="label">Berdasarkan PR</td>
                    <td>:</td>
                    <td>{{ $po->purchaseRequest?->pr_kode ?? '-' }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

{{-- ================= JUDUL ================= --}}
<div style="text-align:right; margin: 18px 0 16px 0;">
    <div style="font-size:13px; font-weight:bold;">
        PO {{ $po->po_kode }}
    </div>
</div>

{{-- ================= TABEL BARANG ================= --}}
<table class="data">
    <thead>
        <tr>
            <th width="5%">No</th>
            <th width="18%">Part Number</th>
            <th>Nama Part</th>
            <th width="10%">Qty PR</th>
            <th width="10%">Qty PO</th>
            <th width="15%">Harga</th>
            <th width="17%">Vendor</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($po->details as $i => $item)
            @php
                $qtyPr = $po->purchaseRequest?->details
                    ->firstWhere('dtl_pr_part_number', $item->dtl_po_part_number)
                    ?->dtl_pr_qty;
            @endphp
            <tr>
                <td>{{ $i + 1 }}</td>
                <td class="left">{{ $item->dtl_po_part_number }}</td>
                <td class="left">{{ $item->dtl_po_part_name }}</td>
                <td>{{ $qtyPr ?? '-' }}</td>
                <td>{{ $item->dtl_po_qty }}</td>
                <td class="right">
                    {{ $item->dtl_po_harga
                        ? number_format($item->dtl_po_harga, 0, ',', '.')
                        : '-' }}
                </td>
                <td class="left">
                    {{ $item->vendor?->vendor_name ?? '-' }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>

{{-- ================= TANDA TANGAN ================= --}}
<table class="sign" style="margin-top:50px;">
    <tr>
        <td width="60%"></td>
        <td width="40%">
            <div style="font-weight:bold;">Disetujui Oleh</div>

            @if ($po->signature_url)
                <div style="height:70px; margin:10px 0;">
                    <img src="{{ storage_path('app/public/' . $po->signature_url) }}"
                         style="max-width:180px; max-height:70px;">
                </div>

                <strong style="font-size:11px;">
                    {{ $po->po_pic ?? 'Purchasing' }}
                </strong>

                <div style="font-size:9px; margin-top:2px;">
                    {{ $po->sign_at
                        ? \Carbon\Carbon::parse($po->sign_at)->format('d-m-Y H:i')
                        : '' }}
                </div>
            @endif
        </td>
    </tr>
</table>

</body>
</html>