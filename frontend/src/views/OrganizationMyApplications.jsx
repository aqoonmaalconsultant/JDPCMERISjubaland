import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  LoaderCircle,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  organizationApi,
} from '../api/organizationClient.js';


function formatMoney(
  amount,
  currency = 'USD'
) {
  const numericAmount =
    Number(amount || 0);

  if (
    currency === 'USD'
  ) {
    return `$${numericAmount.toFixed(
      2
    )}`;
  }

  return `${numericAmount.toFixed(
    2
  )} ${currency}`;
}


function getPaymentDisplay(
  application
) {
  const registrationFee =
    application?.registrationFee;

  if (
    !registrationFee
  ) {
    return {
      status:
        'Not available',

      amount:
        'Not available',

      required:
        'Not available',
    };
  }

  const isExempt =
    registrationFee.paymentStatus ===
      'Exempt' ||
    registrationFee.paymentRequired ===
      false;

  if (
    isExempt
  ) {
    return {
      status:
        'Exempt',

      amount:
        '$0.00',

      required:
        'No',
    };
  }

  return {
    status:
      registrationFee.paymentStatus ||
      'Pending',

    amount:
      formatMoney(
        registrationFee.amount,
        registrationFee.currency ||
          'USD'
      ),

    required:
      registrationFee.paymentRequired ===
      false
        ? 'No'
        : 'Yes',
  };
}


