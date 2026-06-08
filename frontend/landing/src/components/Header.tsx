"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header>
      <div className="container">
        <nav>
          <div className="logo">
            <Link href="/" aria-label="AltuHealth home">
              <img src="/images/main/Darkversion.svg" alt="AltuHealth" />
            </Link>
          </div>

          <div className="nav-links">
            <a onClick={() => scrollToSection("home")}>Home</a>
            <a onClick={() => scrollToSection("about")}>About</a>
            <Link href="/healthcare-providers">Healthcare Providers</Link>
            <a onClick={() => scrollToSection("plans")}>Plans</a>
            <a onClick={() => scrollToSection("services")}>Services</a>
            <a onClick={() => scrollToSection("team")}>Management</a>
            <a onClick={() => scrollToSection("contact")}>Contact</a>
          </div>

          <button className="nav-btn" onClick={() => scrollToSection("plans")}>
            Get Covered
          </button>
        </nav>
      </div>
    </header>
  );
}
