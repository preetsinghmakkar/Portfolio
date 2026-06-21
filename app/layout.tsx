import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-var',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Preet Singh — Blockchain Protocol Engineer',
    template: '%s | Preet Singh',
  },
  description:
    'Blockchain Protocol Engineer specializing in Cosmos SDK, Go, validator infrastructure, Kubernetes, Terraform, Kafka, and cross-chain IBC protocols.',
  keywords: [
    'Blockchain Engineer',
    'Cosmos SDK',
    'Go Developer',
    'Validator Infrastructure',
    'Kubernetes',
    'Terraform',
    'Kafka',
    'IBC Protocol',
    'DeFi',
    'Distributed Systems',
  ],
  authors: [{ name: 'Preet Singh' }],
  creator: 'Preet Singh',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Preet Singh — Blockchain Protocol Engineer',
    description:
      'Architecting secure, scalable distributed systems. Cosmos SDK, validators, IBC, Kubernetes.',
    siteName: 'Preet Singh Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preet Singh — Blockchain Protocol Engineer',
    description:
      'Architecting secure, scalable distributed systems. Cosmos SDK, validators, IBC, Blockchain Engineer.',
    creator: '@preetsingh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: '/favicon.ico?v=2', type: 'image/x-icon' }],
    shortcut: [{ url: '/favicon.ico?v=2', type: 'image/x-icon' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