export default function OrganizationMyApplications() {
  const navigate =
    useNavigate();

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    certificateLoading,
    setCertificateLoading,
  ] = useState('');


  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        setLoading(true);
        setError('');

        const response =
          await organizationApi.get(
            '/organization-portal/applications'
          );

        if (!active) {
          return;
        }

        setApplications(
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : []
        );

      } catch (
        requestError
      ) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data
            ?.message ||
            'Unable to load your applications.'
        );

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      active = false;
    };
  }, []);


  const handleViewCertificate =
    async (
      application
    ) => {
      try {
        setCertificateLoading(
          `view-${application._id}`
        );

        setError('');

        const response =
          await organizationApi.get(
            `/organization-portal/applications/${application._id}/certificate`,
            {
              responseType:
                'blob',
            }
          );

        const pdfBlob =
          new Blob(
            [
              response.data,
            ],
            {
              type:
                response.headers[
                  'content-type'
                ] ||
                'application/pdf',
            }
          );

        const fileUrl =
          window.URL.createObjectURL(
            pdfBlob
          );

        window.open(
          fileUrl,
          '_blank',
          'noopener,noreferrer'
        );

        window.setTimeout(
          () => {
            window.URL.revokeObjectURL(
              fileUrl
            );
          },
          60000
        );

      } catch (
        requestError
      ) {
        setError(
          requestError.response?.data
            ?.message ||
            'Unable to open the certificate.'
        );

      } finally {
        setCertificateLoading(
          ''
        );
      }
    };


  const handleDownloadCertificate =
    async (
      application
    ) => {
      try {
        setCertificateLoading(
          `download-${application._id}`
        );

        setError('');

        const response =
          await organizationApi.get(
            `/organization-portal/applications/${application._id}/certificate/download`,
            {
              responseType:
                'blob',
            }
          );

        const pdfBlob =
          new Blob(
            [
              response.data,
            ],
            {
              type:
                response.headers[
                  'content-type'
                ] ||
                'application/pdf',
            }
          );

        const fileUrl =
          window.URL.createObjectURL(
            pdfBlob
          );

        const link =
          document.createElement(
            'a'
          );

        link.href =
          fileUrl;

        link.download =
          `${application.organizationName || 'organization'}-certificate.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          fileUrl
        );

      } catch (
        requestError
      ) {
        setError(
          requestError.response?.data
            ?.message ||
            'Unable to download the certificate.'
        );

      } finally {
        setCertificateLoading(
          ''
        );
      }
    };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/public/organization/dashboard'
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >

            <ArrowLeft
              size={17}
            />

            Dashboard

          </button>


          <div>

            <h1 className="text-lg font-bold">
              My Applications
            </h1>

            <p className="text-sm text-slate-500">
              Organization Registration Portal
            </p>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">

                <FileText
                  size={20}
                />

              </div>


              <div>

                <h2 className="font-bold">
                  Registration Applications
                </h2>

                <p className="text-sm text-slate-500">
                  Applications submitted from this organization account.
                </p>

              </div>

            </div>

          </div>


          {loading ? (

            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">

              <LoaderCircle
                className="animate-spin"
                size={20}
              />

              Loading applications...

            </div>

          ) : error ? (

            <div className="px-6 py-12 text-center">

              <p className="font-semibold text-red-700">
                Unable to load applications
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

            </div>

          ) : applications.length ===
            0 ? (

            <div className="px-6 py-16 text-center">

              <FileText
                className="mx-auto text-slate-400"
                size={32}
              />

              <h3 className="mt-4 font-bold">
                No applications found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Applications submitted from this account will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      JAIMS No.
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Organization
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stage
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registration Fee
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Certificate
                    </th>

                  </tr>

                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">

                  {applications.map(
                    (application) => {

                      const payment =
                        getPaymentDisplay(
                          application
                        );

                      return (

                        <tr
                          key={
                            application._id ||
                            application.applicationNumber
                          }
                        >

                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-civic">

                            {
                              application.applicationNumber
                            }

                          </td>


                          <td className="px-6 py-4 text-sm text-slate-700">

                            {
                              application.organizationName
                            }

                          </td>


                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">

                            {
                              application.applicationType
                            }

                          </td>


                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">

                            {
                              application.approvalStage ===
                              'Director General Review'
                                ? 'Final Review'
                                : application.approvalStage
                            }

                          </td>


                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-700">

                            {
                              application.status
                            }

                          </td>


                          <td className="px-6 py-4">

                            <div className="min-w-[150px] text-sm">

                              <div className="flex items-center justify-between gap-4">

                                <span className="text-slate-500">
                                  Status
                                </span>

                                <span
                                  className={
                                    payment.status ===
                                    'Exempt'
                                      ? 'font-semibold text-emerald-700'
                                      : 'font-semibold text-slate-700'
                                  }
                                >

                                  {
                                    payment.status
                                  }

                                </span>

                              </div>


                              <div className="mt-1 flex items-center justify-between gap-4">

                                <span className="text-slate-500">
                                  Amount
                                </span>

                                <span className="font-semibold text-slate-700">

                                  {
                                    payment.amount
                                  }

                                </span>

                              </div>


                              <div className="mt-1 flex items-center justify-between gap-4">

                                <span className="text-slate-500">
                                  Required
                                </span>

                                <span className="font-semibold text-slate-700">

                                  {
                                    payment.required
                                  }

                                </span>

                              </div>

                            </div>

                          </td>


                          <td className="whitespace-nowrap px-6 py-4">

                            {
                              application.status ===
                              'Approved' ? (

                                <div className="flex items-center gap-2">

                                  <button
                                    type="button"
                                    disabled={
                                      certificateLoading ===
                                      `view-${application._id}`
                                    }
                                    onClick={() =>
                                      handleViewCertificate(
                                        application
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-civic hover:text-civic disabled:cursor-not-allowed disabled:opacity-50"
                                  >

                                    {
                                      certificateLoading ===
                                      `view-${application._id}`
                                        ? (

                                          <LoaderCircle
                                            size={15}
                                            className="animate-spin"
                                          />

                                        )
                                        : (

                                          <Eye
                                            size={15}
                                          />

                                        )
                                    }

                                    View

                                  </button>


                                  <button
                                    type="button"
                                    disabled={
                                      certificateLoading ===
                                      `download-${application._id}`
                                    }
                                    onClick={() =>
                                      handleDownloadCertificate(
                                        application
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-civic px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                  >

                                    {
                                      certificateLoading ===
                                      `download-${application._id}`
                                        ? (

                                          <LoaderCircle
                                            size={15}
                                            className="animate-spin"
                                          />

                                        )
                                        : (

                                          <Download
                                            size={15}
                                          />

                                        )
                                    }

                                    Download

                                  </button>

                                </div>

                              )
                              : (

                                <span className="text-xs text-slate-400">
                                  Available after approval
                                </span>

                              )
                            }

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}