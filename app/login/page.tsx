"use client";

import { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
  error?: any;
}

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        cache: 'no-store'
      });

      const data: LoginResponse = await response.json();
      console.log('Login response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || '登录失败');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        document.cookie = `isLoggedIn=true; path=/`;
        message.success('登录成功');
        router.push('/dashboard');
        router.refresh();
      } else {
        throw new Error('登录响应缺少 token');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-background" />
      <div className="login-container">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <RobotOutlined className="text-4xl gradient-text floating" />
            <Title level={2} className="!mb-0 !text-[28px] gradient-text">
              AI Demo 演示系统 
            </Title>
          </div>
          <Text className="text-gray-500 text-base">
            
          </Text>
        </div>

        <Card className="login-card" bordered={false}>
          <Form<LoginForm>
            name="login"
            onFinish={onFinish}
            size="large"
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入邮箱"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}
