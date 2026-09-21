import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import ministryLogo from "../../assets/logo.png";

const ministryFacebookUrl =
  "https://www.facebook.com/p/Jubaland-Ministry-of-Planning-International-Cooperation-100064861145432/";

const staffLoginUrl =
  "http://127.0.0.1:5173/login";

const ministryProjectsPortalUrl =
  "http://127.0.0.1:5173/login?redirect=/ministry-projects";

const jaimsPublicDashboardUrl =
  "http://127.0.0.1:5173/public";

function FacebookIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 22v-8h2.8l.4-3.1h-3.2V9c0-.9.3-1.5 1.6-1.5h1.7V4.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.3V14h2.8v8h3.4Z" />
    </svg>
  );
}

const aboutItems = [
  {
    name: "The Ministry",
    path: "/about",
  },
  {
    name: "Minister",
    path: "/leadership/minister",
  },
  {
    name: "Deputy Minister",
    path: "/leadership/deputy-minister",
  },
  {
    name: "Director General",
    path: "/leadership/director-general",
  },
];

const departmentItems = [
  {
    name: "Planning and Policy",
    path: "/departments/planning",
  },
  {
  name: "Aid Coordination Department",
  path: "/departments/aid-coordination",
},
  {
    name: "Investment Promotion Department",
    path: "/departments/investment-promotion",
  },
  {
    name: "Statistics Department",
    path: "/departments/statistics",
  },
  {
    name: "Monitoring, Evaluation, Research & Learning",
    path: "/departments/monitoring-evaluation",
  },
  {
    name: "Administration, Finance & Human Resources",
    path: "/departments/administration-finance",
  },
  {
    name: "Durable Solutions Unit",
    path: "/departments/durable-solutions",
  },
  {
    name: "Sustainable Development Goals (SDG) Unit",
    path: "/departments/sdg",
  },
];

const projectItems = [
  {
    name: "Project Dashboard",
    path: "/projects/dashboard",
  },
  {
    name: "All Projects",
    path: "/projects",
  },
  {
    name: "Projects Portal",
    path: ministryProjectsPortalUrl,
    external: true,
  },
];

const organizationRegistryItems = [
  {
    name: "Sign In / Sign Up",
    path: "http://127.0.0.1:5173/public/organization/login",
    external: true,
  },
  {
    name: "Track Application",
    path: "/organizations/track",
  },
];

function DesktopDropdown({
  label,
  items,
  active,
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={[
          "inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[14px] font-semibold leading-none text-white transition duration-200",
          active
            ? "bg-white/15 text-white"
            : "text-white hover:bg-white/10",
        ].join(" ")}
      >
        <span className="text-white">
          {label}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={2.2}
          className="shrink-0 text-white transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      <div className="invisible absolute left-0 top-full z-50 min-w-80 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                className="block rounded-lg px-4 py-3 text-[14px] font-medium leading-5 text-slate-700 transition duration-200 hover:bg-slate-50 hover:text-emerald-800"
              >
                {item.name}
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "block rounded-lg px-4 py-3 text-[14px] font-medium leading-5 transition duration-200",
                    isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50 hover:text-emerald-800",
                  ].join(" ")
                }
              >
                {item.name}
              </NavLink>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function MobileDropdown({
  title,
  items,
  isOpen,
  onToggle,
  onNavigate,
}) {
  return (
    <div className="border-b border-emerald-700/60">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] font-semibold leading-none text-white"
      >
        <span className="text-white">
          {title}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={2.2}
          className={[
            "shrink-0 text-white transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div className="space-y-1 bg-emerald-950/20 px-3 pb-3">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                onClick={onNavigate}
                className="block rounded-md px-4 py-2.5 text-sm font-medium leading-5 text-emerald-50 transition duration-200 hover:bg-white/10"
              >
                {item.name}
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "block rounded-md px-4 py-2.5 text-sm font-medium leading-5 transition duration-200",
                    isActive
                      ? "bg-white text-emerald-800"
                      : "text-emerald-50 hover:bg-white/10",
                  ].join(" ")
                }
              >
                {item.name}
              </NavLink>
            )
          )}
        </div>
      )}
    </div>
  );
}

