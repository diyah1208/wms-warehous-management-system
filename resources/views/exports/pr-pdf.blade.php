<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Purchase Request {{ $pr->pr_kode }}</title>

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

        .info td {
            padding: 3px 0;
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

    <h2>PURCHASE REQUEST</h2>

    {{-- INFO PR --}}
    <table class="info">
        <tr>
            <td width="120">Kode PR</td>
            <td>: {{ $pr->pr_kode }}</td>
        </tr>
        <tr>
            <td>PIC</td>
            <td>: {{ $pr->pr_pic }}</td>
        </tr>
        <tr>
            <td>Lokasi</td>
            <td>: {{ $pr->pr_lokasi }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td>: {{ $pr->pr_status }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ \Carbon\Carbon::parse($pr->created_at)->format('d F Y') }}</td>
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
                <th width="10%">Satuan</th>
                <th width="10%">Qty</th>
                <th width="15%">MR</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pr->details as $i => $d)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $d->dtl_pr_part_number }}</td>
                    <td class="left">{{ $d->dtl_pr_part_name }}</td>
                    <td>{{ $d->dtl_pr_satuan }}</td>
                    <td>{{ $d->dtl_pr_qty }}</td>
                    <td>{{ $d->mr->mr_kode ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <br><br><br>

    {{-- SIGNATURE --}}
    <table class="sign">
        <tr>

            {{-- PENGAJU --}}
            <td width="33%">
                <b>Pengaju</b><br><br>

                @if($pr->signed_pengaju_sign)
                    <img src="{{ storage_path('app/public/'.$pr->signed_pengaju_sign) }}">
                @endif

                <br><br>
                <b>{{ $pr->signed_pengaju_name }}</b><br>
                Admin WH
            </td>

            {{-- SPV --}}
            <td width="33%">
                <b>Mengetahui</b><br><br>

                @if($pr->signed_spv_sign)
                    <img src="{{ storage_path('app/public/'.$pr->signed_spv_sign) }}">
                @endif

                <br><br>
                <b>{{ $pr->signed_spv_name }}</b><br>
                SPV Warehouse
            </td>

            {{-- PPIC --}}
            <td width="33%">
                <b>Menyetujui</b><br><br>

                @if($pr->signed_ppic_sign)
                    <img src="{{ storage_path('app/public/'.$pr->signed_ppic_sign) }}">
                @endif

                <br><br>
                <b>{{ $pr->signed_ppic_name }}</b><br>
                PPIC
            </td>

        </tr>
    </table>

</body>
</html>
