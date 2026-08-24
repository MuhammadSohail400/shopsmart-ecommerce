"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Printer, FileText, QrCode, Tag, Truck, ShieldCheck } from 'lucide-react';
import { formatCurrency, resolveMediaUrl } from '@/lib/utils';
import { CustomGarmentThumbnail } from '@/components/storefront/custom-garment-thumbnail';

interface ThermalShippingLabelProps {
  order: any;
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerClassName?: string;
}

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
  const paymentText = isCOD ? 'CASH ON DELIVERY (COD)' : order.payments?.[0]?.method?.toUpperCase();
  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', {
    dateStyle: 'medium',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={triggerClassName}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-6">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <DialogTitle className="text-base font-mono font-bold uppercase text-zinc-100 flex items-center gap-2">
                <Printer className="h-4 w-4 text-rose-500" />
                <span>Courier Label & Invoice Generator</span>
              </DialogTitle>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Order: <strong className="text-zinc-200">{order.orderNumber}</strong>
              </p>
            </div>

            {/* Mode switcher & Print action */}
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

          {/* ── PRINTABLE CANVAS CONTAINER ── */}
          <div className="pt-4 flex justify-center">
            
            {/* 4×6 INCH THERMAL STICKER */}
            {mode === 'thermal' && (
              <div
                id="printable-shipping-label"
                className="w-[380px] bg-white text-black p-4 rounded border-2 border-black font-mono text-left shadow-2xl space-y-2 select-text text-[11px]"
              >
                {/* Brand & Dispatch Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-2">
                  <div>
                    <h2 className="text-xl font-black tracking-tighter uppercase font-sans">ASORA</h2>
                    <p className="text-[9px] font-bold tracking-widest text-zinc-700 uppercase">
                      STREETWEAR LOGISTICS
                    </p>
                    <p className="text-[9px] text-zinc-600">Ph: +92 311 0297772</p>
                  </div>

                  <div className="text-right">
                    <div className="inline-block border border-black px-1.5 py-0.5 text-[9px] font-black uppercase bg-zinc-100">
                      STANDARD COURIER
                    </div>
                    <p className="text-[9px] font-bold mt-1 text-zinc-800">{dateFormatted}</p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="py-1 text-center border-b-2 border-black">
                  <div className="flex justify-center items-center h-10 gap-[2px] overflow-hidden px-4">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 4, 1, 3, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black tracking-widest block mt-0.5">
                    {order.orderNumber}
                  </span>
                </div>

                {/* COD AMOUNT BIG BADGE */}
                <div className={`p-2 rounded text-center border-2 border-black ${
                  isCOD ? 'bg-black text-white' : 'bg-zinc-100 text-black'
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider block">
                    {isCOD ? 'COLLECT CASH ON DELIVERY (COD)' : 'PAYMENT STATUS: PREPAID / CARD'}
                  </span>
                  <span className="text-xl font-black block font-sans">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* RECIPIENT SHIPPING ADDRESS */}
                <div className="border-b-2 border-black pb-2 space-y-1">
                  <span className="text-[9px] font-black uppercase text-zinc-600 block">
                    DELIVER TO:
                  </span>
                  <p className="text-sm font-black uppercase leading-tight">
                    {addr.firstName || addr.name || 'Customer'} {addr.lastName || ''}
                  </p>
                  <p className="text-xs font-bold leading-snug">
                    {addr.phone || 'N/A'}
                  </p>
                  <p className="text-[11px] leading-tight text-zinc-800">
                    {addr.streetAddress || addr.addressLine1 || addr.address || ''}
                    {addr.apartment ? `, Apt/Suite ${addr.apartment}` : ''}
                  </p>
                  <p className="text-xs font-black uppercase">
                    {addr.city || 'Lahore'}, {addr.region || addr.province || 'Punjab'}
                  </p>
                </div>

                {/* ITEM MANIFEST / PACKING BREAKDOWN */}
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

                {/* Footer Note */}
                <div className="pt-2 text-center text-[8px] text-zinc-500 border-t border-zinc-300">
                  <span>If undelivered, return to: ASORA Fulfillment Hub, Pakistan • +92 311 0297772</span>
                </div>
              </div>
            )}

            {/* A4 PACKING INVOICE SLIP */}
            {mode === 'invoice' && (
              <div
                id="printable-packing-invoice"
                className="w-full max-w-lg bg-white text-black p-6 rounded border border-zinc-300 font-mono text-left shadow-2xl space-y-4 select-text text-xs"
              >
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

                {/* Customer & Payment Meta */}
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-3 text-[11px]">
                  <div>
                    <span className="font-bold text-zinc-500 uppercase block text-[9px]">BILLED & SHIPPED TO:</span>
                    <p className="font-bold text-xs">{addr.firstName || addr.name || 'Customer'} {addr.lastName || ''}</p>
                    <p>{addr.phone || 'N/A'}</p>
                    <p>{addr.streetAddress || ''}</p>
                    <p className="font-bold">{addr.city || 'Lahore'}, {addr.region || 'Punjab'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-500 uppercase block text-[9px]">PAYMENT METHOD:</span>
                    <p className="font-bold text-xs text-rose-700">{paymentText}</p>
                    <span className="font-bold text-zinc-500 uppercase block text-[9px] mt-2">SHIPPING METHOD:</span>
                    <p className="font-bold">Standard Courier Dispatch (COD)</p>
                  </div>
                </div>

                {/* Items Table */}
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
                                <span className="font-bold text-rose-700">[CUSTOM] {custom?.shirtType?.toUpperCase()} T-SHIRT</span>
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

                {/* Pricing Summary */}
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

                {/* Footer Notes */}
                <div className="border-t border-zinc-300 pt-3 text-center text-[9px] text-zinc-500 space-y-0.5">
                  <p className="font-bold text-black uppercase">Thank you for wearing your story with ASORA.</p>
                  <p>For support or returns, WhatsApp our team at +92 311 0297772 within 7 days of delivery.</p>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* Global Print-Only CSS Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-shipping-label, #printable-shipping-label *,
          #printable-packing-invoice, #printable-packing-invoice * {
            visibility: visible !important;
          }
          #printable-shipping-label {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            min-height: 150mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: none !important;
            box-shadow: none !important;
          }
          #printable-packing-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}
