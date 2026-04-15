import { Outlet } from 'react-router';
import { Navbar } from '@/layouts/navbar';

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
