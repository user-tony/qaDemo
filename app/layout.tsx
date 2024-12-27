'use client';

import './globals.css';
import './styles/latex.css';
import 'katex/dist/katex.min.css';
import { Inter } from 'next/font/google';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, History, MessageSquare, LogOut, User, Settings } from 'lucide-react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { MenuProps } from 'antd';
import { cn } from '@/lib/utils';

const { Header, Content } = Layout;
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // 处理登出逻辑
    console.log('用户登出');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-2 py-1">
          <div className="font-medium">Tony</div>
          <div className="text-sm text-gray-500">tony@example.com</div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: '设置',
      onClick: () => router.push('/settings'),
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <title>QA Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <AntdRegistry>
          <Layout className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <Header className="border-b border-white/10 bg-transparent backdrop-blur-md">
              <div className="flex items-center h-full max-w-7xl mx-auto px-4">
                {/* Logo 区域 */}
                <div 
                  className="flex items-center gap-3 mr-12 cursor-pointer group"
                  onClick={() => router.push('/')}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                    AI 智能问答系统
                  </span>
                </div>

                {/* 导航菜单 */}
                <nav className="flex-1 flex items-center space-x-1">
                  {[
                    { key: 'qa', icon: MessageSquare, label: 'QA 问答', path: '/qa' },
                    { key: 'scan', icon: Bot, label: 'semantic scholar', path: '/scan' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => router.push(item.path)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        pathname.startsWith(item.path)
                          ? "bg-white/10 text-white shadow-lg shadow-white/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>

                {/* 用户信息 */}
                <div className="pl-4 border-l border-white/10">
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                    overlayClassName="w-56"
                  >
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="hidden md:block">
                        <div className="text-white font-medium">Tony</div>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              </div>
            </Header>
            <Content>
              <div className="max-w-7xl mx-auto p-4">
                {children}
              </div>
            </Content>
          </Layout>
        </AntdRegistry>
      </body>
    </html>
  );
}
