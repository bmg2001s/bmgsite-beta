import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BMG Clan — Elite PUBG Squad',
  description: 'Official website of BMG Clan — Elite PUBG gaming squad. Join us, submit your PUBG ID and compete at the highest level.',
  keywords: ['BMG Clan', 'PUBG', 'gaming clan', 'esports', 'PUBG squad'],
  openGraph: {
    title: 'BMG Clan — Elite PUBG Squad',
    description: 'Join the elite. Submit your PUBG ID and battle with the best.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
