import { NextRequest, NextResponse } from 'next/server';
import { whatsAppGateway } from '@/services/whatsapp-gateway.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, recipient_name, category, tenant_id } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Nomor tujuan (to) dan pesan (message) wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await whatsAppGateway.sendMessage({
      to,
      message,
      recipient_name,
      category,
      tenant_id,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan internal gateway WA' },
      { status: 500 }
    );
  }
}
