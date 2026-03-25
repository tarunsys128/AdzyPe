import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAFCFF]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
