"use client";

import {
  detectVisitorCountryCode,
  getPlanCategoriesForCountry,
  getPublicPlanCategoryKey,
  type PlanCategory,
  type PlanCategoryOption,
} from "@/lib/planMarket";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [planCategories, setPlanCategories] = useState<PlanCategoryOption[]>(
    [],
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    detectVisitorCountryCode().then((countryCode) => {
      if (isMounted) {
        setPlanCategories(getPlanCategoriesForCountry(countryCode));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);

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
    setIsMobileMenuOpen(false);
    const publicCategory = getPublicPlanCategoryKey(category);
    const target = `/?planCategory=${publicCategory}#plans`;

    if (pathname !== "/") {
      router.push(target);
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("planCategory", publicCategory);
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
        <nav aria-label="Primary navigation">
          <div className="logo">
            <Link
              href="/"
              aria-label="AltuHealth home"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <img src="/images/main/Darkversion.svg" alt="AltuHealth" />
            </Link>
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-controls="primary-navigation-links"
            aria-expanded={isMobileMenuOpen}
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span className="mobile-menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div
            id="primary-navigation-links"
            className={`nav-links${isMobileMenuOpen ? " mobile-open" : ""}`}
          >
            <button
              type="button"
              className="nav-section-link"
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              type="button"
              className="nav-section-link"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
            <Link
              href="/healthcare-providers"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Healthcare Providers
            </Link>
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
            <Link href="/diaspora" onClick={() => setIsMobileMenuOpen(false)}>
              Diaspora
            </Link>
            <button
              type="button"
              className="nav-section-link"
              onClick={() => scrollToSection("services")}
            >
              Services
            </button>
            <Link
              href="/partnership-program"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Partners
            </Link>
            <button
              type="button"
              className="nav-section-link"
              onClick={() => scrollToSection("team")}
            >
              Management
            </button>
            <Link href="/faqs" onClick={() => setIsMobileMenuOpen(false)}>
              FAQs
            </Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </Link>
            <button
              type="button"
              className="nav-btn mobile-nav-cta"
              onClick={() => scrollToSection("plans")}
            >
              Get Covered
            </button>
          </div>

          <button
            type="button"
            className="nav-btn desktop-nav-cta"
            onClick={() => scrollToSection("plans")}
          >
            Get Covered
          </button>
        </nav>
      </div>
    </header>
  );
}
