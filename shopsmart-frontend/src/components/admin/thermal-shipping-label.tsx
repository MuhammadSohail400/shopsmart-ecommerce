"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ThermalShippingLabelProps {
  order: any;
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerClassName?: string;
}

// ─── Build full HTML for 4×6 Thermal Label ───────────────────────────────────
function buildThermalHTML(order: any): string {
  const addr = order.shippingAddress || {};
  const isCOD = !order.payments?.[0]?.method || order.payments?.[0]?.method === 'cod';
  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', { dateStyle: 'medium' });
  const total = formatCurrency(order.totalAmount);

  const barWidths = [3,1,2,4,1,3,2,1,4,2,3,1,2,3,4,1,2,4,1,3,2,3,1,4,2,1,3,2,4,1,3,2,1,4];
  const bars = barWidths.map(w => `<div style="width:${w}px;height:100%;background:#000;display:inline-block;"></div>`).join('');

  const itemRows = (order.items || []).map((it: any) => {
    const isCustom = Boolean(it.customConfig);
    const custom = it.customConfig;
    const name = isCustom
      ? `[CUSTOM TEE] ${custom?.color ?? ''} • ${custom?.size ?? ''}<br><span style="font-size:8px;color:#555;">Hit: ${custom?.printPosition ?? ''}</span>`
      : `${it.productVariant?.product?.title || 'ASORA PIECE'}<br><span style="font-size:8px;color:#555;">${Object.values(it.productVariant?.attributes ?? {}).join(' / ')}</span>`;
    return `<tr style="border-bottom:1px solid #ddd;">
      <td style="padding:3px 2px;font-size:9px;">${name}</td>
      <td style="padding:3px 2px;text-align:center;font-size:9px;font-weight:900;">${it.quantity}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: 4in 6in; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Courier New', monospace;
    width: 4in;
    height: 6in;
    padding: 4mm;
    background: #fff;
    color: #000;
    font-size: 10px;
  }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
  .brand-name { font-size: 22px; font-weight: 900; letter-spacing: -1px; font-family: Arial, sans-serif; }
  .brand-sub { font-size: 8px; font-weight: 700; color: #555; letter-spacing: 2px; text-transform: uppercase; }
  .badge { border: 1px solid #000; padding: 2px 5px; font-size: 8px; font-weight: 900; text-transform: uppercase; background: #f5f5f5; }
  .barcode-row { text-align: center; border-bottom: 2px solid #000; padding: 4px 0; }
  .bars { display: flex; justify-content: center; align-items: center; height: 36px; gap: 1.5px; }
  .order-num { font-size: 10px; font-weight: 900; letter-spacing: 3px; margin-top: 2px; }
  .cod-box { background: ${isCOD ? '#000' : '#f5f5f5'}; color: ${isCOD ? '#fff' : '#000'}; border: 2px solid #000; text-align: center; padding: 6px; margin: 6px 0; border-radius: 3px; }
  .cod-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; }
  .cod-amount { font-size: 22px; font-weight: 900; font-family: Arial, sans-serif; display: block; }
  .section-label { font-size: 8px; font-weight: 900; color: #555; text-transform: uppercase; display: block; margin-bottom: 2px; }
  .customer-name { font-size: 13px; font-weight: 900; text-transform: uppercase; }
  .customer-phone { font-size: 11px; font-weight: 700; }
  .customer-addr { font-size: 10px; color: #333; }
  .city-line { font-size: 11px; font-weight: 900; text-transform: uppercase; }
  .ship-to { border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  .footer { border-top: 1px solid #ccc; padding-top: 4px; text-align: center; font-size: 7px; color: #888; margin-top: 6px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand-name">ASORA</div>
    <div class="brand-sub">Streetwear Logistics</div>
    <div style="font-size:8px;color:#666;">Ph: +92 311 0297772</div>
  </div>
  <div style="text-align:right;">
    <div class="badge">STANDARD COURIER</div>
    <div style="font-size:8px;font-weight:700;margin-top:4px;">${dateFormatted}</div>
  </div>
</div>

<div class="barcode-row">
  <div class="bars">${bars}</div>
  <div class="order-num">${order.orderNumber || 'ASORA-ORDER'}</div>
</div>

<div class="cod-box">
  <span class="cod-label">${isCOD ? 'COLLECT CASH ON DELIVERY (COD)' : 'PAYMENT: PREPAID / CARD'}</span>
  <span class="cod-amount">${total}</span>
</div>

<div class="ship-to">
  <span class="section-label">DELIVER TO:</span>
  <div class="customer-name">${addr.firstName || addr.name || addr.fullName || 'Customer'} ${addr.lastName || ''}</div>
  <div class="customer-phone">${addr.phone || 'N/A'}</div>
  <div class="customer-addr">${addr.streetAddress || addr.addressLine1 || addr.line1 || addr.address || ''}</div>
  <div class="city-line">${addr.city || 'Lahore'}, ${addr.region || addr.province || 'Punjab'}</div>
</div>

<span class="section-label">PACKAGE CONTENTS (${(order.items || []).length} PIECE${(order.items || []).length !== 1 ? 'S' : ''}):</span>
<table>
  <tbody>${itemRows}</tbody>
</table>

<div class="footer">If undelivered, return to: ASORA Fulfillment Hub, Pakistan &bull; +92 311 0297772</div>

</body>
</html>`;
}

// ─── Build full HTML for A4 Packing Invoice ──────────────────────────────────
function buildInvoiceHTML(order: any): string {
  const addr = order.shippingAddress || {};
  const isCOD = !order.payments?.[0]?.method || order.payments?.[0]?.method === 'cod';
  const paymentText = isCOD ? 'CASH ON DELIVERY (COD)' : order.payments?.[0]?.method?.toUpperCase();
  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', { dateStyle: 'medium' });

  const itemRows = (order.items || []).map((it: any) => {
    const isCustom = Boolean(it.customConfig);
    const custom = it.customConfig;
    const price = Number(it.priceAtPurchase || it.unitPrice || 0);
    const desc = isCustom
      ? `<strong style="color:#b91c1c;">[CUSTOM] ${(custom?.shirtType || 'OVERSIZED').toUpperCase()} T-SHIRT</strong>
         <br><span style="font-size:9px;color:#666;">Color: ${custom?.color} &bull; Size: ${custom?.size}</span>
         <br><span style="font-size:8px;color:#888;">Placement: ${custom?.printPosition}</span>`
      : `<strong>${it.productVariant?.product?.title || 'ASORA PIECE'}</strong>
         <br><span style="font-size:9px;color:#666;">${Object.values(it.productVariant?.attributes ?? {}).join(' / ')}</span>`;
    return `<tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:8px 4px;font-size:10px;">${desc}</td>
      <td style="padding:8px 4px;text-align:center;font-weight:900;">${it.quantity}</td>
      <td style="padding:8px 4px;text-align:right;">${formatCurrency(price)}</td>
      <td style="padding:8px 4px;text-align:right;font-weight:900;">${formatCurrency(price * it.quantity)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; background: #fff; }
  h1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; font-family: Arial, sans-serif; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 12px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 12px; }
  .label-xs { font-size: 8px; font-weight: 700; color: #888; text-transform: uppercase; display: block; margin-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { border-bottom: 2px solid #000; padding: 6px 4px; font-size: 9px; text-transform: uppercase; }
  .totals { display: flex; justify-content: flex-end; }
  .totals-box { width: 200px; }
  .totals-row { display: flex; justify-content: space-between; font-size: 10px; padding: 2px 0; color: #555; }
  .totals-final { display: flex; justify-content: space-between; font-weight: 900; font-size: 13px; border-top: 2px solid #000; padding-top: 4px; margin-top: 4px; }
  .footer { border-top: 1px solid #ddd; padding-top: 8px; text-align: center; font-size: 8px; color: #999; margin-top: 12px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>ASORA</h1>
    <div style="font-size:9px;font-weight:700;color:#666;text-transform:uppercase;">Premium Streetwear Invoice</div>
    <div style="font-size:9px;color:#888;">Official Store: asora.pk</div>
  </div>
  <div style="text-align:right;">
    <span style="font-size:9px;font-weight:700;color:#888;display:block;">ORDER NUMBER</span>
    <span style="font-size:13px;font-weight:900;">${order.orderNumber || 'N/A'}</span>
    <span style="font-size:9px;color:#888;display:block;margin-top:4px;">${dateFormatted}</span>
  </div>
</div>

<div class="meta-grid">
  <div>
    <span class="label-xs">Billed &amp; Shipped To:</span>
    <strong style="font-size:11px;">${addr.firstName || addr.name || addr.fullName || 'Customer'} ${addr.lastName || ''}</strong><br>
    <span>${addr.phone || 'N/A'}</span><br>
    <span>${addr.streetAddress || addr.line1 || ''}</span><br>
    <strong>${addr.city || 'Lahore'}, ${addr.region || 'Punjab'}</strong>
  </div>
  <div>
    <span class="label-xs">Payment Method:</span>
    <span style="font-weight:700;color:#b91c1c;">${paymentText}</span><br><br>
    <span class="label-xs">Shipping Method:</span>
    <span style="font-weight:700;">Standard Courier Dispatch (COD)</span>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="text-align:left;">Piece Description</th>
      <th style="text-align:center;">Qty</th>
      <th style="text-align:right;">Price</th>
      <th style="text-align:right;">Subtotal</th>
    </tr>
  </thead>
  <tbody>${itemRows}</tbody>
</table>

<div class="totals">
  <div class="totals-box">
    <div class="totals-row"><span>Subtotal:</span><span>${formatCurrency(order.subtotal || order.totalAmount)}</span></div>
    <div class="totals-row"><span>Delivery:</span><span>${Number(order.shippingAmount) > 0 ? formatCurrency(order.shippingAmount) : 'FREE'}</span></div>
    <div class="totals-final"><span>TOTAL COD:</span><span>${formatCurrency(order.totalAmount)}</span></div>
  </div>
</div>

<div class="footer">
  <strong style="color:#000;text-transform:uppercase;">Thank you for wearing your story with ASORA.</strong><br>
  For support or returns, WhatsApp our team at +92 311 0297772 within 7 days of delivery.
</div>

</body>
</html>`;
}

// ─── Iframe Print Engine ──────────────────────────────────────────────────────
function printViaIframe(html: string) {
  // Remove any previous print iframe
  const existing = document.getElementById('asora-print-iframe');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'asora-print-iframe';
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  // Wait for fonts/images then print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ThermalShippingLabel({
  order,
  triggerText = 'Print 4×6 Shipping Label',
  triggerVariant = 'outline',
  triggerSize = 'sm',
  triggerClassName = 'font-mono text-xs uppercase gap-1.5',
}: ThermalShippingLabelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'thermal' | 'invoice'>('thermal');

  if (!order) return null;

  const addr = order.shippingAddress || {};
  const isCOD = !order.payments?.[0]?.method || order.payments?.[0]?.method === 'cod';
  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', { dateStyle: 'medium' });

  const handlePrint = () => {
    const html = mode === 'thermal' ? buildThermalHTML(order) : buildInvoiceHTML(order);
    printViaIframe(html);
  };

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        <Printer className="h-3.5 w-3.5" />
        <span>{triggerText}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-6">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <DialogTitle className="text-base font-mono font-bold uppercase text-zinc-100 flex items-center gap-2">
                <Printer className="h-4 w-4 text-rose-500" />
                <span>Courier Label &amp; Invoice Generator</span>
              </DialogTitle>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Order: <strong className="text-zinc-200">{order.orderNumber}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded border border-zinc-800 p-0.5 bg-zinc-900 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setMode('thermal')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    mode === 'thermal' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  4×6 Thermal Label
                </button>
                <button
                  type="button"
                  onClick={() => setMode('invoice')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    mode === 'invoice' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Packing Invoice
                </button>
              </div>

              <Button
                type="button"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase gap-1.5 h-8"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Document</span>
              </Button>
            </div>
          </DialogHeader>

          {/* ── PREVIEW PANEL ── */}
          <div className="pt-4 flex justify-center">

            {/* 4×6 THERMAL PREVIEW */}
            {mode === 'thermal' && (
              <div className="w-[380px] bg-white text-black p-4 rounded border-2 border-black font-mono text-left shadow-2xl space-y-2 select-text text-[11px]">
                {/* Brand & Dispatch Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-2">
                  <div>
                    <h2 className="text-xl font-black tracking-tighter uppercase font-sans">ASORA</h2>
                    <p className="text-[9px] font-bold tracking-widest text-zinc-700 uppercase">STREETWEAR LOGISTICS</p>
                    <p className="text-[9px] text-zinc-600">Ph: +92 311 0297772</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block border border-black px-1.5 py-0.5 text-[9px] font-black uppercase bg-zinc-100">STANDARD COURIER</div>
                    <p className="text-[9px] font-bold mt-1 text-zinc-800">{dateFormatted}</p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="py-1 text-center border-b-2 border-black">
                  <div className="flex justify-center items-center h-10 gap-[2px] overflow-hidden px-4">
                    {[3,1,2,4,1,3,2,1,4,2,3,1,2,3,4,1,2,4,1,3,2,3,1,4,2,1,3,2,4,1,3,2,1,4].map((w, idx) => (
                      <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black tracking-widest block mt-0.5">{order.orderNumber}</span>
                </div>

                {/* COD AMOUNT */}
                <div className={`p-2 rounded text-center border-2 border-black ${isCOD ? 'bg-black text-white' : 'bg-zinc-100 text-black'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider block">
                    {isCOD ? 'COLLECT CASH ON DELIVERY (COD)' : 'PAYMENT STATUS: PREPAID / CARD'}
                  </span>
                  <span className="text-xl font-black block font-sans">{formatCurrency(order.totalAmount)}</span>
                </div>

                {/* Shipping Address */}
                <div className="border-b-2 border-black pb-2 space-y-1">
                  <span className="text-[9px] font-black uppercase text-zinc-600 block">DELIVER TO:</span>
                  <p className="text-sm font-black uppercase leading-tight">
                    {addr.firstName || addr.name || addr.fullName || 'Customer'} {addr.lastName || ''}
                  </p>
                  <p className="text-xs font-bold leading-snug">{addr.phone || 'N/A'}</p>
                  <p className="text-[11px] leading-tight text-zinc-800">
                    {addr.streetAddress || addr.addressLine1 || addr.line1 || addr.address || ''}
                  </p>
                  <p className="text-xs font-black uppercase">{addr.city || 'Lahore'}, {addr.region || addr.province || 'Punjab'}</p>
                </div>

                {/* Item List */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] font-black uppercase text-zinc-600 block">
                    PACKAGE CONTENTS ({order.items?.length || 0} PIECES):
                  </span>
                  <div className="space-y-1">
                    {order.items?.map((it: any, idx: number) => {
                      const isCustom = Boolean(it.customConfig);
                      const custom = it.customConfig;
                      return (
                        <div key={idx} className="flex justify-between items-center text-[10px] border-b border-zinc-200 pb-1">
                          <div className="flex-1 pr-2">
                            {isCustom ? (
                              <div>
                                <span className="font-black text-rose-800">[CUSTOM TEE] </span>
                                <span className="font-bold">{custom?.color} • {custom?.size}</span>
                                <span className="text-zinc-600 block text-[9px]">Hit: {custom?.printPosition}</span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold">{it.productVariant?.product?.title || 'ASORA PIECE'}</span>
                                {it.productVariant?.attributes && (
                                  <span className="text-zinc-600 block text-[9px]">
                                    {Object.values(it.productVariant.attributes).join(' / ')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="font-black">Qty: {it.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 text-center text-[8px] text-zinc-500 border-t border-zinc-300">
                  <span>If undelivered, return to: ASORA Fulfillment Hub, Pakistan • +92 311 0297772</span>
                </div>
              </div>
            )}

            {/* A4 INVOICE PREVIEW */}
            {mode === 'invoice' && (
              <div className="w-full max-w-lg bg-white text-black p-6 rounded border border-zinc-300 font-mono text-left shadow-2xl space-y-4 select-text text-xs">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-3">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight font-sans">ASORA</h1>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase">PREMIUM STREETWEAR INVOICE</p>
                    <p className="text-[10px] text-zinc-500">Official Store: asora.pk</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-500 block">ORDER NUMBER</span>
                    <span className="text-sm font-black">{order.orderNumber}</span>
                    <span className="text-[10px] text-zinc-500 block mt-1">{dateFormatted}</span>
                  </div>
                </div>

                {/* Customer & Payment */}
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-3 text-[11px]">
                  <div>
                    <span className="font-bold text-zinc-500 uppercase block text-[9px]">BILLED &amp; SHIPPED TO:</span>
                    <p className="font-bold text-xs">{addr.firstName || addr.name || addr.fullName || 'Customer'} {addr.lastName || ''}</p>
                    <p>{addr.phone || 'N/A'}</p>
                    <p>{addr.streetAddress || addr.line1 || ''}</p>
                    <p className="font-bold">{addr.city || 'Lahore'}, {addr.region || 'Punjab'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-500 uppercase block text-[9px]">PAYMENT METHOD:</span>
                    <p className="font-bold text-xs text-rose-700">{isCOD ? 'CASH ON DELIVERY (COD)' : order.payments?.[0]?.method?.toUpperCase()}</p>
                    <span className="font-bold text-zinc-500 uppercase block text-[9px] mt-2">SHIPPING METHOD:</span>
                    <p className="font-bold">Standard Courier Dispatch (COD)</p>
                  </div>
                </div>

                {/* Items */}
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black text-[9px] font-black uppercase">
                      <th className="py-1.5">Piece Description</th>
                      <th className="py-1.5 text-center">Qty</th>
                      <th className="py-1.5 text-right">Price</th>
                      <th className="py-1.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((it: any, idx: number) => {
                      const isCustom = Boolean(it.customConfig);
                      const custom = it.customConfig;
                      const price = Number(it.priceAtPurchase || it.unitPrice || 0);
                      return (
                        <tr key={idx} className="border-b border-zinc-200">
                          <td className="py-2">
                            {isCustom ? (
                              <div>
                                <span className="font-bold text-rose-700">[CUSTOM] {(custom?.shirtType || 'OVERSIZED').toUpperCase()} T-SHIRT</span>
                                <span className="block text-[10px] text-zinc-600">Color: {custom?.color} • Size: {custom?.size}</span>
                                <span className="block text-[9px] text-zinc-500">Placement: {custom?.printPosition}</span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold">{it.productVariant?.product?.title || 'ASORA PIECE'}</span>
                                {it.productVariant?.attributes && (
                                  <span className="block text-[10px] text-zinc-600">
                                    {Object.values(it.productVariant.attributes).join(' / ')}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2 text-center font-bold">{it.quantity}</td>
                          <td className="py-2 text-right">{formatCurrency(price)}</td>
                          <td className="py-2 text-right font-bold">{formatCurrency(price * it.quantity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end pt-2">
                  <div className="w-48 space-y-1 text-right text-[11px]">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal || order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Delivery Shipping:</span>
                      <span>{Number(order.shippingAmount) > 0 ? formatCurrency(order.shippingAmount) : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1 mt-1 text-black">
                      <span>TOTAL COD:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-300 pt-3 text-center text-[9px] text-zinc-500 space-y-0.5">
                  <p className="font-bold text-black uppercase">Thank you for wearing your story with ASORA.</p>
                  <p>For support or returns, WhatsApp our team at +92 311 0297772 within 7 days of delivery.</p>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
