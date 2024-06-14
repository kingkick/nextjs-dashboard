import SideNav from '@/app/ui/dashboard/sidenav';
// import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Invoices | Acme Dashboard',
// };
// 可以使用 metadata 对象中的 title.template 字段来为页面标题定义模板。此模板可以包含页面标题以及其他您想包含的信息。
// Next.js 的 Metadata API 功能强大且灵活，使您可以完全掌控应用程序的元数据。可以添加多个字段，包括 keywords、robots、canonical 等。
// export const metadata: Metadata = {
//   title: {
//     template: '%s | Acme Dashboard',
//     default: 'Acme Dashboard',
//   },
//   description: 'The official Next.js Learn Dashboard built with App Router.',
//   metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
// };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
