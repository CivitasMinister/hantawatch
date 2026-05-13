import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promethean Epidemio — Surveillance épidémiologique scientifique',
  description: 'Surveillance épidémiologique du cluster MV Hondius (hantavirus Andes) par The Promethean Institute. Agrégation des sources officielles WHO, CDC, ECDC en temps réel avec analyse scientifique rigoureuse.',
  keywords: ['épidémiologie', 'hantavirus', 'surveillance', 'santé publique', 'ANDV', 'MV Hondius'],
  authors: [{ name: 'The Promethean Institute' }],
  creator: 'The Promethean Institute',
  publisher: 'The Promethean Institute',
  robots: 'index, follow',
  openGraph: {
    title: 'Promethean Epidemio',
    description: 'Surveillance épidémiologique scientifique en temps réel',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Promethean Epidemio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Promethean Epidemio',
    description: 'Surveillance épidémiologique scientifique'
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e3a5f'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
