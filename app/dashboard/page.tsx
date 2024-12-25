"use client";

import { useRouter } from 'next/navigation';
import { Typography, Card, Skeleton } from 'antd';
import { 
  RobotOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';

const { Title } = Typography;

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const features: FeatureCard[] = [
    {
      icon: <RobotOutlined className="text-4xl" />,
      title: "智能问答",
      description: "基于AI的智能问答系统，快速获取文档相关信息",
      path: "/qa",
    },
    {
      icon: <FileTextOutlined className="text-4xl" />,
      title: "文档管理",
      description: "上传和管理您的文档资料，支持多种格式",
      path: "/qa",
    },
    {
      icon: <QuestionCircleOutlined className="text-4xl" />,
      title: "使用帮助",
      description: "查看系统使用指南和常见问题解答",
      path: "/help",
    },
  ];

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-transparent to-gray-50/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 欢迎区域 */}
          <div className="text-center mb-12">
            <Title level={1} className="gradient-text !mb-4 !text-4xl">
              欢迎使用 AI Demo
            </Title>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              智能文档问答系统，让信息检索更简单、更高效
            </p>
          </div>

          {/* 功能卡片区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
                onClick={() => handleCardClick(feature.path)}
              >
                {loading ? (
                  <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300">
                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                  </Card>
                ) : (
                  <Card 
                    className="h-full bg-white/90 backdrop-blur-sm hover:shadow-lg 
                             transition-all duration-300 border-gray-100"
                  >
                    <div className="flex flex-col items-center text-center gap-4 py-6">
                      <div className="gradient-text transform group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 gradient-text">
                          {feature.title}
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>

          {/* 底部提示 */}
          <div className="mt-12 text-center text-gray-400 text-sm">
            <p>选择上方功能卡片开始使用系统</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
