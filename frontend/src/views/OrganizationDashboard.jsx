import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  AlertTriangle,
  Bell,
  Building2,
  FilePlus2,
  FileText,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import {
  clearOrganizationSession,
  getOrganizationUser,
} from '../api/organizationClient.js';

const API_BASE_URL =
  'http://127.0.0.1:5000/api/v1';

const ORGANIZATION_TOKEN_KEY =
  'jaims_org_access_token';

function formatNotificationDate(
  value
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  );
}

export function OrganizationDashboard() {
  const navigate =
    useNavigate();

  const user =
    getOrganizationUser();

  const isGovernment =
    user?.institutionCategory ===
    'Government';

  const institutionCategoryLabel =
    isGovernment
      ? 'Government Institution'
      : 'Non-Governmental Institution';

  const [
    notifications,
    setNotifications,
  ] =
    useState([]);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] =
    useState(true);

  const [
    notificationsError,
    setNotificationsError,
  ] =
    useState('');

  const handleLogout = () => {
    clearOrganizationSession();

    navigate(
      '/public/organization/login'
    );
  };

  const loadNotifications =
    async () => {
      const token =
        localStorage.getItem(
          ORGANIZATION_TOKEN_KEY
        );

      if (!token) {
        setNotifications([]);
        setNotificationsLoading(
          false
        );

        return;
      }

      try {
        setNotificationsLoading(
          true
        );

        setNotificationsError(
          ''
        );

        const response =
          await fetch(
            `${API_BASE_URL}/organization-portal/notifications`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const payload =
          await response.json();

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              'Unable to load notifications.'
          );
        }

        setNotifications(
          Array.isArray(
            payload?.data
          )
            ? payload.data
            : []
        );
      } catch (error) {
        setNotificationsError(
          error.message ||
            'Unable to load notifications.'
        );
      } finally {
        setNotificationsLoading(
          false
        );
      }
    };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markNotificationRead =
    async (
      notificationId
    ) => {
      const token =
        localStorage.getItem(
          ORGANIZATION_TOKEN_KEY
        );

      if (
        !token ||
        !notificationId
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/organization-portal/notifications/${notificationId}/read`,
            {
              method:
                'PATCH',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const payload =
          await response.json();

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              'Unable to update notification.'
          );
        }

        setNotifications(
          (
            currentNotifications
          ) =>
            currentNotifications.map(
              (notification) =>
                notification._id ===
                notificationId
                  ? {
                      ...notification,

                      isRead:
                        true,

                      readAt:
                        payload?.data
                          ?.readAt ||
                        new Date()
                          .toISOString(),
                    }
                  : notification
            )
        );
      } catch (error) {
        setNotificationsError(
          error.message ||
            'Unable to update notification.'
        );
      }
    };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">

          <div className="flex items-center gap-3">

            <div className="grid h-11 w-11 place-items-center rounded-lg bg-civic text-white">
              <Building2
                size={22}
              />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                JAIMS Institution Portal
              </h1>

              <p className="text-sm text-slate-500">
                Ministry of Planning, Investment and International Cooperation of Jubaland State
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600">
              <Bell
                size={19}
              />

              {unreadCount >
              0 ? (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                  {
                    unreadCount
                  }
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut
                size={17}
              />

              Logout
            </button>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide text-civic">
                Institution Account
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Welcome
                {user?.name
                  ? `, ${user.name}`
                  : ''}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {isGovernment
                  ? 'Complete and maintain your government institution profile, submit projects for registration, and manage projects coordinated through JAIMS. Government institutions do not require an organization registration certificate.'
                  : 'Apply for official institution registration, manage registration and renewal applications, track Ministry review, and access project registration and management services after approval.'}
              </p>

            </div>

            <div className="rounded-lg bg-emerald-50 px-4 py-3">

              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck
                  size={18}
                />

                {institutionCategoryLabel}
              </div>

              {user?.email ? (
                <p className="mt-1 text-xs text-emerald-700">
                  {
                    user.email
                  }
                </p>
              ) : null}

            </div>

          </div>

        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <div className="flex items-center gap-2">
                <Bell
                  size={20}
                  className="text-civic"
                />

                <h3 className="text-lg font-bold text-slate-900">
                  Notifications
                </h3>

                {unreadCount >
                0 ? (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    {
                      unreadCount
                    }{' '}
                    unread
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {isGovernment
                  ? 'Important institution verification and project notices from the Ministry.'
                  : 'Important registration, certificate and project notices from the Ministry.'}
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadNotifications
              }
              disabled={
                notificationsLoading
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  notificationsLoading
                    ? 'animate-spin'
                    : ''
                }
              />

              Refresh
            </button>

          </div>

          {notificationsError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {
                notificationsError
              }
            </div>
          ) : null}

          {notificationsLoading ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : null}

          {!notificationsLoading &&
          notifications.length ===
            0 ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              You do not have any notifications.
            </div>
          ) : null}

          {!notificationsLoading &&
          notifications.length >
            0 ? (
            <div className="mt-5 space-y-3">

              {notifications.map(
                (
                  notification
                ) => {
                  const isRevoked =
                    notification.type ===
                    'CERTIFICATE_REVOKED';

                  const isSuspended =
                    notification.type ===
                    'CERTIFICATE_SUSPENDED';

                  return (
                    <div
                      key={
                        notification._id
                      }
                      className={[
                        'rounded-xl border p-5',

                        isRevoked
                          ? 'border-red-200 bg-red-50'
                          : isSuspended
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-slate-200 bg-slate-50',

                        !notification.isRead
                          ? 'ring-1 ring-inset'
                          : '',
                      ].join(
                        ' '
                      )}
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex gap-3">

                          <div
                            className={[
                              'mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg',

                              isRevoked
                                ? 'bg-red-100 text-red-700'
                                : isSuspended
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-700',
                            ].join(
                              ' '
                            )}
                          >
                            <AlertTriangle
                              size={20}
                            />
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h4
                                className={[
                                  'font-bold',

                                  isRevoked
                                    ? 'text-red-900'
                                    : isSuspended
                                      ? 'text-amber-900'
                                      : 'text-slate-900',
                                ].join(
                                  ' '
                                )}
                              >
                                {
                                  notification.title
                                }
                              </h4>

                              {!notification.isRead ? (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                                  New
                                </span>
                              ) : null}

                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {
                                notification.message
                              }
                            </p>

                            {notification.certificateNumber ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Certificate Number
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-900">
                                  {
                                    notification.certificateNumber
                                  }
                                </p>
                              </div>
                            ) : null}

                            {notification.reason ? (
                              <div
                                className={[
                                  'mt-4 rounded-lg border px-4 py-3',

                                  isRevoked
                                    ? 'border-red-200 bg-white/70'
                                    : isSuspended
                                      ? 'border-amber-200 bg-white/70'
                                      : 'border-slate-200 bg-white',
                                ].join(
                                  ' '
                                )}
                              >

                                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                                  Reason
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                                  {
                                    notification.reason
                                  }
                                </p>

                              </div>
                            ) : null}

                            <p className="mt-3 text-xs text-slate-500">
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                        {!notification.isRead ? (
                          <button
                            type="button"
                            onClick={() =>
                              markNotificationRead(
                                notification._id
                              )
                            }
                            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Mark as read
                          </button>
                        ) : (
                          <span className="shrink-0 text-xs font-semibold text-slate-400">
                            Read
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : null}

        </section>        {isGovernment ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/profile'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-civic">
                  <Building2
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Institution Profile
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete your government institution profile and submit it to MoPIIC for identity verification.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/project-applications'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <FilePlus2
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Project Registration
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Register projects implemented or coordinated by your institution after MoPIIC verifies your institution profile.
                </p>
              </button>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <UserRound
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Government Account
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This account is classified as a Government Institution and does not enter the organization registration, fee, renewal, or certificate workflow.
                </p>

              </div>

            </section>

            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6">

              <h3 className="font-bold">
                Government Institution Access Process
              </h3>

              <div className="mt-5 grid gap-4 text-sm md:grid-cols-4">

                <div>
                  <p className="font-semibold text-civic">
                    1. Complete Profile
                  </p>

                  <p className="mt-1 text-slate-500">
                    Provide the official identity and contact details of the government institution.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    2. MoPIIC Verification
                  </p>

                  <p className="mt-1 text-slate-500">
                    MoPIIC verifies that the account represents a legitimate government institution.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    3. Register Projects
                  </p>

                  <p className="mt-1 text-slate-500">
                    Once verified, the institution can submit projects for JAIMS registration.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    4. Manage Projects
                  </p>

                  <p className="mt-1 text-slate-500">
                    Maintain project information and progress through the institution portal.
                  </p>
                </div>

              </div>

            </section>
          </>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/register'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-civic">
                  <FilePlus2
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  New Registration
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Start a first-time institution registration application.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/renewal'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-50 text-violet-700">
                  <RefreshCw
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Renewal Registration
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Renew an existing approved institution registration.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/my-applications'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <FileText
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  My Applications
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View registration applications submitted from this institution account.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/application-status'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <ShieldCheck
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Application Status
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Follow Ministry review, payment or exemption, and final approval status.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/profile'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <UserRound
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Institution Profile
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review and maintain institution identity and contact information.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/public/organization/project-applications'
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-civic hover:shadow-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
                  <FilePlus2
                    size={22}
                  />
                </div>

                <h3 className="mt-4 font-bold">
                  Project Registration
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Register and manage projects after the institution registration requirements are satisfied.
                </p>
              </button>

            </section>

            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6">

              <h3 className="font-bold">
                Non-Governmental Institution Access Process
              </h3>

              <div className="mt-5 grid gap-4 text-sm md:grid-cols-5">

                <div>
                  <p className="font-semibold text-civic">
                    1. Submit Registration
                  </p>

                  <p className="mt-1 text-slate-500">
                    Submit a first-time registration application with the required institution details and documents.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    2. Ministry Review
                  </p>

                  <p className="mt-1 text-slate-500">
                    Registration information and supporting documents are verified.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    3. Fee or Exemption
                  </p>

                  <p className="mt-1 text-slate-500">
                    Complete the applicable registration fee process or approved payment exemption.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    4. Certificate
                  </p>

                  <p className="mt-1 text-slate-500">
                    Approved institutions receive an official registration certificate.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-civic">
                    5. Project Access
                  </p>

                  <p className="mt-1 text-slate-500">
                    Registered institutions can submit and manage projects through JAIMS.
                  </p>
                </div>

              </div>

            </section>
          </>
        )}

      </main>

    </div>
  );
}
        