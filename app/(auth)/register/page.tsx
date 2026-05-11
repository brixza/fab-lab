import { Suspense } from 'react'
import RegisterForm from './RegisterForm'

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
