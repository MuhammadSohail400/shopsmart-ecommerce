"use client";

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, MapPin, Truck, CheckCircle2, Phone, User, Send, Sparkles, Loader2 } from 'lucide-react';
import { formatCurrency, formatWhatsAppUrl, getUserDisplayName } from '@/lib/utils';
import { usePublicSettings } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { useClearCart } from '@/features/cart/hooks/use-cart';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

import { uploadsService } from '@/services/uploads.service';

export interface WhatsAppOrderItem {
  title: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  slugOrId?: string;
  customConfig?: {
    shirtType?: string;
    color?: string;
    size?: string;
    printPosition?: string;
    designUrl?: string;
    previewUrl?: string;
    [key: string]: any;
  };
}

interface WhatsAppOrderDialogProps {
  items: WhatsAppOrderItem[];
  triggerText?: string;
  triggerClassName?: string;
  totalPrice: number;
  isCart?: boolean;
}

export function WhatsAppOrderDialog({
  items,
  triggerText = "ORDER ON WHATSAPP",
  triggerClassName,
  totalPrice,
  isCart = false,
}: WhatsAppOrderDialogProps) {
  const { user } = useAuth();
  const { data: publicSettings } = usePublicSettings();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ orderNumber: string; url: string } | null>(null);

  const clearCart = useClearCart();

  // Form State
  const [name, setName] = useState(getUserDisplayName(user) || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const targetWhatsApp = publicSettings?.whatsapp_number || publicSettings?.support_phone || '03110297772';

  const handleOpenModal = () => {
    setCompletedOrder(null);
    setOpen(true);
  };

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pre-open a blank tab in the synchronous click context so popup blockers NEVER block it
    let waWindow: Window | null = null;
    try {
      waWindow = window.open('about:blank', '_blank');
    } catch {
      waWindow = null;
    }

    setIsSubmitting(true);

    let registeredOrderNumber = '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://asora.pk';

    // Process and auto-upload any un-uploaded custom artwork first
    const resolvedPayloadItems = await Promise.all(
      items.map(async (it) => {
        let customConfig = it.customConfig ? { ...it.customConfig } : undefined;
        if (customConfig?.designUrl && customConfig.designUrl.startsWith('data:')) {
          try {
            const uploadRes = await uploadsService.uploadCustomDesign(customConfig.designUrl);
            customConfig.designUrl = uploadRes.url;
            customConfig.previewUrl = uploadRes.url;
          } catch (uErr) {
            console.warn('Failed to upload custom artwork during WhatsApp order submission', uErr);
          }
        }
        return {
          slug: it.slugOrId,
          title: it.title,
          quantity: it.quantity || 1,
          unitPrice: it.price,
          color: it.color,
          size: it.size,
          customConfig,
        };
      })
    );

    try {
      const customer = {
        fullName: name.trim() || 'WhatsApp Customer',
        phone: phone.trim() || '03000000000',
        line1: address.trim() || 'Address shared via WhatsApp',
        city: city.trim() || 'Karachi',
        region: 'Sindh',
        country: 'PK',
      };

      const res = await apiClient<{ orderId: string; orderNumber: string; totalAmount: number }>(
        '/orders/quick-order',
        {
          method: 'POST',
          body: JSON.stringify({
            customer,
            items: resolvedPayloadItems,
            shippingAmount: 250,
            notes: notes.trim() || 'WhatsApp Quick Order (COD)',
          }),
        }
      );

      if (res?.orderNumber) {
        registeredOrderNumber = res.orderNumber;
        toast.success(`Order ${res.orderNumber} registered successfully!`);
      }

      // Clear the cart so ordered items are removed
      clearCart.mutate();
    } catch (err) {
      console.warn('WhatsApp direct order creation warning:', err);
    } finally {
      setIsSubmitting(false);
    }

    let itemsBreakdown = '';
    resolvedPayloadItems.forEach((item, idx) => {
      const isCustom = Boolean(item.customConfig);
      const custom = item.customConfig;
      const itemUrl = item.slug ? `${origin}/products/${item.slug}` : `${origin}/products`;

      itemsBreakdown += `\n${idx + 1}. *${item.title}*`;
      if (isCustom && custom) {
        itemsBreakdown += `\n   ✂️ *Custom T-Shirt Specs:*`;
        itemsBreakdown += `\n   • Fit/Style: ${custom.shirtType?.toUpperCase() || 'OVERSIZED'}`;
        itemsBreakdown += `\n   • Color: ${custom.color || item.color || 'Standard'}`;
        itemsBreakdown += `\n   • Size: ${custom.size || item.size || 'L'}`;
        itemsBreakdown += `\n   • Print Area: ${custom.printPosition?.replace('_', ' + ')?.toUpperCase() || 'FRONT'}`;
        const artworkPath = custom.designUrl || custom.previewUrl;
        if (artworkPath) {
          const artworkLink = artworkPath.startsWith('http')
            ? artworkPath
            : `${origin}${artworkPath.startsWith('/') ? '' : '/'}${artworkPath}`;
          itemsBreakdown += `\n   • 🖼️ *Artwork Link:* ${artworkLink}`;
        }
      } else {
        if (item.size) itemsBreakdown += `\n   • Size: ${item.size}`;
        if (item.color) itemsBreakdown += `\n   • Color: ${item.color}`;
        itemsBreakdown += `\n   • 🔗 Product Link: ${itemUrl}`;
      }
      itemsBreakdown += `\n   • Qty: ${item.quantity} x ${formatCurrency(item.unitPrice)}\n`;
    });

    const fullMessage = 
`🛍️ *NEW ASORA CASH ON DELIVERY ORDER* 🛍️
======================================
${registeredOrderNumber ? `🆔 *ORDER ID:* ${registeredOrderNumber}\n--------------------------------------\n` : ''}📦 *ITEMS ORDERED:*
${itemsBreakdown}
💵 *TOTAL AMOUNT:* ${formatCurrency(totalPrice)} (Cash on Delivery)
--------------------------------------
📍 *CUSTOMER DELIVERY DETAILS:*
• *Full Name:* ${name.trim() || 'Not specified'}
• *Phone / WhatsApp:* ${phone.trim() || 'Not specified'}
• *City:* ${city.trim() || 'Not specified'}
• *Delivery Address:* ${address.trim() || 'Not specified'}
${notes.trim() ? `• *Special Instructions:* ${notes.trim()}\n` : ''}======================================
Please confirm my order and share tracking/dispatch details. Thank you!`;

    const url = formatWhatsAppUrl(targetWhatsApp, fullMessage);

    // Navigate the pre-opened tab to WhatsApp
    if (waWindow && !waWindow.closed) {
      try {
        waWindow.location.href = url;
      } catch {
        window.location.href = url;
      }
    } else {
      // Fallback if window was blocked
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.location.href = url;
      }
    }

    setCompletedOrder({
      orderNumber: registeredOrderNumber || 'NEW ORDER',
      url,
    });
  };

  const handleDirectChat = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://asora.pk';
    let itemsText = items.map(i => `${i.title} (${origin}/products/${i.slugOrId || ''})`).join(', ');
    const quickMsg = `Hi ASORA! I would like to order: ${itemsText}. Total: ${formatCurrency(totalPrice)}. Please confirm availability & delivery.`;
    const url = formatWhatsAppUrl(targetWhatsApp, quickMsg);
    
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpenModal}
        className={triggerClassName || "h-10 border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider rounded gap-2 shadow-sm"}
      >
        <MessageCircle className="h-4 w-4 text-emerald-400" />
        <span>{triggerText}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-zinc-100 flex items-center gap-2 font-mono uppercase">
                  1-Click WhatsApp Order
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    COD
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Apna address enter karein taake complete order WhatsApp par send ho sake.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Success Screen after submission */}
          {completedOrder ? (
            <div className="p-6 space-y-4 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                  ORDER REGISTERED
                </span>
                <h3 className="text-lg font-mono font-black text-zinc-100">
                  {completedOrder.orderNumber}
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Your order is queued! Click below to send your details on WhatsApp directly.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href={completedOrder.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>OPEN WHATSAPP CHAT NOW</span>
                </a>

                {completedOrder.orderNumber && (
                  <a
                    href={`/orders/track?order=${completedOrder.orderNumber}`}
                    className="w-full h-10 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 font-mono text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <Truck className="h-3.5 w-3.5 text-rose-500" />
                    <span>Track Order Live</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary Strip */}
              <div className="bg-zinc-900/70 px-5 py-3 border-b border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[240px]">
                  <Truck className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="truncate font-medium text-zinc-300">
                    {items.length === 1 ? items[0].title : `${items.length} Pieces in Order`}
                  </span>
                </div>
                <span className="font-mono font-black text-emerald-400">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSendOrder} className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="wa-name" className="text-[11px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
                      <User className="h-3 w-3 text-zinc-500" />
                      Full Name *
                    </Label>
                    <Input
                      id="wa-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ali Khan"
                      className="h-9 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded focus-visible:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="wa-phone" className="text-[11px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
                      <Phone className="h-3 w-3 text-zinc-500" />
                      Phone / WhatsApp *
                    </Label>
                    <Input
                      id="wa-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="h-9 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded focus-visible:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="wa-city" className="text-[11px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    City *
                  </Label>
                  <Input
                    id="wa-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Karachi / Lahore / Islamabad"
                    className="h-9 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded focus-visible:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="wa-address" className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                    Complete Delivery Address *
                  </Label>
                  <Textarea
                    id="wa-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House #, Street #, Sector / Area, Landmark..."
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded min-h-[58px] focus-visible:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="wa-notes" className="text-[11px] font-mono text-zinc-500 uppercase">
                    Special Instructions (Optional)
                  </Label>
                  <Input
                    id="wa-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call before delivery"
                    className="h-8 bg-zinc-900/60 border-zinc-800 text-zinc-300 text-[11px] rounded"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>REGISTERING ORDER...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>SEND ORDER TO WHATSAPP</span>
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleDirectChat}
                    className="w-full text-center text-[11px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 py-1 font-mono transition-colors"
                  >
                    Skip address & chat on WhatsApp directly &rarr;
                  </button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

