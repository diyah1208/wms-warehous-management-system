<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Job Costing {{ $jc->batch_no }}</title>

    <style>
        body {
            font-family: "calibri", Times, serif;
            font-size: 12px;
            margin: 40px 40px 30px 40px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .label {
            font-weight: bold;
            white-space: nowrap;
        }

        .data th, .data td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
        }

        .data th {
            background: #f2f2f2;
        }

        .left {
            text-align: left;
        }

        .sign td {
            padding-top: 60px;
            text-align: center;
        }
    </style>
</head>

<body>

{{-- ================= HEADER ================= --}}
<table>
    <tr>
        <td>
            <img
                src="{{ public_path('images/logo-gmi_small.png') }}"
                style="height:50px; display:block;"
            >

            <div style="font-size:12px; margin-top:4px; line-height:1.4;">
                <strong>PT. Garuda Mart Indonesia</strong><br>
                RT.002/RW.012, Jatiasih, Kec. Jatiasih<br>
                Kota Bekasi, Jawa Barat 17423<br>
                Telp: (021) 82407309
            </div>
        </td>

        <td width="30%" align="right" valign="top">
            <img
                src="{{ public_path('images/Logo-Lourdes.png') }}"
                style="height:45px;"
            >
        </td>
    </tr>
</table>

<table style="margin-top:10px; margin-bottom:18px;">
    <tr>
        <td style="border-bottom:1px solid #000;"></td>
    </tr>
</table>

<div style="text-align:center; margin: 10px 0 18px 0;">
    <div style="font-size:15px; font-weight:bold; letter-spacing:0.5px;">
        JOB COSTING
    </div>
</div>

{{-- ================= INFO JC ================= --}}
<table width="100%" style="margin-bottom:18px;">
    <tr>
        <td width="50%" valign="top">
            <table width="100%">
                <tr>
                    <td class="label" style="width:140px;">Batch No</td>
                    <td style="width:10px;">:</td>
                    <td>{{ $jc->batch_no }}</td>
                </tr>

                <tr>
                    <td class="label">Tanggal</td>
                    <td>:</td>
                    <td>
                        {{ \Carbon\Carbon::parse($jc->jc_date)
                            ->locale('id')
                            ->translatedFormat('l, d F Y') }}
                    </td>
                </tr>

                <tr>
                    <td class="label">Barang Hasil</td>
                    <td>:</td>
                    <td>{{ $jc->description }}</td>
                </tr>

                <tr>
                    <td class="label">Dibuat Oleh</td>
                    <td>:</td>
                    <td>{{ $jc->created_by }}</td>
                </tr>

                <tr>
                    <td class="label">Dibuat Pada</td>
                    <td>:</td>
                    <td>
                        {{ \Carbon\Carbon::parse($jc->created_at)
                            ->format('d-m-Y H:i') }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

{{-- ================= JUDUL ================= --}}
<div style="text-align:right; margin: 18px 0 16px 0;">
    <div style="font-size:13px; font-weight:bold;">
        JC {{ $jc->batch_no }}
    </div>
</div>

{{-- ================= TABEL ITEM ================= --}}
<table class="data">
    <thead>
        <tr>
            <th width="5%">No</th>
            <th width="20%">Part Number</th>
            <th>Nama Part</th>
            <th width="10%">Qty</th>
            <th width="10%">Unit</th>
            <th width="20%">Keterangan</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($jc->items as $i => $item)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td class="left">{{ $item->part_no }}</td>
            <td class="left">{{ $item->barang->part_name ?? '-' }}</td>
            <td>{{ $item->qty }}</td>
            <td>{{ $item->unit }}</td>
            <td class="left">{{ $item->item_description ?? '-' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="6">Tidak ada item</td>
        </tr>
        @endforelse
    </tbody>
</table>

{{-- ================= TANDA TANGAN ================= --}}
<table width="100%" style="margin-top:60px; text-align:center;">
    <tr>
        {{-- PEMBUAT --}}
        <td width="50%">
            <strong>Dibuat Oleh</strong><br><br>

            <div style="height:70px;"></div>

            <strong style="font-size:11px;">
                {{ $jc->created_by }}
            </strong>
        </td>

        {{-- MENGETAHUI --}}
        <td width="50%">
            <strong>Mengetahui</strong><br><br>

            <div style="height:70px;"></div>

            <strong style="font-size:11px;">
                Manager / Atasan
            </strong>
        </td>
    </tr>
</table>

</body>
</html>