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
            <Link href="/diaspora">Diaspora</Link>
            <a onClick={() => scrollToSection("services")}>Services</a>
            <Link href="/partnership-program">Partners</Link>
            <a onClick={() => scrollToSection("team")}>Management</a>
            <Link href="/faqs">FAQs</Link>
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
