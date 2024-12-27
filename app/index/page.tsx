'use client';

import { useState } from 'react';
import { Input, Button } from 'antd';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function IndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/scan?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-4 space-y-8">
        {/* Logo 区域 */}
        <div className="flex justify-center mb-8">
          <div className="relative w-72 h-24">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        {/* 搜索框区域 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full flex space-x-2">
            <Input
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入关键词搜索论文..."
              className="flex-1 shadow-sm"
            />
            <Button 
              type="primary"
              size="large"
              onClick={handleSearch}
              className="shadow-sm"
            >
              搜索
            </Button>
          </div>
        </div>

        {/* 快捷搜索区域 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'AI 教育', query: 'AI education' },
            { title: '深度学习', query: 'deep learning' },
            { title: '机器学习', query: 'machine learning' },
            { title: '教育科技', query: 'education technology' },
          ].map((item) => (
            <Button
              key={item.title}
              onClick={() => {
                setSearchQuery(item.query);
                router.push(`/scan?query=${encodeURIComponent(item.query)}`);
              }}
              className="text-gray-600 hover:text-blue-600"
            >
              {item.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
