"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 使用 try-catch 来处理可能的错误
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // 发生错误时默认导航到登录页面
      router.push('/login');
    }
  }, [router]);

  // 返回一个加载状态的UI而不是 null
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">正在加载...</h1>
        <p className="text-gray-600">请稍候，正在为您跳转...</p>
      </div>
    </div>
  );
}
