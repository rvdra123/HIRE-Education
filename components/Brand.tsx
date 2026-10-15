import Link from "next/link";
import Image from "next/image";
export default function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={`brand brand-actual ${footer ? "brand-footer" : ""}`}
      href="/#home"
      aria-label="HIRE Education home"
      prefetch={false}
    >
      <Image
        src="/brand/hire-education.png"
        alt="HIRE Education"
        width="144"
        height="72"
        priority={!footer}
      />
    </Link>
  );
}
