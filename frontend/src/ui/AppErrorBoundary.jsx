import {
  AlertTriangle,
  Home,
  RotateCcw,
} from 'lucide-react';

import {
  Link,
  useLocation,
  useRouteError,
} from 'react-router-dom';

export function AppErrorBoundary() {
  const error =
    useRouteError();

  const location =
    useLocation();

  console.error(
    'JAIMS route error:',
    error
  );

 const isInstitutionPortal =
  location.pathname.startsWith(
    '/public/organization/'
  ) ||
  location.pathname.startsWith(
    '/public/institution/'
  );

  const dashboardPath =
    isInstitutionPortal
      ? '/public/organization/dashboard'
      : '/';

  const message =
    error?.message ||
    error?.data?.message ||
    error?.statusText ||
    (typeof error === 'string'
      ? error
      : 'Something went wrong while loading this page.');

  const details = (() => {
    if (!error) {
      return '';
    }

    if (error?.stack) {
      return error.stack;
    }

    try {
      return JSON.stringify(
        error,
        null,
        2
      );
    } catch {
      return String(error);
    }
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-2xl rounded border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="rounded bg-red-50 p-2 text-red-700">
            <AlertTriangle
              size={22}
            />
          </div>

          <div className="min-w-0 flex-1">

            <h1 className="text-lg font-semibold text-ink">
              Page error
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {message}
            </p>

            {details ? (
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                {details}
              </pre>
            ) : null}

          </div>

        </div>

        <div className="mt-6 flex flex-wrap gap-2">

          <button
            className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            onClick={() =>
              window.location.reload()
            }
            type="button"
          >
            <RotateCcw
              size={16}
            />

            Reload
          </button>

          <Link
            className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            to={dashboardPath}
          >
            <Home
              size={16}
            />

            Dashboard
          </Link>

        </div>

      </div>
    </div>
  );
}