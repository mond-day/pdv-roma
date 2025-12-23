import CryptoJS from "crypto-js";

const MASTER_KEY = process.env.MASTER_KEY;

if (!MASTER_KEY) {
  throw new Error("MASTER_KEY environment variable is required");
}

// TypeScript assertion: MASTER_KEY is guaranteed to be string after the check above
const MASTER_KEY_STRING: string = MASTER_KEY;

export function encrypt(value: string): string {
  return CryptoJS.AES.encrypt(value, MASTER_KEY_STRING).toString();
}

export function decrypt(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, MASTER_KEY_STRING);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function maskSecret(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars) {
    return "****";
  }
  return `****${value.slice(-visibleChars)}`;
}

