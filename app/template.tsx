'use client';

import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, History, MessageSquare, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuProps } from 'antd';
import Cookies from 'js-cookie';

const { Header, Content } = Layout;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    window.location.href = '/login';
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人资料',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: '设置',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {pathname !== '/login' && (
        <Layout.Header className="border-b border-white/10 bg-transparent backdrop-blur-md">
          <div className="flex items-center h-full max-w-7xl mx-auto px-4">
            {/* Logo 区域 */}
            <div 
              className="text-xl font-bold text-white cursor-pointer mr-8"
              onClick={() => router.push('/dashboard')}
            >
              AI 助手
            </div>

            {/* 导航菜单 */}
            <Menu
              mode="horizontal"
              theme="dark"
              className="flex-1 bg-transparent border-none"
              selectedKeys={[pathname]}
              items={[
                {
                  key: '/qa',
                  icon: <MessageSquare size={16} />,
                  label: '问答',
                  onClick: () => router.push('/qa'),
                },
                {
                  key: '/scan',
                  icon: <Bot size={16} />,
                  label: '文献扫描',
                  onClick: () => router.push('/scan'),
                },
                {
                  key: '/history',
                  icon: <History size={16} />,
                  label: '历史记录',
                  onClick: () => router.push('/history'),
                },
              ]}
            />

            {/* 用户菜单 */}
            <div className="ml-4">
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Avatar
                  className={cn(
                    'cursor-pointer',
                    'bg-gradient-to-r from-blue-500 to-purple-500'
                  )}
                  icon={<User size={20} />}
                />
              </Dropdown>
            </div>
          </div>
        </Layout.Header>
      )}
      <Layout.Content>
        <div className="max-w-7xl mx-auto p-4">
          {children}
        </div>
      </Layout.Content>
    </Layout>
  );
}
