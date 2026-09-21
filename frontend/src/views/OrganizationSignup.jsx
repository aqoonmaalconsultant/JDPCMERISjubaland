import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  EyeOff,
  Landmark,
  Users,
} from 'lucide-react';

import { api } from '../api/client.js';

export function OrganizationSignup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    institutionCategory: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  };

  const selectInstitutionCategory =
    (institutionCategory) => {

      setForm({
        ...form,
        institutionCategory,
      });

      setError('');
    };

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.institutionCategory) {

      setError(
        'Please select an institution category'
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {

      setError(
        'Passwords do not match'
      );

      return;
    }

    try {

      setLoading(true);

      await api.post(
        '/organization-auth/signup',
        {
          institutionCategory:
            form.institutionCategory,

          name:
            form.name,

          email:
            form.email,

          password:
            form.password,
        }
      );

      setSuccess(
        'Institution account created successfully. Redirecting to login...'
      );

      setTimeout(() => {

       navigate('/public/organization/login');

      }, 1500);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        'Unable to create institution account'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-lg">

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-6 text-center">

            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-civic text-white">

              <Building2 size={24} />

            </div>

            <h1 className="text-2xl font-bold text-slate-900">

              Institution Sign Up

            </h1>

            <p className="mt-2 text-sm text-slate-500">

              Create a JAIMS institution account to access registration and project management services.

            </p>

          </div>

          {error && (

            <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">

              {error}

            </div>

          )}

          {success && (

            <div className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">

              {success}

            </div>

          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">

                Institution Category

              </label>

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    selectInstitutionCategory(
                      'Government'
                    )
                  }
                  className={`rounded-lg border p-4 text-left transition ${
                    form.institutionCategory ===
                    'Government'
                      ? 'border-civic bg-civic/5 ring-1 ring-civic'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >

                  <div className="mb-2 flex items-center gap-2">

                    <Landmark
                      size={20}
                      className="text-civic"
                    />

                    <span className="font-semibold text-slate-900">

                      Government Institution

                    </span>

                  </div>

                  <p className="text-xs leading-5 text-slate-500">

                    Ministries, departments, agencies and other government institutions.

                  </p>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectInstitutionCategory(
                      'Non-Governmental'
                    )
                  }
                  className={`rounded-lg border p-4 text-left transition ${
                    form.institutionCategory ===
                    'Non-Governmental'
                      ? 'border-civic bg-civic/5 ring-1 ring-civic'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >

                  <div className="mb-2 flex items-center gap-2">

                    <Users
                      size={20}
                      className="text-civic"
                    />

                    <span className="font-semibold text-slate-900">

                      Non-Governmental Institution

                    </span>

                  </div>

                  <p className="text-xs leading-5 text-slate-500">

                    NGOs, consultants, civil society organizations, CBOs, networks, associations and other eligible institutions.

                  </p>

                </button>

              </div>

              {form.institutionCategory ===
                'Government' && (

                <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">

                  Government institutions do not require an organization registration certificate. MoPIIC will verify the institution before project access is enabled.

                </div>

              )}

              {form.institutionCategory ===
                'Non-Governmental' && (

                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">

                  Non-governmental institutions must complete the formal registration process before project access is enabled.

                </div>

              )}

            </div>

            <div>

              <label className="mb-1 block text-sm font-medium text-slate-700">

                Contact Person Name

              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-civic"
                placeholder="Contact person name"
              />

            </div>

            <div>

              <label className="mb-1 block text-sm font-medium text-slate-700">

                Email Address

              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-civic"
                placeholder="email@example.com"
              />

            </div>

            <div>

              <label className="mb-1 block text-sm font-medium text-slate-700">

                Password

              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full rounded border border-slate-300 px-3 py-2 pr-10 outline-none focus:border-civic"
                  placeholder="Minimum 8 characters"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-2 top-2 text-slate-500"
                >

                  {
                    showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />
                  }

                </button>

              </div>

            </div>

            <div>

              <label className="mb-1 block text-sm font-medium text-slate-700">

                Confirm Password

              </label>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-civic"
                placeholder="Confirm password"
              />

            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full rounded bg-civic px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >

              {
                loading
                  ? 'Creating Account...'
                  : 'Create Institution Account'
              }

            </button>

          </form>

          <div className="mt-5 text-center text-sm text-slate-500">

            Already have an account?

           <Link
  to="/public/organization/login"
  className="ml-1 font-semibold text-civic"
>
  Sign In
</Link>

          </div>

        </div>

      </div>

    </div>

  );

}