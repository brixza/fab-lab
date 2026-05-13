import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, profileUrl, name } = await req.json()

  if (!email || !profileUrl) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // TODO: wire up Resend once account is created
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'Fab-lab <hello@fab-lab.nu>',
  //   to: email,
  //   subject: `${name} shared their fragrance profile with you`,
  //   html: `...`
  // })

  console.log(`[share] Would send profile link to ${email}: ${profileUrl}`)

  return NextResponse.json({ ok: true })
}
