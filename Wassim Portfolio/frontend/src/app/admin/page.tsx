import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="page-pad flex min-h-dvh items-center justify-center py-16">
      <div className="content-width max-w-lg glass p-8">
        <h1 className="m-0 text-head font-bold tracking-tight">Admin CMS disabled</h1>
        <p className="mt-4 m-0 text-[var(--muted)] leading-relaxed">
          This portfolio is frontend-only for Vercel. Edit projects in{" "}
          <code className="text-[var(--ink)]">frontend/src/data/projects.json</code> and profile in{" "}
          <code className="text-[var(--ink)]">frontend/src/data/profile.json</code>, then redeploy.
        </p>
        <Link href="/" className="btn btn-primary mt-8 inline-flex no-underline">
          Back to site
        </Link>
      </div>
    </main>
  );
}
