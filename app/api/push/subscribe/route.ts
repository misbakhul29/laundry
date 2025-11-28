import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

function writeSubs(subs: any[]) {
  try {
    fs.writeFileSync(SUB_FILE, JSON.stringify(subs, null, 2));
  } catch (e) {
    // ignore
  }
}

export async function POST(req: Request) {
  try {
    const sub = await req.json();
    const subs = readSubs();
    // avoid duplicates by endpoint
    const exists = subs.find((s: any) => s.endpoint === sub.endpoint);
    if (!exists) {
      subs.push(sub);
      writeSubs(subs);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
