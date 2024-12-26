"use client";

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/api';
import { UserOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await authAPI.login(values.username, values.password);
      if (result?.data?.token) {
        messageApi.success('登录成功');
        // 等待消息显示后再跳转
        setTimeout(() => {
          router.push('/qa');
        }, 1000);
      } else {
        throw new Error('登录失败');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      messageApi.error(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      {contextHolder}
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <RobotOutlined className="text-4xl text-white animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Demo 系统</h2>
          <p className="text-gray-200">欢迎回来，请登录您的账号</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="mt-8 space-y-6"
          initialValues={{
            username: 'tony@quanchengvip.cn',
            password: '123123'
          }}
        >
          <div className="space-y-4 rounded-md -space-y-px">
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入用户名"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                size="large"
                autoComplete="username"
                type="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-150 hover:scale-105"
              size="large"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        <div className="flex items-center justify-center mt-6">
          <div className="text-sm">
            <span className="text-gray-200">
              AI 智能问答系统 | Powered by Codeium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
