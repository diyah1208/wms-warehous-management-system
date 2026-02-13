<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">

<title>Purchase Request {{ $pr->pr_kode }}</title>

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

<table>
<tr>
<td>
<img src="{{ public_path('images/Logo Garuda Mart Indonesia.png') }}" height="50"><br>
<strong>PT. Garuda Mart Indonesia</strong><br>
RT.002/RW.012 Jatiasih<br>
Bekasi 17423<br>
Telp (021)82407309
</td>

<td align="right">
<img src="{{ public_path('images/Logo-Lourdes.png') }}" height="45">
</td>
</tr>
</table>

<hr>

<h2 align="center">PURCHASE REQUEST</h2>

<table>
<tr><td width="120">Kode PR</td><td>: {{ $pr->pr_kode }}</td></tr>
<tr><td>PIC</td><td>: {{ $pr->pr_pic }}</td></tr>
<tr><td>Lokasi</td><td>: {{ $pr->pr_lokasi }}</td></tr>
<tr><td>Status</td><td>: {{ $pr->pr_status }}</td></tr>
<tr><td>Tanggal</td><td>: {{ \Carbon\Carbon::parse($pr->created_at)->format('d F Y') }}</td></tr>
</table>

<br>

<table class="data">
<thead>
<tr>
<th>No</th>
<th>Part Number</th>
<th>Nama Part</th>
<th>Satuan</th>
<th>Qty</th>
<th>MR</th>
</tr>
</thead>

<tbody>
@foreach($pr->details as $i=>$d)
<tr>
<td>{{ $i+1 }}</td>
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

<table class="sign">
<tr>

{{-- PENGAJU --}}
<td width="33%" align="center">
<b>Pengaju</b><br><br>

@if($pr->signed_pengaju_sign)
<img src="{{ storage_path('app/public/'.$pr->signed_pengaju_sign) }}">
@endif


<br>
<b>{{ $pr->signed_pengaju_name }}</b><br>
Admin WH
</td>

{{-- SPV --}}
<td width="33%" align="center">
<b>Mengetahui</b><br><br>

<!-- @if($pr->signed_spv_sign)
<img src="{{ public_path('storage/'.$pr->signed_spv_sign) }}">
@endif -->
@if($pr->signed_spv_sign)
<img src="{{ storage_path('app/public/'.$pr->signed_spv_sign) }}">
@endif


<br>
<b>{{ $pr->signed_spv_name }}</b><br>
SPV Warehouse
</td>

{{-- PPIC --}}
<td width="33%" align="center">
<b>Menyetujui</b><br><br>

@if($pr->signed_ppic_sign)
<img src="{{ storage_path('app/public/'.$pr->signed_ppic_sign) }}">
@endif

<!-- @if($pr->signed_ppic_sign)
<img src="{{ public_path('storage/'.$pr->signed_ppic_sign) }}">
@endif -->

<br>
<b>{{ $pr->signed_ppic_name }}</b><br>
PPIC
</td>

</tr>
</table>

</body>
</html>
