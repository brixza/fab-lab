import { cookies } from 'next/headers'

export async function isStaffAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('staff_auth')?.value === process.env.STAFF_SECRET
}
