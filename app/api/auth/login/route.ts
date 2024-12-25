import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('Login request:', { email });

    const apiUrl = `${process.env.API_BASE_URL}/v1/paper/user/auth/login`;
    console.log('Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        type: 'email'
      }),
      cache: 'no-store'
    });

    const data = await response.json();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (!response.ok) {
      console.error('API Error:', data);
      return NextResponse.json(
        { 
          success: false,
          message: data.message || '登录失败',
          error: data 
        },
        { status: response.status }
      );
    }

    // 确保返回正确的数据结构
    const responseData = {
      success: true,
      token: data.token || data.data?.token,
      user: data.user || data.data?.user
    };

    console.log('Returning response:', responseData);
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: '服务器错误',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
