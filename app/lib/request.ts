import Cookies from 'js-cookie';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials,
  };

  try {
    const response = await fetch(url, config);
    
    // 如果返回 401，清除 token 并重定向到登录页
    if (response.status === 401) {
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
