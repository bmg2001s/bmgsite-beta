import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()
  return <>{children}</>
}
