import type { Metadata } from 'next';
import ClientLayout from './layout';

export const metadata: Metadata = {
  title: 'AI Demo 演示系统',
  description: '基于 Next.js 和 Ant Design 的 AI 演示系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
