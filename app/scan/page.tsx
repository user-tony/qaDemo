'use client';

import React from 'react';
import { Input, Select, Button, Table, Tag, message } from 'antd';
import { scholarAPI } from '../services/api';

const { Option } = Select;

export default function ScanPage() {
  const [searchParams, setSearchParams] = React.useState({
    query: '',
    time_range: '',
    type: '',
  });

  const [loading, setLoading] = React.useState(false);
  const [papers, setPapers] = React.useState<any>({
    total: 0,
    data: [],
  });

  const handleSearch = async () => {
    if (!searchParams.query) {
      message.warning('请输入搜索关键词');
      return;
    }

    try {
      setLoading(true);
      const response = await scholarAPI.searchPapers(searchParams);
      console.log('搜索结果:', response); // 调试用
      setPapers({
        total: response.data.total || 0,
        data: response.data.data || [],
      });
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
            {text}
          </div>
          {record.abstract && (
            <div className="mt-2 text-sm text-gray-600 line-clamp-2">
              {record.abstract}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {record.authors?.map((author: any, index: number) => (
              <Tag key={index} className="bg-gray-100">
                {author.name}
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '发表时间',
      dataIndex: 'year',
      key: 'year',
      width: 100,
      render: (year: number) => (
        <Tag color="blue">{year}</Tag>
      ),
    },
    {
      title: '期刊/会议',
      dataIndex: 'venue',
      key: 'venue',
      width: 200,
      render: (venue: string) => venue && (
        <div className="text-sm text-gray-600">{venue}</div>
      ),
    },
    {
      title: '引用次数',
      dataIndex: 'citationCount',
      key: 'citationCount',
      width: 100,
      render: (count: number) => count > 0 && (
        <Tag color="green">{count} 次引用</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-start">
        <Input
          className="flex-1"
          placeholder="输入搜索关键词"
          value={searchParams.query}
          onChange={e => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          onPressEnter={handleSearch}
        />
        <Select
          style={{ width: 120 }}
          placeholder="时间范围"
          value={searchParams.time_range}
          onChange={value => setSearchParams(prev => ({ ...prev, time_range: value }))}
        >
          <Option value="">不限</Option>
          <Option value="1">近一年</Option>
          <Option value="3">近三年</Option>
          <Option value="5">近五年</Option>
        </Select>
        <Select
          style={{ width: 120 }}
          placeholder="文献类型"
          value={searchParams.type}
          onChange={value => setSearchParams(prev => ({ ...prev, type: value }))}
        >
          <Option value="">不限</Option>
          <Option value="杂志文章">杂志文章</Option>
          <Option value="会议论文">会议论文</Option>
          <Option value="预印本">预印本</Option>
        </Select>
        <Button 
          type="primary"
          onClick={handleSearch}
          loading={loading}
          className="min-w-[80px]"
        >
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={papers.data}
        rowKey="paperId"
        loading={loading}
        pagination={{
          total: papers.total,
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条结果`,
        }}
      />
    </div>
  );
}
