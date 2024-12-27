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
  searchPapers: async (params: {
    query: string;
    time_range?: string;
    type?: string;
  }) => {
    try {
      // 过滤掉空值字段
      const filteredParams = removeEmptyFields(params);
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
};
