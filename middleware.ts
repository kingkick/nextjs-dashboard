import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// 在这里，你正在使用 authConfig 对象初始化 NextAuth.js，并导出 auth 属性。你还使用 Middleware 的 matcher 选项指定它应该在特定路径上运行。
// 使用中间件执行此任务的优势在于，受保护的路由在中间件验证身份之前甚至不会开始渲染，从而增强了应用程序的安全性和性能。
export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
