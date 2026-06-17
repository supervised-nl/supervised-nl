import { Resend } from "resend";

let client: Resend | undefined;

export function getResend() {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}
