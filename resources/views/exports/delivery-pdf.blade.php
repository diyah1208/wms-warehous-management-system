<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Delivery {{ $delivery->dlv_kode }}</title>

    <style>
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 12px;
            margin: 40px;
        }

        table {
            width: 100%;
            border-spacing: 0;
        }

        .data th, .data td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
        }

        .data th {
            background: #f2f2f2;
            font-weight: bold;
        }

        .left {
            text-align: left;
        }
    </style>
</head>

<body>

<!-- ================= HEADER =================NOTES\\\ -->
<table>
    <tr>
        <td>
            <img
                src="{{ public_path('images/logo_gmi_600.png') }}"
                width="240"
            >
            <div style="margin-top:6px; line-height:1.4;">
                <strong>PT. Garuda Mart Indonesia</strong><br>
                RT.002/RW.012, Jatiasih, Kec. Jatiasih<br>
                Kota Bekasi, Jawa Barat 17423<br>
                Telp: (021) 82407309
            </div>
        </td>
        <td align="right" valign="top">
            <img
                src="{{ public_path('images/logo_lourdes_small.png') }}"
                width="160"
            >
        </td>
    </tr>
</table>

<hr style="margin:12px 0;">

<div style="text-align:center; font-size:15px; font-weight:bold; margin-bottom:16px;">
    SURAT PENERIMAAN BARANG
</div>

<table style="margin-bottom:16px;">
    <tr>
        <td width="140"><strong>Lokasi Pengiriman</strong></td>
        <td width="10">:</td>
        <td>{{ $delivery->dlv_dari_gudang }}</td>
    </tr>
    <tr>
        <td><strong>Lokasi Penerima</strong></td>
        <td>:</td>
        <td>{{ $delivery->dlv_ke_gudang }}</td>
    </tr>
    <tr>
        <td><strong>Nomor Resi</strong></td>
        <td>:</td>
        <td>{{ $delivery->dlv_no_resi ?? '-' }}</td>
    </tr>
    <tr>
        <td><strong>Tanggal Pengiriman</strong></td>
        <td>:</td>
        <td>
            {{ \Carbon\Carbon::parse($delivery->created_at)
                ->locale('id')
                ->translatedFormat('l, d F Y') }}
        </td>
    </tr>
    <tr>
        <td><strong>Jasa Pengiriman</strong></td>
        <td>:</td>
        <td>{{ $delivery->dlv_ekspedisi }}</td>
    </tr>
    <tr>
        <td><strong>Penanggung Jawab</strong></td>
        <td>:</td>
        <td>{{ $delivery->dlv_pic }}</td>
    </tr>
</table>

<div style="text-align:right; font-weight:bold; margin-bottom:10px;">
    DELIVERY {{ $delivery->dlv_kode }}
    / {{ strtoupper($delivery->dlv_dari_gudang) }}
    / {{ strtoupper($delivery->dlv_ke_gudang) }}
</div>

<table class="data">
    <thead>
        <tr>
            <th width="5%">No</th>
            <th width="18%">Part Number</th>
            <th>Part Name</th>
            <th width="10%">Satuan</th>
            <th width="12%">Qty Diterima</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($delivery->details as $i => $item)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td class="left">{{ $item->dtl_dlv_part_number }}</td>
            <td class="left">{{ $item->dtl_dlv_part_name }}</td>
            <td>{{ $item->dtl_dlv_satuan }}</td>
            <td>{{ $item->qty_delivered }}</td>
        </tr>
        @endforeach
    </tbody>
</table>


@if (!empty($delivery->details->pluck('receive_note')->filter()->first()))
<table width="100%" style="margin-top:18px; border-collapse:collapse;">
    <tr>
        <td style="
            border:1px solid #000;
            padding:8px 10px;
            font-size:11px;
            line-height:1.5;
        ">
            <strong>Notes :</strong><br>
            @foreach ($delivery->details as $d)
                @if (!empty($d->receive_note))
                    {!! nl2br(e($d->receive_note)) !!}
                @endif
            @endforeach
        </td>
    </tr>
</table>
@endif


<table style="margin-top:40px;">
    <tr>
        <td width="60%"></td>
        <td align="center">
            <strong>Warehouse</strong><br>

            @if ($delivery->signed_penerima_sign)
                <img
                    src="{{ public_path('storage/'.$delivery->signed_penerima_sign) }}"
                    width="150"
                ><br>
            @endif

            <strong style="font-size:11px;">
                {{ $delivery->signed_penerima_name ?? '-' }}
            </strong>


            <span style="font-size:9px;">
                {{ optional($delivery->signed_penerima_at)->format('d-m-Y H:i') }}
            </span>
        </td>
    </tr>
</table>

</body>
</html>
