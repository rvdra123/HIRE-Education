"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container feature-page">
      <div className="page-heading">
        <h1>This page is temporarily unavailable</h1>
        <p>
          Please try again shortly. You can still return to the career guides.
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link className="btn btn-outline" href="/#resume">
          Open the resume guide
        </Link>
      </div>
    </main>
  );
}
