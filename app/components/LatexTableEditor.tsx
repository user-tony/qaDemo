'use client';

import React, { useState } from 'react';
import { Table, Input, Button, Space, Card } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

interface LatexTableEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

interface TableData {
  key: string;
  [key: string]: string;
}

export default function LatexTableEditor({
  value = '',
  onChange,
}: LatexTableEditorProps) {
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [data, setData] = useState<TableData[]>(() => {
    const initialData: TableData[] = [];
    for (let i = 0; i < rows; i++) {
      const row: TableData = { key: i.toString() };
      for (let j = 0; j < cols; j++) {
        row[`col${j}`] = '';
      }
      initialData.push(row);
    }
    return initialData;
  });

  const generateLatexTable = () => {
    let latex = '\\begin{tabular}{';
    // 添加列对齐
    for (let i = 0; i < cols; i++) {
      latex += 'c';
      if (i < cols - 1) latex += '|';
    }
    latex += '}\n';

    // 添加表格内容
    data.forEach((row, rowIndex) => {
      const rowContent = Array.from({ length: cols }, (_, colIndex) => 
        row[`col${colIndex}`] || ''
      ).join(' & ');
      latex += rowContent;
      latex += ' \\\\';
      if (rowIndex < rows - 1) latex += '\n\\hline\n';
    });

    latex += '\n\\end{tabular}';
    onChange?.(latex);
  };

  const columns = Array.from({ length: cols }, (_, index) => ({
    title: `列 ${index + 1}`,
    dataIndex: `col${index}`,
    key: `col${index}`,
    render: (text: string, record: TableData, rowIndex: number) => (
      <Input
        value={text}
        onChange={(e) => {
          const newData = [...data];
          newData[rowIndex][`col${index}`] = e.target.value;
          setData(newData);
        }}
      />
    ),
  }));

  const addRow = () => {
    const newRow: TableData = { key: rows.toString() };
    for (let j = 0; j < cols; j++) {
      newRow[`col${j}`] = '';
    }
    setData([...data, newRow]);
    setRows(rows + 1);
  };

  const removeRow = () => {
    if (rows > 1) {
      setData(data.slice(0, -1));
      setRows(rows - 1);
    }
  };

  const addColumn = () => {
    const newData = data.map(row => ({
      ...row,
      [`col${cols}`]: '',
    }));
    setData(newData);
    setCols(cols + 1);
  };

  const removeColumn = () => {
    if (cols > 1) {
      const newData = data.map(row => {
        const newRow = { ...row };
        delete newRow[`col${cols - 1}`];
        return newRow;
      });
      setData(newData);
      setCols(cols - 1);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="表格编辑器" extra={
        <Space>
          <Button onClick={addRow} icon={<PlusOutlined />}>添加行</Button>
          <Button onClick={removeRow} icon={<MinusOutlined />} disabled={rows <= 1}>删除行</Button>
          <Button onClick={addColumn} icon={<PlusOutlined />}>添加列</Button>
          <Button onClick={removeColumn} icon={<MinusOutlined />} disabled={cols <= 1}>删除列</Button>
          <Button type="primary" onClick={generateLatexTable}>生成 LaTeX</Button>
        </Space>
      }>
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          bordered
        />
      </Card>
      {value && (
        <Card title="LaTeX 代码">
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            <code>{value}</code>
          </pre>
        </Card>
      )}
    </div>
  );
}
