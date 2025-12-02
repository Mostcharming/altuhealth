"use client";
import { useSidebar } from "@/context/SidebarContext";
import {
  CallIcon,
  CartIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  InfoIcon,
  ListIcon,
  PaperPlaneIcon,
  PencilIcon,
  PlugInIcon,
  TaskIcon,
  UserCircleIcon,
  UserIcon,
} from "@/icons";
import { useAuthStore } from "@/lib/authStore";
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
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [
      { name: "Overview", path: "/overview" }, //finance
      { name: "Analytics", path: "/analytics" },
      { name: "Finance", path: "/finance" }, //find something
    ],
  },

  {
    name: "Admins",
    icon: <UserIcon />,
    subItems: [
      { name: "Admin Directory", path: "/admins" },
      // { name: "Other Employees", path: "/others" },
      // { name: "Access & Roles", path: "/userroles" },
    ],
  },
  {
    name: "Providers",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Provider Directory", path: "/providers" },
      { name: "Specializations", path: "/provider-specializations" },
    ],
  },
  {
    name: "Organizations",
    icon: <PaperPlaneIcon />,
    subItems: [
      { name: "Companies", path: "/companies" },
      { name: "Subscriptions", path: "/subscriptions" },
      // { name: "Reviews", path: "/review" },
    ],
  },
  {
    name: "Enrollees",
    icon: <GroupIcon />,
    subItems: [
      { name: "Enrollee List", path: "/enrollees" },
      { name: "Dependents", path: "/dependents" },
      { name: "Retail Enrollees", path: "/retail-enrollees" },
      { name: "Form Setup", path: "/form-setup" },
      { name: "Birthday Setup", path: "/birthday-setup" },
      { name: "Bulk Upload", path: "/enrollees/bulk-upload" },
    ],
  },
  {
    name: "Claims",
    icon: <EnvelopeIcon />,
    subItems: [
      { name: "Claims Management", path: "/claims" },
      { name: "Capture & Validation", path: "/capture" },
      { name: "Vetting & Adjudication", path: "/vetting" },
      { name: "Payment Batch", path: "/payment-batch" },
      { name: "Payment Advice", path: "/payment-advice" },
      { name: "Reconciliation", path: "/reconciliation" },
      { name: "Assigned Claims", path: "/assigned-claims" },
    ],
  },
  {
    name: "Authorizations",
    icon: <PencilIcon />,
    subItems: [
      { name: "Requests", path: "/authorizations" },
      { name: "Tracker", path: "/authorization-tracking" },
      { name: "Create Authorization", path: "/new-authorization" },
      { name: "Verification Monitor", path: "/verification-monitor" },
    ],
  },
  {
    name: "Services",
    icon: <CartIcon />,
    subItems: [
      { name: "Service Catalog", path: "/service-catalog" }, //medical checkup
      { name: "Appointments & Memos", path: "/call-memo" },
      { name: "Surveys", path: "/surveys" },
      { name: "Service Cycles", path: "/service-cycles" },
    ],
  },
  {
    name: "Billing",
    icon: <TaskIcon />,
    subItems: [
      { name: "Invoices", path: "/invoices" },
      { name: "Generate Invoice", path: "/generate-invoice" },
      { name: "Billing Settings", path: "/invoice-settings" },
      { name: "Payment Reconciliation", path: "/payment-reconciliation" },
    ],
  },
  {
    name: "Configuration",
    icon: <PlugInIcon />,
    subItems: [
      { name: "Plans", path: "/plans" },
      { name: "Units", path: "/units" },
      { name: "Roles", path: "/roles" },
      { name: "Diagnosis Setup", path: "/diagnosis" },
      { name: "Exclusions", path: "/exclude" },
      { name: "Benefits", path: "/benefits" },
      { name: "Notification Settings", path: "/notification-settings" },
      { name: "Integrations", path: "/integrations" },
    ],
  },
];

const supportItems: NavItem[] = [
  {
    name: "Operations",
    icon: <InfoIcon />,
    subItems: [
      { name: "Approvals", path: "/approvals" },
      { name: "Requests", path: "/requests" },
      { name: "Reports", path: "/reports" },
      // { name: "System Status", path: "/system-status" },
    ],
  },
  {
    icon: <CallIcon />,
    name: "Support",
    subItems: [
      { name: "Support Tickets", path: "/support-tickets" },
      // { name: "Ticket Replies", path: "/support-ticket-reply" },
      // { name: "Knowledge Base", path: "/knowledge-base" },
      // { name: "SLA Management", path: "/sla-management" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Logs",
    icon: <ListIcon />,
    subItems: [
      { name: "Audit Logs", path: "/audit" },
      { name: "Notification Logs", path: "/notification" },
    ],
  },
  {
    name: "Developer",
    icon: <PaperPlaneIcon />,
    subItems: [
      { name: "API Keys", path: "/api-keys" },
      { name: "Webhooks", path: "/webhooks" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const privilegeMap: Record<string, string[]> = {
    "admins.manage": ["Admins"],
    "providers.manage": ["Providers"],
    "organizations.manage": ["Organizations"],
    "enrollees.manage": ["Enrollees"],
    "claims.manage": ["Claims"],
    "authorizations.manage": ["Authorizations"],
    "services.manage": ["Services"],
    "billing.manage": ["Billing"],
    "config.manage": ["Configuration"],
    "operations.manage": ["Operations"],
    "support.manage": ["Support"],
    "logs.view": ["Logs"],
    "developer.manage": ["Developer"],
  };

  // Memoize user's privilege names to avoid recreating the Set each render
  const userPrivNames = useMemo(() => {
    const rolePrivilegesArr = (user?.rolePrivileges || []) as Array<
      { name?: string } | undefined
    >;
    return new Set<string>(
      rolePrivilegesArr
        .map((p) => p?.name)
        .filter((n): n is string => Boolean(n))
    );
  }, [user?.rolePrivileges]);

  // Always allow Dashboard and add menu names based on privileges (memoized)
  const allowedMenuNames = useMemo(() => {
    const set = new Set<string>(["Dashboard"]);
    Object.entries(privilegeMap).forEach(([priv, names]) => {
      if (userPrivNames.has(priv)) {
        names.forEach((n) => set.add(n));
      }
    });
    return set;
  }, [userPrivNames]);

  // Filter the top-level arrays so only allowed sections are rendered (memoized)
  const filteredNavItems = useMemo(
    () => navItems.filter((item) => allowedMenuNames.has(item.name)),
    [allowedMenuNames]
  );
  const filteredSupportItems = useMemo(
    () => supportItems.filter((item) => allowedMenuNames.has(item.name)),
    [allowedMenuNames]
  );
  const filteredOthersItems = useMemo(
    () => othersItems.filter((item) => allowedMenuNames.has(item.name)),
    [allowedMenuNames]
  );

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "support" | "others"
  ) => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
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
                  openSubmenu?.type === menuType && openSubmenu?.index === index
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
                    openSubmenu?.index === index
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
                    openSubmenu?.index === index
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
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
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
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
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
      ))}
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
      support: filteredSupportItems,
      others: filteredOthersItems,
    };

    (
      ["main", "support", "others"] as Array<"main" | "support" | "others">
    ).some((menuType) => {
      const items = menuItemsMap[menuType];
      return items.some((nav, index) => {
        if (!nav.subItems) return false;
        return nav.subItems.some((subItem) => {
          if (isActive(subItem.path)) {
            matched = { type: menuType, index };
            return true;
          }
          return false;
        });
      });
    });

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
    filteredSupportItems,
    filteredOthersItems,
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
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Main"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
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
              {renderMenuItems(filteredSupportItems, "support")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
