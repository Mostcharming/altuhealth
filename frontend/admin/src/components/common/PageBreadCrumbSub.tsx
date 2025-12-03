import Link from "next/link";
import React from "react";

interface BreadcrumbSubProps {
  parentTitle: string;
  parentHref: string;
  currentTitle: string;
}

const PageBreadcrumbSub: React.FC<BreadcrumbSubProps> = ({
  parentTitle,
  parentHref,
  currentTitle,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {/* Selected: {currentTitle} */}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href="/overview"
            >
              Home
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href={parentHref}
            >
              {parentTitle}
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li className="text-sm text-gray-800 dark:text-white/90">
            {currentTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumbSub;
