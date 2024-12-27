'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Upload, Input, message, Card, Select } from 'antd';
import { FileTextOutlined, SendOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile, UploadFileStatus } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';
import { submissionAPI } from '../services/api';
import LatexEditor from '../components/LatexEditor';

const { TextArea } = Input;
const { Dragger } = Upload;

const subjects = [
  { value: 'math', label: '数学' },
  { value: 'physics', label: '物理' },
  { value: 'chemistry', label: '化学' },
  { value: 'biology', label: '生物' },
  { value: 'english', label: '英语' },
  { value: 'chinese', label: '语文' },
];

interface Citations {
  BIBTEX?: string;
  APA?: string;
  MLA?: string;
  CHICAGO?: string;
  HARVARD?: string;
}

interface UploadResponse {
  code: string;
  message: string;
  data: {
    citations?: Citations;
  };
}

export default function QAPage() {
  const router = useRouter();
  const [isFileMode, setIsFileMode] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);

  const handleFileUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onProgress, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as RcFile);

    try {
      const response = await submissionAPI.uploadFile(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.({ percent });
      });

      const uploadResponse = response.data as UploadResponse;
      
      if (uploadResponse.code === 'ok') {
        message.success('文件上传成功');
        
        const fileResponse: UploadFile = {
          name: (file as RcFile).name,
          status: 'done' as UploadFileStatus,
          uid: (file as RcFile).uid,
          url: '#',
          type: (file as RcFile).type,
          size: (file as RcFile).size,
          response: uploadResponse
        };

        onSuccess?.(fileResponse);
        return fileResponse;
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('上传失败');
      onError?.(error as Error);
      return {
        name: (file as RcFile).name,
        status: 'error' as UploadFileStatus,
        uid: (file as RcFile).uid,
        error: '上传失败',
        type: (file as RcFile).type,
        size: (file as RcFile).size
      } as UploadFile;
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    if (!subject) {
      message.warning('请选择学科');
      return;
    }

    if (!content.trim() && !isFileMode) {
      message.warning('请输入问题内容');
      return;
    }

    if (isFileMode && fileList.length === 0) {
      message.warning('请上传文件');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      
      if (content.trim()) {
        formData.append('content', content);
      }

      if (fileList.length > 0) {
        formData.append('files', JSON.stringify(fileList.map(file => ({
          name: file.name,
          uid: file.uid
        }))));
      }

      const response = await submissionAPI.createSubmission(formData);
      
      if (response.data?.id) {
        message.success('提交成功');
        setContent('');
        setFileList([]);
        setUploadFiles([]);
        router.push(`/qa/detail/${response.data.id}`);
      } else {
        throw new Error('提交失败：未获取到问题ID');
      }
    } catch (error) {
      console.error('Failed to submit question:', error);
      message.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback(({ fileList }: { fileList: UploadFile[] }) => {
    const newFileList = fileList.map(file => {
      const { response, ...rest } = file;
      if (response && response.data?.citations) {
        return {
          ...rest,
          status: 'done' as UploadFileStatus,
          response: {
            code: response.code,
            message: response.message,
            data: {}
          }
        } as UploadFile;
      }
      return file;
    });
    setFileList(newFileList);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card title="提出问题" className="shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择学科
            </label>
            <Select
              className="w-full"
              placeholder="请选择学科"
              options={subjects}
              value={subject}
              onChange={setSubject}
            />
          </div>

          <div className="flex justify-start space-x-4">
            <Button
              type={!isFileMode ? 'primary' : 'default'}
              icon={<SendOutlined />}
              onClick={() => setIsFileMode(false)}
            >
              输入问题
            </Button>
            <Button
              type={isFileMode ? 'primary' : 'default'}
              icon={<FileTextOutlined />}
              onClick={() => setIsFileMode(true)}
            >
              上传文件
            </Button>
          </div>

          {isFileMode ? (
            <Dragger
              multiple
              fileList={fileList}
              onChange={handleChange}
              customRequest={handleFileUpload}
              className="bg-white"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-blue-500 text-3xl" />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">
                支持单个或批量上传，严禁上传违规文件
              </p>
            </Dragger>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                问题内容
              </label>
              {subject === 'math' ? (
                <LatexEditor
                  value={content}
                  onChange={setContent}
                  height="300px"
                />
              ) : (
                <TextArea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入问题内容..."
                  style={{ height: 300 }}
                />
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              提交问题
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
