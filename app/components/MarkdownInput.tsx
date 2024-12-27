'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const { TextArea } = Input;

interface MarkdownInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function MarkdownInput({
  value = '',
  onChange,
  placeholder = '请输入问题...',
  required = false,
}: MarkdownInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="space-y-2">
      <TextArea
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoSize={{ minRows: 3, maxRows: 6 }}
        onFocus={() => setShowPreview(true)}
      />
      {showPreview && inputValue && (
        <div className="p-4 border rounded bg-gray-50">
          <div className="text-sm text-gray-500 mb-2">预览：</div>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            className="prose max-w-none"
          >
            {inputValue}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
