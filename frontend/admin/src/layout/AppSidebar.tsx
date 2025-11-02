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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
      { name: "Analytics", path: "/analytics" },
      { name: "Financial", path: "/finance" },
    ],
  },
  {
    name: "Admins",
    icon: <UserIcon />,
    subItems: [
      { name: "List", path: "/admins" },
      { name: "Other Employees", path: "/others" },
    ],
  },
  {
    name: "Providers",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "List", path: "/providers" },
      { name: "Tariff History", path: "/tariff" },
    ],
  },
  {
    name: "Companies",
    icon: <PaperPlaneIcon />,
    subItems: [
      { name: "List", path: "/companies" },
      { name: "Subscriptions", path: "/subscriptions" },
      { name: "Review", path: "/review" },
    ],
  },
  {
    name: "Enrollees",
    icon: <GroupIcon />,
    subItems: [
      { name: "List", path: "/enrollees" },
      { name: "Staff List", path: "/staffs" },
      { name: "Refunds", path: "/refunds" },
      { name: "Dependents", path: "/dependents" },
      { name: "Retail Enrollees", path: "/retail-enrollees" },
      { name: "Form Setup", path: "/form-setup" },
      { name: "Birthday Setup", path: "/birthday-setup" },
      { name: "Switch", path: "/switch" },
    ],
  },
  {
    name: "Claims",
    icon: <EnvelopeIcon />,
    subItems: [
      { name: "List", path: "/claims" },
      { name: "Capture", path: "/capture" },
      { name: "Vetting", path: "/vetting" },
      { name: "Payment Batch", path: "/payment-batch" },
      { name: "Payment Advice", path: "/payment-advice" },
      { name: "Awaiting Payment", path: "/awaiting-payment" },
      { name: "Assigned Claims", path: "/assigned-claims" },
    ],
  },
  {
    name: "Authorizations",
    icon: <PencilIcon />,
    subItems: [
      { name: "List", path: "/authorizations" },
      { name: "Tracker", path: "/authorization-tracking" },
      { name: "New Authorization", path: "/new-authorization" },
      { name: "Verification Monitor", path: "/verification-monitor" },
    ],
  },
  {
    name: "Services",
    icon: <CartIcon />,
    subItems: [
      { name: "Annual Medical Check", path: "/medical-check" },
      { name: "Call Memo", path: "/call-memo" },
      { name: "Surveys", path: "/surveys" },
      { name: "Service Cycle", path: "/service-cycles" },
    ],
  },
  {
    name: "Invoices",
    icon: <TaskIcon />,
    subItems: [
      { name: "List", path: "/invoices" },
      { name: "Generate Invoice", path: "/generate-invoice" },
      { name: "Invoice Settings", path: "/invoice-settings" },
    ],
  },
  {
    name: "Settings",
    icon: <PlugInIcon />,
    subItems: [
      { name: "Plans", path: "/plans" },
      { name: "Units", path: "/units" },
      { name: "Roles", path: "/roles" },
      { name: "Diagnosis", path: "/diagnosis" },
      { name: "Exclusion", path: "/exclude" },
      { name: "Benefits", path: "/benefits" },
      { name: "Provider Specializations", path: "/provider-specializations" },
      { name: "Notification Settings", path: "/notification-settings" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Logs",
    icon: <ListIcon />,
    subItems: [
      { name: "Audit Logs", path: "/audit" },
      { name: "Login History", path: "/login" },
      { name: "Notification Logs", path: "/notification" },
    ],
  },
];

const supportItems: NavItem[] = [
  {
    name: "Actions",
    icon: <InfoIcon />,
    subItems: [
      { name: "Approvals", path: "/approvals" },
      { name: "Requests", path: "/requests" },
      { name: "Reports", path: "/reports" },
    ],
  },
  {
    icon: <CallIcon />,
    name: "Support",
    subItems: [
      { name: "Support List", path: "/support-tickets" },
      { name: "Support Reply", path: "/support-ticket-reply" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

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
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "support", "others"].forEach((menuType) => {
      const items =
        menuType === "main"
          ? navItems
          : menuType === "support"
          ? supportItems
          : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "support" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

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
              {renderMenuItems(navItems, "main")}
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
              {renderMenuItems(supportItems, "support")}
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
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
