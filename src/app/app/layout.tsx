import { AppNav } from "@/components/nav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e81,transparent_30%),#070711]">
      <AppNav />
      {children}
    </div>
  );
}
