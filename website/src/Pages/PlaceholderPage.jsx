import { Link, useLocation } from "react-router-dom";

const pageTitles = {
  "/about": "About the Ministry",
  "/departments": "Ministry Departments",
  "/projects": "Jubaland Project Management Portal",
  "/publications": "Publications",
  "/news": "News and Events",
  "/contact": "Contact the Ministry",
  "/login": "Staff Login",
};

function PlaceholderPage() {
  const location = useLocation();

  const pageTitle =
    pageTitles[location.pathname] || "Page Not Found";

  return (
    <section className="mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
          Jubaland State of Somalia
        </p>

        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
          {pageTitle}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
          This route is working correctly. The complete page will be developed
          during its assigned implementation phase.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex rounded-lg bg-emerald-800 px-6 py-3 font-semibold text-white hover:bg-emerald-900"
        >
          Return to Home
        </Link>
      </div>
    </section>
  );
}

export default PlaceholderPage;