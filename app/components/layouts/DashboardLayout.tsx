import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: '/qa',
      icon: <QuestionCircleOutlined />,
      label: '问答',
      onClick: () => router.push('/qa'),
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: '帮助',
      onClick: () => router.push('/help'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/60 backdrop-blur-lg border-b border-gray-100/50 z-50">
        <div className="max-w-7xl mx-auto h-full px-6">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                QaDemo
              </span>
            </div>

            {/* 导航菜单 */}
            <div className="flex-1 flex justify-center">
              <Menu
                mode="horizontal"
                selectedKeys={[pathname]}
                className="border-none !bg-transparent min-w-[400px] justify-center"
                style={{
                  background: 'transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                {menuItems.map(item => (
                  <Menu.Item
                    key={item.key}
                    icon={item.icon}
                    onClick={item.onClick}
                    className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-700 hover:text-white transition-all duration-300 rounded-md px-3 py-1"
                  >
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center">
              <Dropdown 
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="flex items-center cursor-pointer hover:bg-gray-100 rounded-full px-3 py-1.5 transition-all duration-300">
                  <Avatar 
                    icon={<UserOutlined />}
                    className="bg-gradient-to-r from-blue-500 to-blue-700"
                  />
                  <span className="ml-2 text-gray-700">用户名</span>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
