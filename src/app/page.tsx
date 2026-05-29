import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const { code, next } = await searchParams;

  // Some OAuth setups redirect back to the Site URL (root) with the auth code
  // instead of /auth/callback. Forward it to the callback handler so the
  // session can be exchanged.
  if (code) {
    const params = new URLSearchParams({ code });
    if (next) params.set("next", next);
    redirect(`/auth/callback?${params.toString()}`);
  }

  redirect("/app/chat");
}
