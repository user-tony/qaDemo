"use client";

import { useState } from 'react';
import { Typography, Form, Input, Button, message, Card, Avatar, Upload } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title } = Typography;

export default function SettingsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // TODO: 实现更新用户信息的 API
      messageApi.success('更新成功');
    } catch (error) {
      console.error('更新失败:', error);
      messageApi.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
      }
      return isImage;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success('头像上传成功');
      } else if (info.file.status === 'error') {
        message.error('头像上传失败');
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {contextHolder}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg rounded-lg">
          <Title level={2} className="text-center mb-8">个人设置</Title>
          
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <Upload {...uploadProps}>
                <div className="relative group">
                  <Avatar 
                    size={100} 
                    icon={<UserOutlined />}
                    className="bg-blue-500 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadOutlined className="text-white text-xl" />
                  </div>
                </div>
              </Upload>
              <div className="mt-2 text-gray-500">点击更换头像</div>
            </div>
          </div>

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              nickname: 'Tony',
              email: 'tony@example.com'
            }}
          >
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入昵称"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="请输入邮箱"
              />
            </Form.Item>

            <Form.Item
              name="oldPassword"
              label="当前密码"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入当前密码"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入新密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请再次输入新密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none"
              >
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
