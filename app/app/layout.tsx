'use client';

import { redirect } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useSessionContext } from '@supabase/auth-helpers-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" data-page="dashboard">
      {children}
    </div>
  );
} 