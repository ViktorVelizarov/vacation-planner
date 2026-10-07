// The confirmation email: the sign-in pages' world in email form. A pale-grey ground, one white card with a hairline
// edge, navy ink, a royal-blue button with 8px corners. System fonts, because web fonts do not survive email clients;
// inline styles and tables, because that is what mail clients render. No images, so nothing to block or to host.
// Colours are the --vp-* tokens in assets/css/landing.css.

const INK = '#0f1a36'
const INK_2 = '#47526f'
const INK_3 = '#5e6987'
const LINE = '#e1e6f1'
const PAPER = '#f3f5f9'
const BLUE = '#3558e6'
const BLUE_DEEP = '#2742b8'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

/**
 * The email a new account receives, as { subject, html, text }.
 *   name   the name they signed up with (only the first word is used)
 *   link   the confirmation address, already built
 *   hours  how long the link works, for the sentence that says so
 */
export function confirmationEmail({ name, link, hours }) {
  const first = String(name ?? '').trim().split(/\s+/)[0] || 'there'
  const lifetime = `The link works once and expires in ${hours} hours.`
  const subject = 'Confirm your email for Vacation Planner'
  const url = escapeHtml(link)

  const text = [
    'Confirm your email',
    '',
    `Hi ${first}, open this link to confirm your email address and go to the trip form:`,
    '',
    link,
    '',
    lifetime,
    '',
    "You're getting this because someone used this address to create a Vacation Planner account. If that wasn't you, ignore this email: nothing happens unless the link is opened.",
    '',
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${PAPER};">Press the button to confirm your email and open the trip form. ${escapeHtml(lifetime)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAPER}" style="background:${PAPER};">
<tr><td align="center" style="padding:32px 16px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
<tr><td style="padding:0 4px 20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="17" height="22" bgcolor="${BLUE}" style="width:17px;height:22px;background:${BLUE};border-radius:999px 999px 0 0;font-size:0;line-height:0;">&nbsp;</td>
<td style="padding-left:10px;font-family:${FONT};font-size:20px;line-height:22px;font-weight:700;letter-spacing:-0.02em;color:${INK};">Vacation Planner</td>
</tr></table>
</td></tr>
<tr><td bgcolor="#ffffff" style="background:#ffffff;border:1px solid ${LINE};border-radius:14px;padding:32px;">
<h1 style="margin:0 0 14px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.02em;color:${INK};">Confirm your email</h1>
<p style="margin:0 0 26px;font-family:${FONT};font-size:16px;line-height:1.6;color:${INK_2};">Hi ${escapeHtml(first)}, press the button to confirm this address and open the trip form.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${BLUE}" style="background:${BLUE};border-radius:8px;mso-padding-alt:14px 28px;"><a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:16px;line-height:1.2;font-weight:600;color:#ffffff;text-decoration:none;">Confirm email</a></td>
</tr></table>
<p style="margin:20px 0 0;font-family:${FONT};font-size:14px;line-height:1.5;color:${INK_3};">${escapeHtml(lifetime)}</p>
<div style="margin:28px 0 20px;height:1px;line-height:1px;font-size:1px;background:${LINE};">&nbsp;</div>
<p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${INK_3};">Button not working? Paste this address into your browser:</p>
<p style="margin:6px 0 0;font-family:${FONT};font-size:13px;line-height:1.5;word-break:break-all;"><a href="${url}" style="color:${BLUE_DEEP};text-decoration:underline;">${url}</a></p>
</td></tr>
<tr><td style="padding:20px 4px 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${INK_2};">You're getting this because someone used this address to create a Vacation Planner account. If that wasn't you, ignore this email: nothing happens unless the button is pressed.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`

  return { subject, html, text }
}
