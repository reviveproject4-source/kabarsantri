import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Catat log webhook pengiriman WhatsApp
    console.log('[WhatsApp Webhook Received]:', payload);

    // Update status outbox queue jika ada message_id / status delivery
    const messageId = payload.id || payload.message_id || payload.data?.id;
    const status = payload.status; // delivered, read, failed

    if (messageId && status) {
      const mappedStatus = status === 'delivered' ? 'DELIVERED' : status === 'read' ? 'READ' : 'SENT';
      await supabase
        .from('wa_outbox_queue')
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq('vendor_message_id', messageId);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  // Verifikasi Webhook Meta Cloud API (hub.challenge)
  const searchParams = req.nextUrl.searchParams;
  const challenge = searchParams.get('hub.challenge');
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ status: 'active', gateway: 'KabarSantri WA Webhook' });
}
