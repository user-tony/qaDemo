import { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  RobotOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
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
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: 'qa',
      icon: <RobotOutlined />,
      label: '智能问答',
      onClick: () => router.push('/qa'),
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: '使用帮助',
      onClick: () => router.push('/help'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-b from-gray-50/30 to-white/80">
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/60 backdrop-blur-lg border-b border-gray-100/50 z-50">
        <div className="max-w-7xl mx-auto h-full px-6">
          <div className="flex items-center justify-between h-full">
          

            {/* 导航菜单 */}
            <div className="flex-1 flex justify-center">
              <Menu
                mode="horizontal"
                selectedKeys={[pathname === '/dashboard' ? 'dashboard' : pathname === '/qa' ? 'qa' : 'help']}
                items={menuItems}
                className="border-none !bg-transparent min-w-[400px] justify-center"
                style={{
                  background: 'transparent',
                  transition: 'all 0.3s ease',
                }}
                itemRender={(item, dom) => (
                  <div className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-700 hover:text-white transition-all duration-300 rounded-md px-3 py-1">
                    {dom}
                  </div>
                )}
              />
            </div>

            {/* 用户信息 */}
            <div className="flex items-center">
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <Button 
                  type="text"
                  className="flex items-center gap-2 px-3 h-10 rounded-full hover:bg-gray-50/80 border border-gray-100 transform hover:scale-105 transition-transform duration-300"
                >
                  <Avatar 
                    size="small"
                    icon={<UserOutlined />} 
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  />
                  <span className="text-gray-700">用户中心</span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      <Content className="mt-20 p-6">
        {children}
      </Content>
    </Layout>
  );
}