function Header() {
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [openMobileDropdown, setOpenMobileDropdown] =
    useState("");

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenMobileDropdown("");
  };

  const isPathActive = (items) =>
    items.some(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(
          `${item.path}/`
        )
    );

  const toggleMobileDropdown = (name) => {
    setOpenMobileDropdown((currentValue) =>
      currentValue === name ? "" : name
    );
  };

  const standardNavigationClass = ({
    isActive,
  }) =>
    [
      "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-[14px] font-semibold leading-none !text-white transition duration-200 hover:bg-white/10 hover:!text-white",
      isActive
        ? "bg-white/15 !text-white"
        : "!text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-t-2 border-emerald-950 bg-emerald-700 shadow-md">
      <div className="mx-auto flex min-h-[100px] max-w-[1800px] items-center px-5 lg:px-7 xl:px-8">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex min-w-0 shrink-0 items-center gap-3"
        >
          <img
            src={ministryLogo}
            alt="Ministry of Planning, Investment and International Cooperation"
            className="h-[70px] w-[70px] shrink-0 rounded-full border-[3px] border-white bg-white object-contain shadow-sm"
          />

          <div className="min-w-0 text-white">
            <p className="truncate text-lg font-bold leading-tight tracking-tight text-white 2xl:text-xl">
              MoPIIC - Jubaland
            </p>

            <p className="mt-1 hidden max-w-[250px] text-[12px] font-normal leading-5 text-emerald-100 2xl:block">
              Ministry of Planning, Investment and International Cooperation
            </p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex">
          <NavLink
            to="/"
            end
            className={standardNavigationClass}
          >
            Home
          </NavLink>

          <DesktopDropdown
            label="About"
            items={aboutItems}
            active={isPathActive(aboutItems)}
          />

          <DesktopDropdown
            label="Departments"
            items={departmentItems}
            active={isPathActive(
              departmentItems
            )}
          />

          <DesktopDropdown
            label="Projects"
            items={projectItems}
            active={isPathActive(projectItems)}
          />

          <NavLink
            to="/publications"
            className={standardNavigationClass}
          >
            Publications
          </NavLink>

          <NavLink
            to="/events"
            className={standardNavigationClass}
          >
            Events
          </NavLink>

          <DesktopDropdown
            label="Organization Registry"
            items={organizationRegistryItems}
            active={isPathActive(
              organizationRegistryItems
            )}
          />
        </nav>

        <div className="ml-3 hidden shrink-0 items-center gap-2 xl:flex">
          <a
            href={ministryFacebookUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="MoPIIC Facebook"
            title="Follow MoPIIC on Facebook"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/40 bg-white/10 text-white transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-emerald-700 hover:shadow-md"
          >
            <FacebookIcon size={18} />
          </a>

          <a
            href={jaimsPublicDashboardUrl}
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-white/40 bg-white/10 px-3 text-[14px] font-semibold leading-none !text-white transition duration-200 hover:bg-white/20 hover:!text-white"
          >
            <LayoutDashboard
              size={16}
              strokeWidth={2.2}
            />
            JAIMS
          </a>

          <a
            href={staffLoginUrl}
            className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-white bg-white px-3 text-[14px] font-semibold leading-none text-emerald-800 shadow-sm transition duration-200 hover:bg-emerald-50 hover:text-emerald-900"
          >
            <LogIn
              size={16}
              strokeWidth={2.2}
            />
            Staff Login
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen(
              (currentValue) => !currentValue
            )
          }
          className="ml-auto inline-flex rounded-lg border border-white/30 p-2.5 text-white transition hover:bg-white/10 xl:hidden"
        >
          {mobileMenuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-emerald-600 bg-emerald-800 xl:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <NavLink
              to="/"
              end
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                [
                  "block border-b border-emerald-700/60 px-4 py-3.5 text-[14px] font-semibold leading-none !text-white",
                  isActive
                    ? "bg-white/10"
                    : "",
                ].join(" ")
              }
            >
              Home
            </NavLink>

            <MobileDropdown
              title="About"
              items={aboutItems}
              isOpen={
                openMobileDropdown === "about"
              }
              onToggle={() =>
                toggleMobileDropdown("about")
              }
              onNavigate={closeMobileMenu}
            />

            <MobileDropdown
              title="Departments"
              items={departmentItems}
              isOpen={
                openMobileDropdown ===
                "departments"
              }
              onToggle={() =>
                toggleMobileDropdown(
                  "departments"
                )
              }
              onNavigate={closeMobileMenu}
            />

            <MobileDropdown
              title="Projects"
              items={projectItems}
              isOpen={
                openMobileDropdown ===
                "projects"
              }
              onToggle={() =>
                toggleMobileDropdown("projects")
              }
              onNavigate={closeMobileMenu}
            />

            <NavLink
              to="/publications"
              onClick={closeMobileMenu}
              className="block border-b border-emerald-700/60 px-4 py-3.5 text-[14px] font-semibold leading-none !text-white"
            >
              Publications
            </NavLink>

            <NavLink
              to="/events"
              onClick={closeMobileMenu}
              className="block border-b border-emerald-700/60 px-4 py-3.5 text-[14px] font-semibold leading-none !text-white"
            >
              Events
            </NavLink>

            <MobileDropdown
              title="Organization Registry"
              items={organizationRegistryItems}
              isOpen={
                openMobileDropdown ===
                "organization-registry"
              }
              onToggle={() =>
                toggleMobileDropdown(
                  "organization-registry"
                )
              }
              onNavigate={closeMobileMenu}
            />

            <div className="grid gap-3 px-4 py-5 sm:grid-cols-2">
              <a
                href={ministryFacebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="MoPIIC Facebook"
                title="Follow MoPIIC on Facebook"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-3 text-[14px] font-semibold !text-white transition duration-200 hover:bg-white hover:!text-emerald-700"
              >
                <FacebookIcon size={18} />
                Facebook
              </a>

              <a
                href={jaimsPublicDashboardUrl}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-3 text-[14px] font-semibold !text-white"
              >
                <LayoutDashboard size={17} />
                JAIMS
              </a>

              <a
                href={staffLoginUrl}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-[14px] font-semibold text-emerald-800 shadow-sm sm:col-span-2"
              >
                <LogIn size={17} />
                Staff Login
              </a>

              <Link
                to="/organizations/register"
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-[14px] font-semibold !text-white sm:col-span-2"
              >
                <Building2 size={17} />
                Register Organization
              </Link>
            </div>
          </nav>
        </div>
      )}

      <div className="h-1 bg-sky-500" />
    </header>
  );
}

export default Header;