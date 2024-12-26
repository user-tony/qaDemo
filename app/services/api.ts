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
