import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Toaster } from '@/components/admin-ui/sonner';
import { ADMIN_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!(await verifyAdminSessionToken(token))) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-root min-h-screen flex bg-white w-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
