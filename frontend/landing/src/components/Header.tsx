"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type PlanCategory = "general" | "retail" | "diaspora" | "geriatric" | "corporate";

const planCategories: { key: PlanCategory; label: string }[] = [
  { key: "general", label: "General" },
  { key: "retail", label: "Retail" },
  { key: "diaspora", label: "Diaspora" },
  { key: "geriatric", label: "Geriatric" },
  { key: "corporate", label: "Corporate" },
];

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

  const goToPlanCategory = (category: PlanCategory) => {
    const target = `/?planCategory=${category}#plans`;

    if (pathname !== "/") {
      router.push(target);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("planCategory", category);
    url.hash = "plans";
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(
      new CustomEvent("altu:plan-category", { detail: { category } }),
    );
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
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
            <div className="nav-plan-menu">
              <button type="button" onClick={() => scrollToSection("plans")}>
                Plans
              </button>
              <div className="nav-plan-dropdown">
                {planCategories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => goToPlanCategory(category.key)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <a onClick={() => scrollToSection("services")}>Services</a>
            <Link href="/partnership-program">Partners</Link>
            <a onClick={() => scrollToSection("team")}>Management</a>
            <Link href="/contact">Contact</Link>
          </div>

          <button className="nav-btn" onClick={() => scrollToSection("plans")}>
            Get Covered
          </button>
        </nav>
      </div>
    </header>
  );
}
