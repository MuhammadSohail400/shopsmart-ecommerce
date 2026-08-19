import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export const metadata = {
  title: 'Admin Console | ShopSmart',
  description: 'ShopSmart administrative back-office, catalog management, and operations center.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden lg:block h-full">
          <AdminSidebar />
        </div>

        {/* Main Content Area (Right) */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <AdminHeader />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/15">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
