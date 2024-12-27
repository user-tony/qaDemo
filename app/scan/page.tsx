'use client';

import React, { useState } from 'react';
import { Input, Select, Button, Table, Tag, message, Modal, Space, Typography, Spin, Empty, List, Tabs, TabsProps } from 'antd';
import { scholarAPI, Paper, CitationFormats } from '../services/api';
import { 
  SearchOutlined, 
  LinkOutlined,
  ReloadOutlined,
  CopyOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const DEFAULT_PAGE_SIZE = 10;

// 引用格式选项
const CITATION_STYLES = [
  { label: 'BIBTEX', value: 'bibtex' },
  { label: 'APA', value: 'apa' },
  { label: 'MLA', value: 'mla' },
  { label: 'Chicago', value: 'chicago' },
  { label: 'Harvard', value: 'harvard' }
];

export default function ScanPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = React.useState({
    query: '',
    time_range: '',
    type: '',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [loading, setLoading] = React.useState(false);
  const [papers, setPapers] = React.useState<{
    total: number;
    data: Paper[];
  }>({
    total: 0,
    data: [],
  });
  const [selectedPaper, setSelectedPaper] = React.useState<Paper | null>(null);
  const [citationStyle, setCitationStyle] = React.useState(CITATION_STYLES[0].value);
  const [citations, setCitations] = React.useState<CitationFormats | null>(null);
  const [loadingCitation, setLoadingCitation] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
      render: (text: string, record: Paper) => (
        <div className="group">
          <Button 
            type="link" 
            onClick={() => {
              console.log('Selected paper:', record);
              showPaperDetail(record);
            }}
            style={{ 
              textAlign: 'left', 
              padding: 0,
              height: 'auto',
              whiteSpace: 'normal',
              display: 'block'
            }}
            className="group-hover:text-blue-600 transition-colors"
          >
            {text}
          </Button>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'authors',
      key: 'authors',
      width: '20%',
      render: (authors: string[]) => {
        const displayCount = 3;
        const displayAuthors = authors.slice(0, displayCount);
        const remainingCount = authors.length - displayCount;
        
        return (
          <div className="space-y-1">
            {displayAuthors.map((author, index) => (
              <Tag key={index}>{author}</Tag>
            ))}
            {remainingCount > 0 && (
              <Tag className="bg-gray-100">+{remainingCount}</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      sorter: (a: Paper, b: Paper) => a.year - b.year,
    },
    {
      title: '发表期刊/会议',
      dataIndex: 'venue',
      key: 'venue',
      width: '20%',
      render: (text: string) => (
        <div className="line-clamp-2 text-sm text-gray-600">
          {text}
        </div>
      ),
    },
    {
      title: '引用',
      dataIndex: 'citation_count',
      key: 'citation_count',
      width: 80,
      sorter: (a: Paper, b: Paper) => a.citation_count - b.citation_count,
      render: (count: number) => (
        <div className="text-center">
          {count > 0 ? <Tag color="blue">{count}</Tag> : count}
        </div>
      ),
    },
    {
      title: '研究领域',
      dataIndex: 'fields_of_study',
      key: 'fields_of_study',
      width: '15%',
      render: (fields: string[]) => (
        <div className="space-y-1">
          {fields.map((field, index) => (
            <Tag key={index} color="green">{field}</Tag>
          ))}
        </div>
      ),
    },
  ];

  // 搜索处理函数
  const handleSearch = async () => {
    if (!searchParams.query.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    
    setLoading(true);
    try {
      const response = await scholarAPI.searchPapers({
        ...searchParams,
        page: 1 // 搜索时重置到第一页
      });
      setPapers({
        total: response.data.total,
        data: response.data.papers,
      });
      setSearchParams(prev => ({ ...prev, page: 1 }));
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 分页处理函数
  const handlePageChange = async (page: number, pageSize?: number) => {
    setLoading(true);
    try {
      const response = await scholarAPI.searchPapers({
        ...searchParams,
        page,
        pageSize: pageSize || searchParams.pageSize
      });
      setPapers({
        total: response.data.total,
        data: response.data.papers,
      });
      setSearchParams(prev => ({
        ...prev,
        page,
        pageSize: pageSize || prev.pageSize,
      }));
    } catch (error) {
      console.error('加载失败:', error);
      message.error('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有引用格式
  const fetchAllCitations = async (paperId: string) => {
    console.log('Fetching all citations for paper ID:', paperId);
    setLoadingCitation(true);
    try {
      const data = await scholarAPI.getAllCitations(paperId);
      console.log('Received citations:', data.citations);
      if (data) {
        setCitations(data.citations);
      }
    } catch (error) {
      console.error('获取引用格式失败:', error);
      message.error('获取引用格式失败');
      setCitations(null);
    } finally {
      setLoadingCitation(false);
    }
  };

  // 获取单个引用格式
  const fetchCitation = async (paperId: string, style: string): Promise<string | null> => {
    try {
      const citation = await scholarAPI.getCitation(paperId, style);
      return citation;
    } catch (error) {
      console.error('获取引用格式失败:', error);
      message.error('获取引用格式失败');
      return null;
    }
  };

  // 复制引用内容
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      message.error('复制失败');
    }
  };

  // Modal显示函数
  const showPaperDetail = async (paper: Paper) => {
    console.log('Showing paper detail:', paper);
    setSelectedPaper(paper);
    setIsModalOpen(true);
    
    // 只在首次加载时获取引用格式
    if (paper.id && !citations) {
      await fetchAllCitations(paper.id);
    }
  };

  // Modal中的刷新按钮点击事件
  const handleRefreshCitations = async () => {
    if (selectedPaper?.id) {
      await fetchAllCitations(selectedPaper.id);
    }
  };

  // 跳转到问题列表页面
  const goToQuestions = (submissionId: number) => {
    router.push(`/qa?id=${submissionId}`);
  };

  const citationItems: TabsProps['items'] = citations ? Object.entries(citations).map(([format, citation]) => ({
    key: format,
    label: format,
    children: (
      <div className="relative">
        <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
          {citation}
        </pre>
        <Button
          type="text"
          icon={<CopyOutlined />}
          className="absolute top-2 right-2"
          onClick={() => copyToClipboard(citation)}
        />
      </div>
    ),
  })) : [];

  return (
    <div className="space-y-6 p-6">
      {/* 搜索区域 */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input.Search
          placeholder="输入关键词搜索文献"
          value={searchParams.query}
          onChange={e => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton
        />
        <Select
          placeholder="时间范围"
          value={searchParams.time_range}
          onChange={value => setSearchParams(prev => ({ ...prev, time_range: value }))}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="1">近一年</Option>
          <Option value="3">近三年</Option>
          <Option value="5">近五年</Option>
        </Select>
        <Select
          placeholder="文献类型"
          value={searchParams.type}
          onChange={value => setSearchParams(prev => ({ ...prev, type: value }))}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="journal">期刊论文</Option>
          <Option value="conference">会议论文</Option>
        </Select>
      </div>

      {/* 文献列表 */}
      <Table
        columns={columns}
        dataSource={papers.data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.pageSize,
          total: papers.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条结果`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 1200 }}
        className="paper-table"
      />

      {/* 文献详情弹窗 */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span>论文详情</span>
            <Button
              type="link"
              href={selectedPaper?.url}
              target="_blank"
              icon={<LinkOutlined />}
            >
              查看原文
            </Button>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPaper(null);
          setCitations(null); // 关闭时清空引用数据
        }}
        footer={null}
        width={800}
      >
        {selectedPaper && (
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <Text type="secondary">标题</Text>
              <Paragraph strong className="text-lg mt-1">
                {selectedPaper.title}
              </Paragraph>
            </div>

            {/* 作者 */}
            <div>
              <Text type="secondary">作者</Text>
              <div className="mt-1">
                {selectedPaper.authors?.map((author, index) => (
                  <Tag key={index} className="mr-2 mb-2">
                    {author}
                  </Tag>
                ))}
              </div>
            </div>

            {/* 摘要 */}
            <div>
              <Text type="secondary">摘要</Text>
              <Paragraph className="mt-1" ellipsis={{ rows: 3, expandable: true }}>
                {selectedPaper.abstract}
              </Paragraph>
            </div>

            {/* 引用格式部分 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text type="secondary">引用格式</Text>
                <Space>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleRefreshCitations}
                    loading={loadingCitation}
                  >
                    刷新
                  </Button>
                </Space>
              </div>

              <div className="bg-gray-50 p-4 rounded space-y-4">
                {loadingCitation ? (
                  <div className="flex justify-center py-4">
                    <Spin />
                  </div>
                ) : citations ? (
                  <Tabs 
                    defaultActiveKey="BIBTEX"
                    items={citationItems}
                  />
                ) : (
                  <Empty description="暂无引用格式数据" />
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
