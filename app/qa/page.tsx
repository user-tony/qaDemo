"use client";

import { useState, useEffect } from 'react';
import { Typography, Upload, Input, Button, message, Card, Progress } from 'antd';
import { UploadOutlined, SendOutlined, RobotOutlined, LogoutOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function QAPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [question, setQuestion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [token, setToken] = useState('');
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleUploadChange = ({ fileList }) => setFileList(fileList);
  const handleQuestionChange = (e) => setQuestion(e.target.value);

  const handleSubmit = async () => {
    if (fileList.length === 0 && !question.trim()) {
      messageApi.warning('请上传文件或输入内容');
      return;
    }

    try {
      // 先上传文件
  

      // 提交表单
      const formData = new FormData();
      
      // 添加问题内容
      if (question.trim()) {
        formData.append('content', question);
      }

      // 添加文件路径
      if (uploadedFiles.length > 0) {
        formData.append('attachment_ids', JSON.stringify(uploadedFiles.map(fileId => fileId).join(',')));
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v2/paper/quiz/submissions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `${token}`,
          },
        }
      );

      console.log('Submission successful:', response.data);
      messageApi.success('提交成功');
      
      // 清空表单
      setQuestion('');
      setFileList([]);
    } catch (error) {
      console.error('Error submitting form:', error);
      messageApi.error('提交失败');
    }
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file.originFileObj);
    });

    setUploading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/paper/user/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log('File upload successful:', response.data);
      messageApi.success('文件上传成功');
      console.log('000000000000000000000000000000000000000000000');
      console.log(response.data?.data?.attachment?.id);
      console.log('000000000000000000000000000000000000000000000');
      uploadedFiles.push(response.data?.data?.attachment?.id);
    } catch (error) {
      console.error('Error uploading file:', error);
      messageApi.error('上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout>
      {contextHolder}
      <div className="flex justify-end mb-4">
        <Button icon={<LogoutOutlined />} onClick={handleLogout} className="bg-red-500 text-white rounded-md hover:bg-red-600 transition">
          退出
        </Button>
      </div>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="shadow-lg p-8 bg-white rounded-lg transition-transform transform hover:scale-105">
          <Title level={1} className="text-center mb-6 text-4xl font-bold text-blue-700">
            智能问答系统
          </Title>
          <Text className="text-center block mb-8 text-lg text-gray-600">
            上传文档并提出问题，AI 将为您提供准确答案
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mb-10">
              <Title level={4} className="mb-3 text-xl font-medium text-gray-700">文档上传</Title>
              <Upload 
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                className="w-full border border-dashed rounded-lg py-6 hover:border-blue-500 transition"
              >
                <Button icon={<UploadOutlined />} className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-md hover:from-purple-500 hover:to-purple-700 transition">
                  选择文件
                </Button>
              </Upload>
              {uploading && <Progress percent={uploadProgress} className="mt-2" />}
              <Button onClick={handleFileUpload} disabled={fileList.length === 0 || uploading} className="mt-4 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-md hover:from-purple-500 hover:to-purple-700 transition">
                {uploading ? '上传中...' : '开始上传'}
              </Button>
              <Text type="secondary" className="block mt-2 text-sm text-gray-500">
                支持 PDF、Word、TXT 等格式文件
              </Text>
            </div>

            <div className="mb-10">
              <Title level={4} className="mb-3 text-xl font-medium text-gray-700">提问区域</Title>
              <TextArea 
                rows={4} 
                value={question}
                onChange={handleQuestionChange}
                placeholder="请输入您的问题..."
                className="resize-none border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
          </div>

          <div className="text-center">
            <Button 
              type="primary" 
              size="large"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-8 py-3 rounded-md hover:from-purple-500 hover:to-purple-700 transition"
            >
              提交问题
            </Button>
          </div>
        </Card>

        <div className="mt-12">
          <Title level={4} className="mb-3 text-xl font-medium text-gray-700">AI 回答</Title>
          <Text type="secondary" className="text-sm text-gray-500">AI 回答将显示在这里</Text>
        </div>
      </div>
    </DashboardLayout>
  );
}
