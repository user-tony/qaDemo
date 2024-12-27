'use client';

import React, { useState } from 'react';
import { Card, Input, message } from 'antd';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const { TextArea } = Input;

interface LatexEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
}

const LatexEditor: React.FC<LatexEditorProps> = ({
  value = '',
  onChange,
  height = '200px',
}) => {
  const [error, setError] = useState<string | null>(null);

  const renderLatex = (latex: string) => {
    if (!latex) return '';
    
    try {
      // 移除文档类和包声明
      const cleanedLatex = latex
        .replace(/\\documentclass[^}]*\{[^}]*\}/g, '')
        .replace(/\\usepackage[^}]*\{[^}]*\}/g, '')
        .trim();

      // 如果清理后的内容为空，则显示原始内容
      if (!cleanedLatex) {
        return `<pre class="latex-source">${latex}</pre>`;
      }

      const macros = {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\ZZ": "\\mathbb{Z}",
        "\\CC": "\\mathbb{C}",
        "\\QQ": "\\mathbb{Q}",
      };

      return katex.renderToString(cleanedLatex, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
        macros
      });
    } catch (err) {
      console.error('LaTeX rendering error:', err);
      setError(err instanceof Error ? err.message : '渲染错误');
      // 如果渲染失败，显示原始内容
      return `<pre class="latex-source">${latex}</pre>`;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full" bodyStyle={{ padding: '12px' }}>
        <TextArea
          value={value}
          onChange={(e) => {
            setError(null);
            onChange?.(e.target.value);
          }}
          style={{ 
            height,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          placeholder="输入 LaTeX 代码..."
        />
      </Card>
      <Card 
        title="预览" 
        className="w-full preview-card"
        bodyStyle={{ 
          padding: '16px',
          minHeight: '100px',
          backgroundColor: '#ffffff',
        }}
        extra={error ? (
          <span className="text-red-500 text-sm bg-red-50 px-2 py-1 rounded">
            {error}
          </span>
        ) : null}
      >
        <div 
          className="prose max-w-none latex-preview"
          dangerouslySetInnerHTML={{ __html: renderLatex(value) }}
        />
      </Card>
    </div>
  );
};

export default LatexEditor;
