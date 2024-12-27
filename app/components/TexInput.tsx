'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import dynamic from 'next/dynamic';

const { TextArea } = Input;

// 动态导入 KaTeX 组件
const Latex = dynamic(() => import('react-latex-next'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

interface TexInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function TexInput({
  value = '',
  onChange,
  placeholder = '请输入问题...',
  required = false,
}: TexInputProps) {
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
          <Latex>{inputValue}</Latex>
        </div>
      )}
    </div>
  );
}
