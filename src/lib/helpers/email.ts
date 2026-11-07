import { emailColors } from "@/constants/email";
import type { EmailContent, PasswordResetEmailCopy } from "@/types/email";
import { interpolate } from "./format";

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function passwordResetEmail(copy: PasswordResetEmailCopy, { name, url }: { name: string; url: string }): EmailContent {
  const greeting = interpolate(copy.greeting, { name }).replace(/\s+,/, ",");
  const href = escapeHtml(url);
  const paragraph = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${emailColors.ink}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:${emailColors.canvasAlt};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:${emailColors.canvas};border-radius:12px">
      <tr>
        <td style="padding:32px">
          <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${emailColors.ink}">Synergy QMP</p>
          <p style="${paragraph}">${escapeHtml(greeting)}</p>
          <p style="${paragraph}">${escapeHtml(copy.body)}</p>
          <p style="margin:24px 0">
            <a href="${href}" style="display:inline-block;padding:12px 24px;border-radius:6px;background:${emailColors.brand};color:${emailColors.ink};font-weight:600;text-decoration:none">${escapeHtml(copy.button)}</a>
          </p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:${emailColors.inkMuted}">${escapeHtml(copy.fallback)}</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;word-break:break-all"><a href="${href}" style="color:${emailColors.ink}">${href}</a></p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${emailColors.inkMuted}">${escapeHtml(copy.ignore)}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [greeting, copy.body, `${copy.button}: ${url}`, copy.ignore, "Synergy QMP"].join("\n\n");

  return { subject: copy.subject, html, text }
}
