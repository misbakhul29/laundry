'use server'

import { encryptParam, decryptParam } from "@/lib/urlToken";

export async function encryptToken(data: string | Record<string, unknown>) {
  return encryptParam(data);
}

export async function decryptToken(token: string) {
  return decryptParam(token);
}
