"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Upload, Input, message, Spin } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { 
  Bot, 
  Send,
  MessageSquare,
  FileText,
  Clock,
  History,
  CheckCircle,
  Loader2,
  X,
  LogOut,
  Settings,
  ChevronDown,
  User,
  Home,
  Upload as UploadIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { submissionAPI, authAPI } from '../services/api';
import Cookies from 'js-cookie';

const menuItems = [
  {
    key: 'home',
    icon: Home,
    label: '首页',
    path: '/home'
  },
  {
    key: 'qa',
    icon: Bot,
    label: 'AI 问答',
    path: '/qa'
  },
  {
    key: 'history',
    icon: History,
    label: '历史记录',
    path: '/history'
  }
];

export default function QAPage() {
  const router = useRouter();
  const [isFileMode, setIsFileMode] = useState(false);
  const [question, setQuestion] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchSubmissions();
    }
  }, [page]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionAPI.getSubmissions(page, pageSize);
      console.log('Submissions:', response?.data);
      setSubmissions(response?.data || []);
      const total = response?.data?.total || 0;
      setPagination(prev => ({
        ...prev,
        total,
        current: page
      }));
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      message.error('获取提交记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!question && fileList.length === 0) {
      message.warning('请输入问题或上传文件');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      if (question.trim()) {
        formData.append('content', question);
      }

      if (fileList.length > 0) {
        fileList.forEach(file => {
          formData.append('attachment_ids', uploadFiles.join(','));
        });
      }

      await submissionAPI.createSubmission(formData);
      
      message.success('提交成功');
      setQuestion('');
      setFileList([]);
      fetchSubmissions(); // 刷新提交记录
    } catch (error) {
      console.error('Failed to submit question:', error);
      message.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
    setPage(page);
  };

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  const handleFileUpload = async (options) => {
    const { file, onProgress } = options;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await submissionAPI.uploadFile(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({ percent });
      });

      message.success('文件上传成功');
      console.log('Uploaded file:', response.data.attachment.id);
      uploadFiles.push(response.data.attachment.id);
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('上传失败');
    }
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      completed: {
        color: 'success',
        icon: <CheckCircle />,
        text: '已完成'
      },
      processing: {
        color: 'processing',
        icon: <Loader2 spin />,
        text: '处理中'
      },
      default: {
        color: 'default',
        icon: <Clock />,
        text: '等待处理'
      }
    };

    const config = statusConfig[status] || statusConfig.default;
    return (
      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium">
        {config.icon}
        <span className={config.color}>{config.text}</span>
      </div>
    );
  };

  const userMenuItems = [
    {
      key: 'settings',
      icon: Settings,
      label: '个人设置'
    },
    {
      key: 'logout',
      icon: LogOut,
      label: '退出登录',
      danger: true
    }
  ];

  const handleMenuClick = (e) => {
    if (menuItems.find(item => item.key === e.key)?.path) {
      router.push(menuItems.find(item => item.key === e.key).path);
    }
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'settings') {
      router.push('/settings');
    }
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        
        const file = item.getAsFile();
        if (!file) continue;

        // 创建一个新的 File 对象，添加后缀名
        const blob = file.slice(0, file.size, file.type);
        const newFile = new File([blob], `pasted-image-${Date.now()}.${file.type.split('/')[1]}`, {
          type: file.type,
        });

        const uploadFile: UploadFile = {
          uid: `-${Date.now()}`,
          name: newFile.name,
          status: 'uploading',
          originFileObj: newFile,
        };

        setFileList((prev) => [...prev, uploadFile]);

        try {
          const formData = new FormData();
          formData.append('file', newFile);
          
          const response = await submissionAPI.uploadFile(formData);
          
          setFileList((prev) =>
            prev.map((item) =>
              item.uid === uploadFile.uid
                ? {
                    ...item,
                    status: 'done',
                    url: response.data.url,
                  }
                : item
            )
          );

          message.success('图片上传成功');
          console.log('Uploaded file:', response.data.attachment.id);
          setUploadFiles((prev) => [...prev, response.data.attachment.id]);
        } catch (error) {
          console.error('Error uploading pasted image:', error);
          message.error('图片上传失败');
          
          setFileList((prev) =>
            prev.map((item) =>
              item.uid === uploadFile.uid
                ? {
                    ...item,
                    status: 'error',
                    error: '上传失败',
                  }
                : item
            )
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">AI 智能问答系统</span>
            </div>
          </div>

          <div className="mx-8 flex-1">
            <nav className="flex items-center space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick({ key: item.key })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    router.pathname === item.path
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {React.createElement(item.icon, { className: "h-4 w-4" })}
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Tony</span>
                <span className="text-xs text-gray-500">tony@example.com</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="flex gap-6">
          {/* 左侧提问区域 */}
          <div className="flex-1 max-w-3xl space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 原有的提问区域内容 */}
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">提出问题</h2>
                    <p className="text-sm text-gray-500 mt-0.5">选择输入问题或上传文件进行提问</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* 切换按钮组 */}
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                    <button
                      onClick={() => setIsFileMode(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                        !isFileMode
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      输入问题
                    </button>
                    <button
                      onClick={() => setIsFileMode(true)}
                      className={cn(
                        "flex-1 flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                        isFileMode
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      上传文件
                    </button>
                  </div>

                  {/* 内容区域 */}
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="relative min-h-[280px]">
                      <div className={cn(
                        "absolute inset-0 w-full transition-all duration-300 ease-in-out",
                        !isFileMode ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
                      )}>
                        <div className="p-4">
                          <Input.TextArea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="请输入您的问题..."
                            className="min-h-[180px] text-base border-0 bg-transparent hover:border-0 focus:ring-0 resize-none"
                            rows={6}
                          />
                        </div>
                      </div>

                      <div className={cn(
                        "absolute inset-0 w-full transition-all duration-300 ease-in-out",
                        isFileMode ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
                      )}>
                        <div className="p-4">
                          <Upload.Dragger
                            fileList={fileList}
                            onChange={handleChange}
                            customRequest={handleFileUpload}
                            className={cn(
                              "border-2 border-dashed transition-colors",
                              fileList.length > 0 
                                ? "border-blue-100 bg-blue-50/30 hover:border-blue-200" 
                                : "border-gray-200 bg-gray-50/50 hover:border-blue-500"
                            )}
                          >
                            {fileList.length === 0 ? (
                              <div className="py-8 px-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <UploadIcon className="h-7 w-7 text-white" />
                                </div>
                                <div className="text-center mt-4">
                                  <p className="text-base font-medium text-gray-900">
                                    点击或拖拽文件到此处上传
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    支持 PDF、Word、TXT 等文档格式
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                      <FileText className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">已上传文件</h4>
                                      <p className="text-xs text-gray-500 mt-0.5">点击或拖拽添加更多文件</p>
                                    </div>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                    {fileList.length} 个文件
                                  </span>
                                </div>
                                
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {fileList.map((file, index) => (
                                    <div
                                      key={index}
                                      className="group flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full text-sm border border-gray-200 shadow-sm hover:border-red-200 hover:bg-red-50/50 transition-colors"
                                    >
                                      <FileText className="h-3.5 w-3.5 text-gray-500 group-hover:text-red-500" />
                                      <span className="text-gray-700 group-hover:text-red-600 max-w-[180px] truncate">
                                        {file.name}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newFileList = fileList.filter((_, i) => i !== index);
                                          setFileList(newFileList);
                                        }}
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Upload.Dragger>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/80 border-t border-gray-100">
                      <div className="mb-3 text-xs text-gray-500 text-center">
                        支持拖拽文件或粘贴图片上传
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || (!question && fileList.length === 0)}
                        className={cn(
                          "w-full h-11 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2",
                          loading 
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                            : (!question && fileList.length === 0)
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>正在处理...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>提交问题</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 作业问题区域 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">作业问题</h2>
                      <p className="text-sm text-gray-500">查看历史提交记录</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">总记录：{submissions.length}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {submissions.map((item, index) => (
                    <div
                      key={index}
                      className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">#{item.id}</span>
                          </div>
                          <div className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            item.status === 'completed' 
                              ? "bg-green-50 text-green-600" 
                              : "bg-blue-50 text-blue-600"
                          )}>
                            {item.status === 'completed' ? '已完成' : '处理中'}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">{item.content || '无内容'}</p>
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.attachments.map((file: any, fileIndex: number) => (
                              <div
                                key={fileIndex}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs border border-gray-200"
                              >
                                <FileText className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-600">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {submissions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-1">暂无提交记录</h3>
                      <p className="text-sm text-gray-500">提交问题后，记录将显示在这里</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧历史记录 */}
          <div className="w-80 shrink-0 space-y-4">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <History className="h-4 w-4 text-blue-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">最近提交记录</h3>
                    </div>
                    <span className="text-xs text-gray-500">{submissions.length} 条记录</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {submissions.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {item.id}
                          </p>
                          <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {item.content || '无内容'}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{new Date(item.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "shrink-0 ml-3 px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1",
                          item.status === 'completed' 
                            ? "bg-green-50 text-green-600" 
                            : "bg-blue-50 text-blue-600"
                        )}>
                          {item.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>已完成</span>
                            </>
                          ) : (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>处理中</span>
                            </>
                          )}
                        </div>
                      </div>

                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.attachments.map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-xs text-gray-600 border border-gray-100"
                            >
                              <FileText className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="truncate max-w-[120px]">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {submissions.length === 0 && (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <History className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">暂无提交记录</p>
                      <p className="text-xs text-gray-500 mt-1">您的提交记录将显示在这里</p>
                    </div>
                  )}
                </div>

                {submissions.length > 5 && (
                  <div className="p-3 border-t border-gray-100">
                    <button
                      onClick={() => router.push('/history')}
                      className="w-full px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center space-x-1"
                    >
                      <span>查看更多记录</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
