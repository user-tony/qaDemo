import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// 请求拦截器添加 token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// 工具函数：过滤掉对象中的空值
const removeEmptyFields = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    })
  );
};

// 文献接口类型
export interface Paper {
  id: string;
  title: string;
  abstract?: string;
  authors: string[];
  year: number;
  citation_count: number;
  venue: string;
  url?: string;
  fields_of_study: string[];
}

// API响应接口
export interface PaperResponse {
  code: string;
  message: string;
  data: {
    total: number;
    papers: Paper[];
  };
}

// 引用格式接口
export interface CitationFormats {
  BIBTEX: string;
  APA: string;
  MLA: string;
  CHICAGO: string;
  HARVARD: string;
}

export interface CitationResponse {
  code: string;
  message: string;
  data: {
    BIBTEX: string;
    APA: string;
    MLA: string;
    CHICAGO: string;
    HARVARD: string;
  };
}

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/v1/paper/user/auth/login', { email: username, password });
    if (response.data?.data?.token) {
      Cookies.set('token', response.data.data.token);
      return response.data;
    }
    throw new Error('登录失败：未获取到 token');
  },
  logout: () => {
    Cookies.remove('token');
  }
};

export const submissionAPI = {
  // 获取提交列表
  getSubmissions: async (page: number, pageSize: number) => {
    const response = await api.get('/v2/paper/quiz/submissions', {
      params: { page, per_page: pageSize }
    });
    return response.data;
  },

  // 获取提交记录
  getSubmissionRecord: (params: {
    submission_id?: number;
    category_id?: number;
    page: number;
    per_page: number;
  }) => {
    return api.get('/v2/paper/quiz/questions', { params });
  },

  // 创建提交
  createSubmission: async (formData: FormData) => {
    const response = await api.post('/v2/paper/quiz/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 上传文件
  uploadFile: async (formData: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    const response = await api.post('/v1/paper/user/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }
};

export const scholarAPI = {
  // 搜索论文
  searchPapers: async (params: {
    query: string;
    time_range?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaperResponse> => {
    try {
      const filteredParams = removeEmptyFields({
        ...params,
        page: params.page,
        per_page: params.pageSize
      });
      
      console.log('发送搜索请求，参数:', filteredParams);
      const response = await api.get('/v2/paper/semantic_scholar', { 
        params: filteredParams 
      });
      console.log('搜索响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('Scholar search error:', error);
      throw error;
    }
  },

  // 获取所有引用格式
  getAllCitations: async (paperId: string): Promise<CitationFormats> => {
    try {
      console.log('Fetching citations for paper:', paperId);
      const response = await api.get(`/v2/paper/semantic_scholar/${paperId}/citations`);
      
      // 检查响应数据的格式
      if (response.data?.code === 'ok' && response.data?.data) {
        return response.data.data;
      } else {
        console.error('Invalid citation response format:', response.data);
        throw new Error('Invalid citation response format');
      }
    } catch (error) {
      console.error('获取引用格式失败:', error);
      throw error;
    }
  },

  // 获取指定格式的引用
  getCitation: async (paperId: string, style: string): Promise<string> => {
    try {
      console.log('Fetching citation for paper:', paperId, 'style:', style);
      const response = await api.get(`/v2/paper/semantic_scholar/${paperId}/citation`, {
        params: { style }
      });
      console.log('Citation response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取引用格式失败:', error);
      throw error;
    }
  },

  // 获取提交状态
  getSubmissionStatus: async (submissionId: number): Promise<SubmissionStatus> => {
    try {
      const response = await api.get(`/v2/paper/quiz/submission/${submissionId}/status`);
      return response.data.data;
    } catch (error) {
      console.error('获取提交状态失败:', error);
      throw error;
    }
  },

  // 获取问题列表
  getQuestions: async (submissionId: number, page: number = 1, perPage: number = 10): Promise<QuestionListResponse> => {
    try {
      const response = await api.get('/v2/paper/quiz/questions', {
        params: {
          submission_id: submissionId,
          page,
          per_page: perPage
        }
      });
      return response.data;
    } catch (error) {
      console.error('获取问题列表失败:', error);
      throw error;
    }
  }
};

// 问题接口类型定义
export interface Question {
  id: number;
  submission_id: number;
  content: string;
  status: number;
  difficulty_level: number;
  category_id: number | null;
  labels: string[] | null;
  ai_times: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionListResponse {
  code: string;
  message: string;
  data: Question[];
  total: number;
}

export interface SubmissionStatus {
  id: number;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
}
