import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, profileUrl, name } = await req.json()

  if (!email || !profileUrl || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const firstName = name.split(' ')[0]

  const { error } = await resend.emails.send({
    from: 'Fab-lab <onboarding@resend.dev>',
    to: email,
    subject: `${firstName} shared their fragrance profile with you`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#26526F;">
                fab-lab
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#26526F;padding:32px 28px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.45);">
                fragrance profile
              </p>
              <p style="margin:0 0 24px;font-size:22px;color:#ffffff;font-weight:normal;">
                ${firstName} shared their profile with you
              </p>
              <p style="margin:0 0 28px;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.7;">
                View their fragrance profile and wishlist — great for gift inspiration.
              </p>
              <a href="${profileUrl}"
                style="display:inline-block;padding:14px 28px;background:#f7f5f2;color:#26526F;
                text-decoration:none;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;">
                View Profile &amp; Wishlist
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#6b6b6b;line-height:1.6;">
                Fab-lab is an independent perfume boutique in Stockholm.<br/>
                <a href="https://fab-lab.nu" style="color:#26526F;">fab-lab.nu</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  })

  if (error) {
    console.error('[share] Resend error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
