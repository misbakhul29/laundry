import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // recommendnpm audit fixed for GCM
const TAG_LENGTH = 16;

function getKey(): Buffer {
    const secret = process.env.NEXT_URL_TOKEN_SECRET;
    if (!secret) throw new Error("Missing NEXT_URL_TOKEN_SECRET environment variable");
    // derive a 32-byte key from the secret (sha256)
    return crypto.createHash("sha256").update(secret).digest();
}

function base64UrlEncode(buf: Buffer) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(s: string) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    // pad to multiple of 4
    while (s.length % 4) s += "=";
    return Buffer.from(s, "base64");
}

/**
 * Encrypt a string or JSON-serializable object into a URL-safe token.
 * Returns a base64url string containing iv + tag + ciphertext.
 */
export function encryptParam(data: string | Record<string, unknown>): string {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });

    const plaintext = typeof data === "string" ? data : JSON.stringify(data);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // token layout: iv (12) | tag (16) | ciphertext
    const tokenBuf = Buffer.concat([iv, tag, encrypted]);
    return base64UrlEncode(tokenBuf);
}

/**
 * Decrypt a token produced by `encryptParam` and return the original string or parsed object.
 * If JSON parse succeeds, the parsed object is returned; otherwise the raw string is returned.
 */
export function decryptParam(token: string): string | Record<string, unknown> {
    const key = getKey();
    const buf = base64UrlDecode(token);
    if (buf.length < IV_LENGTH + TAG_LENGTH) throw new Error("Invalid token");

    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
}

const urlToken = { encryptParam, decryptParam };

export default urlToken;
