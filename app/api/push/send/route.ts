import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';

const SUB_FILE = path.join(process.cwd(), 'push_subscriptions.json');

function readSubs() {
  try {
    if (!fs.existsSync(SUB_FILE)) return [];
    const raw = fs.readFileSync(SUB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = body.title || 'Laundry Reminder';
    const message = body.body || "It's time to do your laundry.";

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      return NextResponse.json({ ok: false, error: 'VAPID keys not configured' }, { status: 500 });
    }

    webpush.setVapidDetails('mailto:admin@example.com', publicKey, privateKey);

    const subs = readSubs();
    const results: any[] = [];
    await Promise.all(
      subs.map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub, JSON.stringify({ title, body: message }));
          results.push({ endpoint: sub.endpoint, status: 'ok' });
        } catch (err) {
          results.push({ endpoint: sub.endpoint, status: 'error', error: String(err) });
        }
      })
    );

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
