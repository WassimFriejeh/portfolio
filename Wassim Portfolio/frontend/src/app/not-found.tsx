import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="page-pad">
        <div className="content-width py-24 text-center">
          <h1 className="section-title">Page not found</h1>
          <p className="section-sub">That route does not exist or the project is not published.</p>
          <p className="mt-8">
            <Link href="/" className="btn btn-primary">
              Back home
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
