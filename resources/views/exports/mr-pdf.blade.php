<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">

<title>Material Request {{ $mr->mr_kode }}</title>

<style>
body {
    font-family: DejaVu Sans, sans-serif;
    font-size:12px;
    margin:40px;
}

table { width:100%; border-collapse:collapse; }

.data th,.data td{
    border:1px solid #000;
    padding:6px;
    text-align:center;
}

.data th{ background:#eee }

.left{text-align:left}

.sign img{ max-height:60px }
</style>
</head>

<body>

{{-- ================= HEADER ================= --}}
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

<td align="right">
<img src="{{ public_path('images/Logo-Lourdes.png') }}" height="45">
</td>
</tr>
</table>

<hr>

<h2 align="center">MATERIAL REQUEST</h2>

{{-- ================= INFO ================= --}}
<table>
<tr><td width="140">Kode MR</td><td>: {{ $mr->mr_kode }}</td></tr>
<tr><td>PIC</td><td>: {{ $mr->mr_pic }}</td></tr>
<tr><td>Lokasi</td><td>: {{ $mr->mr_lokasi }}</td></tr>
<tr><td>Status</td><td>: {{ $mr->mr_status }}</td></tr>
<tr>
<td>Tanggal MR</td>
<td>: {{ \Carbon\Carbon::parse($mr->mr_tanggal)->format('d F Y') }}</td>
</tr>
<tr>
<td>Due Date</td>
<td>: {{ \Carbon\Carbon::parse($mr->mr_due_date)->format('d F Y') }}</td>
</tr>
</table>

<br>

{{-- ================= TABLE BARANG ================= --}}
<table class="data">
<thead>
<tr>
<th>No</th>
<th>Part Number</th>
<th>Nama Part</th>
<th>Satuan</th>
<th>Prioritas</th>
<th>Qty Request</th>
<th>Qty Diterima</th>
<th>Keterangan</th>
</tr>
</thead>

<tbody>
@foreach ($mr->details as $i => $item)
<tr>
<td>{{ $i + 1 }}</td>
<td>{{ $item->dtl_mr_part_number }}</td>
<td class="left">{{ $item->dtl_mr_part_name }}</td>
<td>{{ $item->dtl_mr_satuan }}</td>
<td>{{ $item->dtl_mr_prioritas }}</td>
<td>{{ $item->dtl_mr_qty_request }}</td>
<td>{{ $item->dtl_mr_qty_received }}</td>
<td class="left">{{ $item->dtl_mr_note ?? '-' }}</td>
</tr>
@endforeach
</tbody>
</table>

<br><br><br>

{{-- ================= TANDA TANGAN ================= --}}
<table class="sign">
<tr>

{{-- PENGAJU --}}
<td width="50%" align="center">
<b>Pengaju</b><br><br>

@if($mr->signed_pengaju_sign)
 <img src="{{ storage_path('app/public/'.$mr->signed_pengaju_sign) }}">
@endif

<br>
<b>{{ $mr->signed_pengaju_name }}</b><br>
Warehouse
</td>


{{-- GL MEKANIK --}}
<td width="50%" align="center">
<b>Mengetahui</b><br><br>

@if($mr->signed_gl_sign)
<img src="{{ storage_path('app/public/'.$mr->signed_gl_sign) }}">
@endif

<br>
<b>{{ $mr->signed_gl_name }}</b><br>
GL Mekanik
</td>

</tr>
</table>

</body>
</html>