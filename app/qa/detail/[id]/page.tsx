'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Spin, message } from 'antd';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface Question {
  id: string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
  answer?: string;
}

export default function QuestionDetail() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);

  const renderLatex = (content: string) => {
    try {
      return katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch (err) {
      console.error('LaTeX rendering error:', err);
      return content;
    }
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${params.id}`);
        if (!response.ok) {
          throw new Error('获取问题详情失败');
        }
        const data = await response.json();
        setQuestion(data);
      } catch (error) {
        message.error('获取问题详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchQuestion();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <div className="text-center text-gray-500">问题不存在</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card 
        title="问题详情" 
        extra={
          <span className={`px-2 py-1 rounded text-sm ${
            question.status === 'pending' ? 'bg-blue-100 text-blue-600' : 
            question.status === 'processing' ? 'bg-yellow-100 text-yellow-600' : 
            'bg-green-100 text-green-600'
          }`}
        >
          {question.status === 'pending' ? '待处理' : 
           question.status === 'processing' ? '处理中' : 
           '已完成'}
        </span>
      }
      >
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-2">提交时间</div>
            <div>{new Date(question.createdAt).toLocaleString()}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">问题内容</div>
            <div className="border rounded-lg p-4 bg-gray-50">
              {question.subject === 'math' ? (
                <div 
                  className="latex-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: renderLatex(question.content)
                  }} 
                />
              ) : (
                <div className="whitespace-pre-wrap">{question.content}</div>
              )}
            </div>
          </div>

          {question.answer && (
            <div>
              <div className="text-sm text-gray-500 mb-2">答案</div>
              <div className="border rounded-lg p-4 bg-gray-50">
                {question.subject === 'math' ? (
                  <div 
                    className="latex-preview"
                    dangerouslySetInnerHTML={{ 
                      __html: renderLatex(question.answer)
                    }} 
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{question.answer}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
