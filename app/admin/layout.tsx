import { unstable_noStore as noStore } from 'next/cache'

// Force all admin pages to be dynamic (never statically generated)
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()
  return <>{children}</>
}
