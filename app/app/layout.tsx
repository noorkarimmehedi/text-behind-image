'use client';

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