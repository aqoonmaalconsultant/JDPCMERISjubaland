import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  EyeOff,
  LogIn,
} from 'lucide-react';

import {
  organizationApi,
  saveOrganizationSession,
} from '../api/organizationClient.js';

export function OrganizationLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleChange = (
    event
  ) => {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const { data } =
        await organizationApi.post(
          '/auth/login',
          {
            email:
              form.email,

            password:
              form.password,
          }
        );

      if (
        data.user?.role !==
        'ORGANIZATION_USER'
      ) {
        setError(
          'This login page is only for organization accounts.'
        );

        return;
      }

      saveOrganizationSession({
        accessToken:
          data.accessToken,

        refreshToken:
          data.refreshToken,

        user:
          data.user,
      });

      navigate(
        '/public/organization/dashboard'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid email or password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="text-center">

          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-civic text-white">
            <Building2 size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Organization Sign In
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your organization registration application.
          </p>

        </div>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-4"
        >

          <div>

            <label
              htmlFor="organizationEmail"
              className="block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <input
              id="organizationEmail"
              type="email"
              name="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              placeholder="organization@email.com"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none transition focus:border-civic focus:ring-4 focus:ring-emerald-100"
            />

          </div>

          <div>

            <label
              htmlFor="organizationPassword"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative mt-2">

              <input
                id="organizationPassword"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 pr-11 outline-none transition focus:border-civic focus:ring-4 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-civic px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn
              size={18}
            />

            {isSubmitting
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-slate-500">

          Do not have an account?

          <Link
            to="/public/organization/signup"
            className="ml-1 font-semibold text-civic"
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}