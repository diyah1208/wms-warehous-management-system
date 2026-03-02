<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Purchase Order {{ $po->po_kode }}</title>

<style>
body{
    font-family: DejaVu Sans, sans-serif;
    font-size:12px;
    margin:40px;
}

table{ width:100%; border-collapse:collapse; }

.data th,.data td{
    border:1px solid #000;
    padding:6px;
    text-align:center;
}

.data th{ background:#eee }

.left{ text-align:left }
.right{ text-align:right }

.sign img{ max-height:60px }
</style>
</head>

<body>

{{-- ================= HEADER ================= --}}
<table>
<tr>
<td>
<img src="{{ public_path('images/logo_gmi_600.png') }}" height="50"><br>
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

<h2 align="center">PURCHASE ORDER</h2>

{{-- ================= INFO PO ================= --}}
<table>
<tr><td width="140">Kode PO</td><td>: {{ $po->po_kode }}</td></tr>
<tr><td>Status</td><td>: {{ $po->po_status }}</td></tr>
<tr><td>Detail Status</td><td>: {{ $po->po_detail_status }}</td></tr>
<tr>
<td>Tanggal PO</td>
<td>: {{ $po->created_at ? \Carbon\Carbon::parse($po->created_at)->format('d F Y') : '-' }}</td>
</tr>
<tr>
<td>Estimasi Kedatangan</td>
<td>: {{ $po->po_estimasi ? \Carbon\Carbon::parse($po->po_estimasi)->format('d F Y') : '-' }}</td>
</tr>
<tr>
<td>Berdasarkan PR</td>
<td>: {{ $po->purchaseRequest?->pr_kode ?? '-' }}</td>
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
<th>Qty PR</th>
<th>Qty PO</th>
<th>Harga</th>
<th>Vendor</th>
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
<td>{{ $item->dtl_po_part_number }}</td>
<td class="left">{{ $item->dtl_po_part_name }}</td>
<td>{{ $qtyPr ?? '-' }}</td>
<td>{{ $item->dtl_po_qty }}</td>
<td class="right">
{{ $item->dtl_po_harga ? number_format($item->dtl_po_harga,0,',','.') : '-' }}
</td>
<td class="left">{{ $item->vendor?->vendor_name ?? '-' }}</td>
</tr>
@endforeach
</tbody>
</table>

<br><br><br>
{{-- ================= TANDA TANGAN ================= --}}
<table class="sign">
<tr>
<td width="60%"></td>

<td width="40%" align="center">
<b>Disetujui Oleh</b><br><br>

@if($po->signed_pengaju_sign)
    @php
        $path = storage_path('app/public/'.$po->signed_pengaju_sign);
    @endphp

    @if(file_exists($path))
        <img src="file://{{ $path }}" style="max-height:60px;">
    @endif
@endif

<br>
<b>{{ $po->signed_pengaju_name ?? 'Purchasing' }}</b><br>
Purchasing

@if($po->signed_pengaju_at)
<br>
<span style="font-size:10px;">
{{ \Carbon\Carbon::parse($po->signed_pengaju_at)->format('d-m-Y') }}
</span>
@endif

</td>
</tr>
</table>
</body>
</html>