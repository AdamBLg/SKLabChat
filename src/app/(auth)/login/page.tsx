import { Suspense } from "react";
import { LoginPanel } from "./login-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81,transparent_35%),#070711] px-4 py-10">
      <Suspense>
        <LoginPanel />
      </Suspense>
    </main>
  );
}
