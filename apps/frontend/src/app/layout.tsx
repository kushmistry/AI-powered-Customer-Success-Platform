import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from '@e2m/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Customer Success Platform | AI-Powered Insights',
  description: 'Enterprise AI-powered Customer Success Platform with real-time analytics and meeting intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full antialiased text-slate-900`}>
        <AntdRegistry hashPriority="high">
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#4f46e5',
                borderRadius: 10,
                fontFamily: 'inherit',
              },
            }}
          >
            <ReduxProvider>{children}</ReduxProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

