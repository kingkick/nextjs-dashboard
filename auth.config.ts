import type { NextAuthConfig } from 'next-auth';

// 通过将 signIn: '/login' 添加到我们的 pages 选项中，用户将被重定向到我们的自定义登录页面，而不是 NextAuth.js 默认页面。
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // authorized 回调用于验证通过 Next.js 中间件访问页面的请求是否被授权。
    // 它在请求完成之前调用，并接收一个包含 auth 和 request 属性的对象。auth 属性包含用户的会话，request 属性包含传入的请求。
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  // providers 选项是一个数组，其中列出了不同的登录选项。目前，它是一个空数组，以满足 NextAuth 配置。
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
