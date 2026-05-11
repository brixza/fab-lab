import { Suspense } from 'react'
import RegisterForm from './RegisterForm'

export const dynamic = 'force-dynamic'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  return (
    <Suspense>
      <RegisterForm searchParams={searchParams} />
    </Suspense>
  )
}
