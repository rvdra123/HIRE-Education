import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <div className="page-heading">
          <h1>This page is unavailable</h1>
          <p>
            The opportunity may have closed or may need another verification
            check.
          </p>
          <Link
            className="btn btn-primary"
            href="/opportunities"
            prefetch={false}
          >
            Browse current opportunities
          </Link>
        </div>
      </main>
    </>
  );
}
