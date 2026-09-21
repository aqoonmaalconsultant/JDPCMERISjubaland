import { useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  BarChart3,
  LogIn,
} from 'lucide-react';

import {
  useAuth,
} from '../auth/AuthContext.jsx';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    login,
  } = useAuth();

  const [form, setForm] =
    useState({
      email:
        'admin@jdpcmeris.gov.so',

      password:
        'Admin@12345',
    });

  const [error, setError] =
    useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Redirect Destination
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | /login?redirect=/ministry-projects
  |
  | Only internal paths beginning with "/" are accepted.
  |
  */

  const params =
    new URLSearchParams(
      location.search
    );

  const requestedRedirect =
    params.get('redirect');

  const redirectTo =
    requestedRedirect &&
    requestedRedirect.startsWith('/') &&
    !requestedRedirect.startsWith('//')
      ? requestedRedirect
      : '/';

  /*
  |--------------------------------------------------------------------------
  | Already Authenticated
  |--------------------------------------------------------------------------
  */

  if (isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const onSubmit =
    async (event) => {
      event.preventDefault();

      setError('');
      setIsSubmitting(true);

      try {
        await login(form);

        navigate(
          redirectTo,
          {
            replace: true,
          }
        );
      } catch (_error) {
        setError(
          'Login failed. Check the email, password, and backend API connection.'
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex items-center justify-center bg-civic px-6 py-12 text-white">
        <div className="max-w-xl">
          <div className="mb-8 grid h-14 w-14 place-items-center rounded bg-white text-civic">
            <BarChart3
              size={30}
            />
          </div>

          <h1 className="text-4xl font-semibold leading-tight">
            Jubaland Projects
            Management Portal
          </h1>

          <p className="mt-4 text-lg text-teal-50">
            Official platform for
            planning, coordinating,
            monitoring, managing,
            and reporting development
            projects across Jubaland
            State.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form
          className="w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={onSubmit}
        >
          <h2 className="text-xl font-semibold">
            Sign in
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Use your assigned
            Ministry staff account
            to access the projects
            management portal.
          </p>

          <label
            className="mt-6 block text-sm font-semibold text-slate-700"
            htmlFor="email"
          >
            Email
          </label>

          <input
            id="email"
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-civic"
            value={form.email}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,

                  email:
                    event.target
                      .value,
                })
              )
            }
            type="email"
            required
          />

          <label
            className="mt-4 block text-sm font-semibold text-slate-700"
            htmlFor="password"
          >
            Password
          </label>

          <input
            id="password"
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-civic"
            value={form.password}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,

                  password:
                    event.target
                      .value,
                })
              )
            }
            type="password"
            required
          />

          {error ? (
            <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-civic px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={
              isSubmitting
            }
            type="submit"
          >
            <LogIn
              size={17}
            />

            {isSubmitting
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}