"use client";
import { useSidebar } from "@/context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  PlugInIcon,
  TaskIcon,
} from "@/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  // Clinical Management
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Overview", path: "/overview" }],
  },
  {
    name: "Patient Management",
    icon: <GroupIcon />,
    subItems: [{ name: "Search Enrollee/Dependents", path: "/enrollees" }],
  },
  {
    name: "Appointments & Authorizations",
    icon: <TaskIcon />,
    subItems: [
      { name: "Admissions", path: "/admission-tracker" },
      { name: "Authorization Codes", path: "/authorization-codes" },
      { name: "Appointments", path: "/appointments" },
    ],
  },

  // Clinical Records
  {
    name: "Enrollee Medical Records",
    icon: <TaskIcon />,
    subItems: [
      { name: "Patient Records", path: "/patient-records" },
      { name: "Medical History", path: "/medical-history" },
    ],
  },

  // Billing & Finance
  {
    name: "Billing Management",
    icon: <GridIcon />,
    subItems: [
      { name: "Capture Bill", path: "/bills" },
      { name: "Saved Bills", path: "/saved-bills" },
      { name: "Submitted Bills", path: "/submitted-bills" },
    ],
  },
  {
    name: "Claims & Refunds",
    icon: <TaskIcon />,
    path: "/claims-refunds",
  },

  // Telemedicine
  {
    name: "Telemedicine Setup",
    icon: <PlugInIcon />,
    path: "/telemedicine-signup",
    new: true,
  },

  // Support
  {
    name: "Support Messages",
    icon: <TaskIcon />,
    path: "/support-messages",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  // Allow all menu items (no privilege check needed for providers)
  const allowedMenuNames = useMemo(() => {
    const set = new Set<string>();
    navItems.forEach((item) => set.add(item.name));
    // supportItems.forEach((item) => set.add(item.name));
    // othersItems.forEach((item) => set.add(item.name));
    return set;
  }, []);

  // Filter the top-level arrays so only allowed sections are rendered (memoized)
  const filteredNavItems = useMemo(
    () => navItems.filter((item) => allowedMenuNames.has(item.name)),
    [allowedMenuNames]
  );
  // const filteredSupportItems = useMemo(
  //   () => supportItems.filter((item) => allowedMenuNames.has(item.name)),
  //   [allowedMenuNames]
  // );
  // const filteredOthersItems = useMemo(
  //   () => othersItems.filter((item) => allowedMenuNames.has(item.name)),
  //   [allowedMenuNames]
  // );

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "support" | "others",
    startIndex: number = 0
  ) => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => {
        const globalIndex = startIndex + index;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(globalIndex, menuType)}
                className={`menu-item group  ${
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === globalIndex
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={` ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === globalIndex
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {nav.new && (isExpanded || isHovered || isMobileOpen) && (
                  <span
                    className={`ml-auto absolute right-10 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === globalIndex
                        ? "menu-dropdown-badge-active"
                        : "menu-dropdown-badge-inactive"
                    } menu-dropdown-badge`}
                  >
                    new
                  </span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === globalIndex
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${globalIndex}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === globalIndex
                      ? `${subMenuHeight[`${menuType}-${globalIndex}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-pro-active"
                                  : "menu-dropdown-badge-pro-inactive"
                              } menu-dropdown-badge-pro `}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Find the submenu (type + index) that matches the current pathname, if any
    let matched: { type: "main" | "support" | "others"; index: number } | null =
      null;
    const menuItemsMap: Record<string, NavItem[]> = {
      main: filteredNavItems,
      // support: filteredSupportItems,
      // others: filteredOthersItems,
    };

    (Object.keys(menuItemsMap) as Array<"main" | "support" | "others">).some(
      (menuType) => {
        const items = menuItemsMap[menuType];
        return (
          items &&
          items.some((nav, index) => {
            if (!nav.subItems) return false;
            return nav.subItems.some((subItem) => {
              if (isActive(subItem.path)) {
                matched = { type: menuType, index };
                return true;
              }
              return false;
            });
          })
        );
      }
    );

    // Only update state if the matched submenu is different from current state
    setOpenSubmenu((prev) => {
      if (!matched) {
        return null;
      }
      if (prev && prev.type === matched.type && prev.index === matched.index) {
        return prev;
      }
      return matched;
    });
  }, [
    pathname,
    isActive,
    filteredNavItems,
    // filteredSupportItems,
    // filteredOthersItems,
  ]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "support" | "others"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed  flex flex-col xl:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-full transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/main/Darkversion.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/main/Darkversion.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            //small
            <Image
              src="/images/main/small.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto  duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* Clinical Management */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Clinical"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems.slice(0, 3), "main", 0)}
            </div>

            {/* Clinical Records */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Records"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems.slice(3, 4), "main", 3)}
            </div>

            {/* Billing & Finance */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Billing"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems.slice(4, 6), "main", 4)}
            </div>

            {/* Services & Telemedicine */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Services"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems.slice(6, 7), "main", 6)}
            </div>

            {/* Support */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Support"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems.slice(7, 8), "main", 7)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
