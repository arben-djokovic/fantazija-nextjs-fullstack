import "server-only";
import { Resend } from "resend";
import { describeItem } from "@/lib/orderLines";
import { formatPrice } from "@/lib/format";

// Mejl vlasniku kad stigne nova narudžba (Resend). Ključ i adrese su u .env.local:
// RESEND_API_KEY, ORDER_EMAIL_TO (kome ide), ORDER_EMAIL_FROM (adresa na verifikovanom domenu fantazija.me).
const DEFAULT_FROM = "Fantazija narudžbe <narudzbe@fantazija.me>";

let client;
function resend() {
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

const escape = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const dateLabel = (iso) => `${Number(iso.slice(8, 10))}. ${Number(iso.slice(5, 7))}. ${iso.slice(0, 4)}.`;

function lineHtml(line) {
  const { title, option, details, photos } = describeItem(line);
  const price = line.unitPrice === null ? "po dogovoru" : formatPrice(line.unitPrice * line.quantity);
  const photoLinks = photos.map((url, index) => `<a href="${escape(url)}">slika ${index + 1}</a>`).join(", ");
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;vertical-align:top">
        <strong>${line.quantity}× ${escape(title)}</strong> <span style="color:#777">· ${escape(option)}</span>
        ${details.length ? `<div style="color:#555;font-size:13px;margin-top:2px">${escape(details.join(" · "))}</div>` : ""}
        ${photoLinks ? `<div style="font-size:13px;margin-top:2px">Fotografije: ${photoLinks}</div>` : ""}
      </td>
      <td style="padding:8px 0 8px 12px;border-bottom:1px solid #eee;text-align:right;vertical-align:top;white-space:nowrap">${price}</td>
    </tr>`;
}

export async function sendNewOrderEmail(order) {
  const to = process.env.ORDER_EMAIL_TO;
  if (!process.env.RESEND_API_KEY || !to) return; // lokalno bez ključa se mejl samo preskače

  const { customer } = order;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const adminUrl = siteUrl ? `${siteUrl}/admin/orders/${order._id}` : null;
  const total = `${formatPrice(order.total)}${order.hasPhonePrice ? " + stavke po dogovoru" : ""}`;
  const pickup = `${dateLabel(order.pickupDate)} u ${order.pickupTime}`;

  const html = `
  <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;max-width:560px">
    <h2 style="margin:0 0 16px">Nova narudžba</h2>
    <p style="margin:0 0 4px"><strong>${escape(customer.name)}</strong></p>
    <p style="margin:0 0 4px"><a href="tel:${escape(customer.phone.replace(/\s/g, ""))}">${escape(customer.phone)}</a>${customer.viber ? " · želi potvrdu na Viber" : ""}</p>
    <p style="margin:0 0 16px">Preuzimanje: <strong>${pickup}</strong></p>
    <table style="width:100%;border-collapse:collapse">${order.items.map(lineHtml).join("")}</table>
    <p style="margin:16px 0;text-align:right">Ukupno: <strong>${escape(total)}</strong></p>
    ${adminUrl ? `<p><a href="${adminUrl}" style="display:inline-block;background:#b72f5d;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Otvori narudžbu u adminu</a></p>` : ""}
  </div>`;

  const { error } = await resend().emails.send({
    from: process.env.ORDER_EMAIL_FROM || DEFAULT_FROM,
    to: to.split(",").map((address) => address.trim()),
    subject: `Nova narudžba: ${customer.name}, ${pickup}`,
    html,
  });
  if (error) throw new Error(error.message);
}
