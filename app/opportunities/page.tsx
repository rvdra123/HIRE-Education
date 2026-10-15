import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Catalogue from "@/components/opportunities/Catalogue";
import EventsCalendar from "@/components/opportunities/EventsCalendar";
export const metadata: Metadata = {
  title: "Student Opportunities in Brampton, Ontario | HIRE Education",
  description:
    "Browse verified jobs, volunteering, internships and youth programs for high school students in Brampton and nearby communities.",
};
export default function OpportunitiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="container feature-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" prefetch={false}>
            Home
          </Link>
          <span>/</span>
          <span>Student opportunities</span>
        </nav>
        <div className="page-heading">
          <h1>Student opportunities in Brampton</h1>
          <p>
            Find work, volunteering, internships, and programs that fit your
            interests and school schedule.
          </p>
          <p className="refresh-note">
            Opportunities and events are scheduled for checks every six hours.
            The dates on each listing show the last successful checks.
          </p>
        </div>
        <Catalogue />
        <section id="events" className="events-section">
          <div className="page-heading">
            <h2>Brampton youth events calendar</h2>
            <p>
              Browse verified workshops, hiring events, library programs, and
              career sessions.
            </p>
          </div>
          <EventsCalendar />
        </section>
      </main>
    </>
  );
}
