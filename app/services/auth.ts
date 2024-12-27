import Cookies from 'js-cookie';

const authAPI = {
  async login(username: string, password: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/paper/user/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password, type: 'email' }),
      });

      const data = await response.json();
      if (data?.token) {
        Cookies.set('token', data.token, { path: '/' });
        return { success: true, data };
      }
      throw new Error('登录失败：未获取到 token');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async logout() {
    try {
      // 调用后端登出 API
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/paper/user/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // 清除所有客户端存储的认证信息
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error };
    }
  },

  getToken() {
    return Cookies.get('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authAPI;
