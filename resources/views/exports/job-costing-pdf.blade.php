<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Job Costing {{ $jc->batch_no }}</title>

    <style>
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 12px;
            margin: 40px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .header td {
            vertical-align: top;
        }

        .company-name {
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px;
        }

        .info td {
            padding: 3px 0;
        }

        .data th,
        .data td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
        }

        .data th {
            background: #eee;
        }

        .left {
            text-align: left;
        }

        .sign td {
            text-align: center;
            vertical-align: top;
        }

        .sign img {
            max-height: 60px;
        }

        h2 {
            text-align: center;
            margin: 15px 0;
        }

        hr {
            margin: 15px 0;
        }
    </style>
</head>

<body>

    {{-- HEADER --}}
    <table class="header">
        <tr>
            <td width="70%">
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

            <td width="30%" align="right">
                <img src="{{ public_path('images/Logo-Lourdes.png') }}" height="50">
            </td>
        </tr>
    </table>

    <hr>

    <h2>JOB COSTING</h2>

    {{-- INFO JOB COSTING --}}
    <table class="info">
        <tr>
            <td width="140">Batch No</td>
            <td>: {{ $jc->batch_no }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ \Carbon\Carbon::parse($jc->jc_date)->format('d F Y') }}</td>
        </tr>
        <tr>
            <td>Barang Hasil</td>
            <td>: {{ $jc->finish_part }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>: {{ $jc->jc_status }}</td>
        </tr>
        <tr>
            <td>Dibuat Oleh</td>
            <td>: {{ $jc->created_by }}</td>
        </tr>
        <tr>
            <td>Dibuat Pada</td>
            <td>: {{ \Carbon\Carbon::parse($jc->created_at)->format('d-m-Y H:i') }}</td>
        </tr>
    </table>

    <br>

    {{-- DETAIL TABLE --}}
    <table class="data">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="20%">Part Number</th>
                <th width="30%">Nama Part</th>
                <th width="10%">Qty</th>
                <th width="10%">Unit</th>
            </tr>
        </thead>

        <tbody>
            @foreach($jc->items as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $item->part_no }}</td>
                    <td class="left">{{ $item->barang->part_name ?? '-' }}</td>
                    <td>{{ $item->qty }}</td>
                    <td>{{ $item->unit }}</td>
                    <!-- <td class="left">{{ $item->item_description ?? '-' }}</td> -->
                </tr>
            @endforeach
        </tbody>
    </table>
    {{-- ================= KETERANGAN ================= --}}
    @if(!empty($jc->description))
<table width="100%" style="margin-top:18px;border-collapse:collapse;">
<tr>
<td style="
    border:1px solid #000;
    padding:12px 18px;
    font-size:11px;
    line-height:1.6;
">
<div style="margin-bottom:6px;">
<strong>Keterangan:</strong>
</div>

<div style="
    padding-left:8px;
">
{!! nl2br(e($jc->description)) !!}
</div>

</td>
</tr>
</table>
@endif


    <br><br><br>

    {{-- SIGNATURE --}}
    <table class="sign">
        <tr>

            {{-- PENGAJU --}}
            <td width="33%">
                <b>Pengaju</b><br>
                <span style="font-size:10px">(Admin / Partman WH)</span><br><br>

                @if($jc->signed_pengaju_sign)
                    <img src="{{ storage_path('app/public/'.$jc->signed_pengaju_sign) }}">
                @endif

                <br><br>
                <b>{{ $jc->signed_pengaju_name ?? '-' }}</b>
            </td>

            {{-- SPV --}}
            <td width="33%">
                <b>Mengetahui</b><br>
                <span style="font-size:10px">(SPV Warehouse)</span><br><br>

                @if($jc->signed_spv_sign)
                    <img src="{{ storage_path('app/public/'.$jc->signed_spv_sign) }}">
                @endif

                <br><br>
                <b>{{ $jc->signed_spv_name ?? '-' }}</b>
            </td>

            {{-- PPIC --}}
            <td width="33%">
                <b>Menyetujui</b><br>
                <span style="font-size:10px">(PPIC)</span><br><br>

                @if($jc->signed_ppic_sign)
                    <img src="{{ storage_path('app/public/'.$jc->signed_ppic_sign) }}">
                @endif

                <br><br>
                <b>{{ $jc->signed_ppic_name ?? '-' }}</b>
            </td>

        </tr>
    </table>

</body>
</html>
