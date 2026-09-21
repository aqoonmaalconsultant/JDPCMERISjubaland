// 

import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileSearch,
  FileUp,
  Loader2,
  Receipt,
  Search,
  Smartphone,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

const API_BASE_URL =
  "http://localhost:5000/api/v1";

const PAYMENT_PHONE =
  "615726669";

const workflowStages = [
  "Submitted",
  "Document Verification",
  "Awaiting Registration Fee",
  "Payment Verification",
  "Director General Review",
  "Approved",
];

const allowedReceiptTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const MAX_RECEIPT_SIZE =
  10 * 1024 * 1024;

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function getStatusClasses(
  status
) {
  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalizedStatus ===
    "approved"
  ) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (
    normalizedStatus ===
      "submitted" ||
    normalizedStatus ===
      "under review"
  ) {
    return "bg-amber-100 text-amber-800";
  }

  if (
    normalizedStatus ===
    "returned for revision"
  ) {
    return "bg-blue-100 text-blue-800";
  }

  if (
    normalizedStatus ===
      "rejected" ||
    normalizedStatus ===
      "cancelled"
  ) {
    return "bg-red-100 text-red-800";
  }

  return "bg-slate-100 text-slate-700";
}

function getPaymentStatusClasses(
  status
) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "verified"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (
    normalized ===
    "paid"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  if (
    normalized ===
    "rejected"
  ) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function buildProgress(
  application
) {
  const currentStage =
    application?.approvalStage ||
    "Submitted";

  if (
    currentStage ===
    "Rejected"
  ) {
    return workflowStages.map(
      (stage) => ({
        title: stage,
        completed: false,
        current: false,
      })
    );
  }

  const currentStageIndex =
    workflowStages.indexOf(
      currentStage
    );

  return workflowStages.map(
    (stage, index) => ({
      title: stage,

      completed:
        currentStage ===
        "Approved"
          ? true
          : currentStageIndex >=
                0 &&
            index <
              currentStageIndex,

      current:
        currentStage !==
          "Approved" &&
        currentStageIndex ===
          index,
    })
  );
}

function TrackApplicationPage() {
  const [
    applicationNumber,
    setApplicationNumber,
  ] =
    useState("");

  const [
    searchResult,
    setSearchResult,
  ] =
    useState(null);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    isSearching,
    setIsSearching,
  ] =
    useState(false);

  const [
    paymentReference,
    setPaymentReference,
  ] =
    useState("");

  const [
    paymentDate,
    setPaymentDate,
  ] =
    useState("");

  const [
    paymentReceipt,
    setPaymentReceipt,
  ] =
    useState(null);

  const [
    paymentError,
    setPaymentError,
  ] =
    useState("");

  const [
    paymentMessage,
    setPaymentMessage,
  ] =
    useState("");
const [
  showRevisionVerification,
  setShowRevisionVerification,
] =
  useState(false);

const [
  revisionEmail,
  setRevisionEmail,
] =
  useState("");

const [
  revisionPhone,
  setRevisionPhone,
] =
  useState("");

const [
  revisionAccessError,
  setRevisionAccessError,
] =
  useState("");

const [
  revisionAccessMessage,
  setRevisionAccessMessage,
] =
  useState("");

const [
  isVerifyingRevision,
  setIsVerifyingRevision,
] =
  useState(false);

const [
  revisionAccessData,
  setRevisionAccessData,
] =
  useState(null);
  const [
    isSubmittingPayment,
    setIsSubmittingPayment,
  ] =
    useState(false);

  const progressStages =
    useMemo(
      () =>
        buildProgress(
          searchResult
        ),

      [searchResult]
    );

  const registrationFee =
    searchResult
      ?.registrationFee ||
    null;

  const feeAmount =
    Number(
      registrationFee?.amount ??
        500
    );

  const feeCurrency =
    registrationFee?.currency ||
    "USD";

  const revenueCode =
    registrationFee?.revenueCode ||
    "142212";

  const paymentCode =
    `*712*${PAYMENT_PHONE}*${feeAmount}#`;

  const isAwaitingPayment =
    searchResult?.status ===
      "Under Review" &&
    searchResult?.approvalStage ===
      "Awaiting Registration Fee";

  const isPaymentVerification =
    searchResult?.status ===
      "Under Review" &&
    searchResult?.approvalStage ===
      "Payment Verification";

  const loadApplication =
    async (
      normalizedApplicationNumber
    ) => {
      const response =
        await fetch(
          `${API_BASE_URL}/public/organization-applications/${encodeURIComponent(
            normalizedApplicationNumber
          )}`
        );

      let result =
        null;

      try {
        result =
          await response.json();
      } catch {
        result =
          null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to retrieve this application."
        );
      }

      if (!result?.data) {
        throw new Error(
          "Application information was not returned by JAIMS."
        );
      }

      return result.data;
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const normalizedApplicationNumber =
        applicationNumber
          .trim()
          .toUpperCase();

      if (
        !normalizedApplicationNumber
      ) {
        setSearchResult(
          null
        );

        setErrorMessage(
          "Please enter your application number."
        );

        return;
      }

      setIsSearching(true);

      setErrorMessage("");

      setSearchResult(
        null
      );

      setPaymentError("");

      setPaymentMessage("");

      setPaymentReference("");

      setPaymentDate("");

      setPaymentReceipt(
        null
      );
setShowRevisionVerification(
  false
);

setRevisionEmail("");

setRevisionPhone("");

setRevisionAccessError("");

setRevisionAccessMessage("");

setRevisionAccessData(
  null
);
      try {
        const application =
          await loadApplication(
            normalizedApplicationNumber
          );

        setApplicationNumber(
          application.applicationNumber ||
            normalizedApplicationNumber
        );

        setSearchResult(
          application
        );
      } catch (error) {
        setErrorMessage(
          error?.message ||
            "Unable to track the application. Please try again."
        );
      } finally {
        setIsSearching(
          false
        );
      }
    };

  const handleReceiptChange =
    (event) => {
      setPaymentError("");

      const file =
        event.target
          .files?.[0] ||
        null;

      if (!file) {
        setPaymentReceipt(
          null
        );

        return;
      }

      if (
        !allowedReceiptTypes.includes(
          file.type
        )
      ) {
        event.target.value =
          "";

        setPaymentReceipt(
          null
        );

        setPaymentError(
          "Receipt must be a PDF, JPG or PNG file."
        );

        return;
      }

      if (
        file.size >
        MAX_RECEIPT_SIZE
      ) {
        event.target.value =
          "";

        setPaymentReceipt(
          null
        );

        setPaymentError(
          "Payment receipt must not exceed 10 MB."
        );

        return;
      }

      setPaymentReceipt(
        file
      );
    };

 const handlePaymentSubmit =
  async (event) => {
    event.preventDefault();

    if (
      !searchResult
        ?.applicationNumber
    ) {
      return;
    }

    setPaymentError("");

    setPaymentMessage("");

    const normalizedReference =
      paymentReference.trim();

    if (
      !normalizedReference
    ) {
      setPaymentError(
        "Please enter the payment reference or transaction ID."
      );

      return;
    }

    if (!paymentDate) {
      setPaymentError(
        "Please enter the payment date."
      );

      return;
    }

    if (
      !paymentReceipt
    ) {
      setPaymentError(
        "Please attach the payment receipt."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Submit this payment receipt for Ministry review? Please confirm the transaction reference and receipt are correct."
      );

    if (!confirmed) {
      return;
    }

    setIsSubmittingPayment(
      true
    );

    try {
      const submissionData =
        new FormData();

      submissionData.append(
        "paymentReference",
        normalizedReference
      );

      submissionData.append(
        "paymentDate",
        paymentDate
      );

      submissionData.append(
        "receipt",
        paymentReceipt,
        paymentReceipt.name
      );

      const response =
        await fetch(
          `${API_BASE_URL}/public/organization-applications/${encodeURIComponent(
            searchResult.applicationNumber
          )}/payment`,
          {
            method:
              "POST",

            body:
              submissionData,
          }
        );

      let result =
        null;

      try {
        result =
          await response.json();
      } catch {
        result =
          null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to submit payment proof."
        );
      }

      setPaymentMessage(
        result?.message ||
          "Payment proof submitted successfully."
      );

      setPaymentReference("");

      setPaymentDate("");

      setPaymentReceipt(
        null
      );

      const updatedApplication =
        await loadApplication(
          searchResult.applicationNumber
        );

      setSearchResult(
        updatedApplication
      );
    } catch (error) {
      setPaymentError(
        error?.message ||
          "Unable to submit payment proof. Please try again."
      );
    } finally {
      setIsSubmittingPayment(
        false
      );
    }
  };


const handleRevisionAccessSubmit =
  async (event) => {
    event.preventDefault();

    if (
      !searchResult
        ?.applicationNumber
    ) {
      return;
    }

    const normalizedEmail =
      revisionEmail
        .trim()
        .toLowerCase();

    const normalizedPhone =
      revisionPhone.trim();

    setRevisionAccessError("");

    setRevisionAccessMessage("");

    setRevisionAccessData(
      null
    );

    if (!normalizedEmail) {
      setRevisionAccessError(
        "Please enter the applicant email used in the original application."
      );

      return;
    }

    if (!normalizedPhone) {
      setRevisionAccessError(
        "Please enter the applicant phone number used in the original application."
      );

      return;
    }

    setIsVerifyingRevision(
      true
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/public/organization-applications/${encodeURIComponent(
            searchResult.applicationNumber
          )}/revision-access`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                applicantEmail:
                  normalizedEmail,

                applicantPhone:
                  normalizedPhone,
              }),
          }
        );

      let result =
        null;

      try {
        result =
          await response.json();
      } catch {
        result =
          null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to verify applicant information."
        );
      }

      if (!result?.data) {
        throw new Error(
          "Applicant verification succeeded, but application information was not returned."
        );
      }

      setRevisionAccessData(
        result.data
      );

      setRevisionAccessMessage(
        result?.message ||
          "Applicant verified successfully."
      );
    } catch (error) {
      setRevisionAccessError(
        error?.message ||
          "Unable to verify applicant information. Please try again."
      );
    } finally {
      setIsVerifyingRevision(
        false
      );
    }
  };

  return (
    <main className="min-h-[70vh] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <ClipboardList
                size={28}
              />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Track Your
              Application
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Enter the
              application number
              provided after
              submission to view
              the current
              registration status
              and Ministry review
              stage.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={
              handleSubmit
            }
          >
            <label
              htmlFor="applicationNumber"
              className="block text-sm font-semibold text-slate-800"
            >
              Application number
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FileSearch
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="applicationNumber"
                  type="text"
                  value={
                    applicationNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setApplicationNumber(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Example: JAIMS-ORG-2026-000001"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 text-sm uppercase outline-none transition placeholder:normal-case focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <button
                type="submit"
                disabled={
                  isSearching
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {isSearching ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Searching...
                  </>
                ) : (
                  <>
                    <Search
                      size={18}
                    />

                    Search
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm font-medium leading-6 text-red-700">
                    {
                      errorMessage
                    }
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {searchResult && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Application found
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {
                    searchResult.applicationNumber
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {searchResult.applicationType ||
                    "New Registration"}
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                  searchResult.status
                )}`}
              >
                <Clock3
                  size={17}
                />

                {searchResult.status ||
                  "Unknown"}
              </span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">
                  Organization name
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {searchResult.organizationName ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Organization type
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {searchResult.organizationType ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Submitted date
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(
                    searchResult.submittedAt
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Current review
                  stage
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                {
  searchResult.approvalStage ===
  "Director General Review"
    ? "Final Review"
    : searchResult.approvalStage ||
      "—"
}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6">
              <h3 className="font-bold text-slate-900">
                Application
                progress
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                This progress
                reflects the
                current Ministry
                review workflow in
                JAIMS.
              </p>

              <div className="mt-6 space-y-4">
                {progressStages.map(
                  (stage) => (
                    <div
                      key={
  stage.title ===
  "Director General Review"
    ? "Final Review"
    : stage.title
}
                      className="flex items-center gap-3"
                    >
                      {stage.completed ? (
                        <CheckCircle2
                          size={21}
                          className="shrink-0 text-emerald-700"
                        />
                      ) : stage.current ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-50">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
                      )}

                      <span
                        className={
                          stage.completed
                            ? "text-sm font-medium text-slate-900"
                            : stage.current
                              ? "text-sm font-semibold text-amber-700"
                              : "text-sm text-slate-500"
                        }
                      >
                       {
  stage.title ===
  "Director General Review"
    ? "Final Review"
    : stage.title
}

                        {stage.current && (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-wide">
                            Current
                          </span>
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {isAwaitingPayment && (
              <div className="border-t border-amber-200 bg-amber-50 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <Smartphone
                    size={24}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <div>
                    <h3 className="text-lg font-bold text-amber-950">
                      Registration
                      Fee Payment
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Your
                      registration and
                      compliance review
                      has been
                      completed.
                      Please pay the
                      registration fee
                      and submit your
                      payment receipt
                      below for
                      Ministry review.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-amber-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {
                        feeAmount
                      }{" "}
                      {
                        feeCurrency
                      }
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Revenue Code
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {
                        revenueCode
                      }
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment Status
                    </p>

                    <p className="mt-2 text-xl font-bold text-amber-700">
                      {registrationFee?.paymentStatus ||
                        "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-700">
                    Payment instruction
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Use your mobile
                    payment service and
                    dial:
                  </p>

                  <div className="mt-3 rounded-lg bg-slate-900 px-4 py-4 text-center">
                    <p className="break-all font-mono text-xl font-bold tracking-wide text-white sm:text-2xl">
                      {
                        paymentCode
                      }
                    </p>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Confirm the
                    transaction amount
                    and recipient
                    information on your
                    phone before
                    completing the
                    payment.
                  </p>
                </div>

                <form
                  onSubmit={
                    handlePaymentSubmit
                  }
                  className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <Receipt
                      size={22}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                      <h4 className="font-bold text-slate-900">
                        Submit Payment
                        Receipt
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        After payment,
                        enter your
                        transaction
                        information and
                        attach the
                        receipt. The
                        Admin/HR &
                        Finance team
                        will review the
                        payment.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="paymentReference"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Payment /
                        Transaction
                        Reference
                      </label>

                      <input
                        id="paymentReference"
                        type="text"
                        value={
                          paymentReference
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentReference(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Enter transaction ID"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="paymentDate"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Payment date
                      </label>

                      <input
                        id="paymentDate"
                        type="date"
                        value={
                          paymentDate
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentDate(
                            event
                              .target
                              .value
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="paymentReceipt"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Payment receipt
                    </label>

                    <label
                      htmlFor="paymentReceipt"
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50"
                    >
                      <FileUp
                        size={30}
                        className="text-emerald-700"
                      />

                      <span className="mt-3 text-sm font-semibold text-slate-800">
                        {paymentReceipt
                          ? paymentReceipt.name
                          : "Choose payment receipt"}
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        PDF, JPG or PNG
                        — maximum 10 MB
                      </span>
                    </label>

                    <input
                      id="paymentReceipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={
                        handleReceiptChange
                      }
                      className="sr-only"
                    />
                  </div>

                  {paymentError && (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <XCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <p className="text-sm font-medium leading-6 text-red-700">
                          {
                            paymentError
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      isSubmittingPayment
                    }
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:w-auto"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Submitting...
                      </>
                    ) : (
                      <>
                        <Receipt
                          size={18}
                        />

                        Submit for
                        Payment Review
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {isPaymentVerification && (
              <div className="border-t border-blue-200 bg-blue-50 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <Clock3
                    size={24}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />

                  <div className="w-full">
                    <h3 className="text-lg font-bold text-blue-950">
                      Payment
                      Submitted for
                      Review
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Your payment
                      receipt has been
                      submitted
                      successfully and
                      is awaiting
                      verification by
                      the Ministry
                      Admin/HR &
                      Finance team.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment Status
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getPaymentStatusClasses(
                            registrationFee?.paymentStatus
                          )}`}
                        >
                          {registrationFee?.paymentStatus ||
                            "Paid"}
                        </span>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Transaction
                          Reference
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          {registrationFee?.paymentReference ||
                            "—"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          {formatDate(
                            registrationFee?.paymentDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Submitted for
                          Review
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          {formatDateTime(
                            registrationFee?.submittedForReviewAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMessage && (
              <div className="border-t border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={22}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />

                  <p className="text-sm font-medium leading-6 text-emerald-800">
                    {
                      paymentMessage
                    }
                  </p>
                </div>
              </div>
            )}

         {searchResult.status ===
  "Returned for Revision" && (
  <div className="border-t border-blue-200 bg-blue-50 p-6 sm:p-8">

    <p className="font-semibold text-blue-900">
      Revision required
    </p>

    <p className="mt-1 text-sm leading-6 text-blue-800">
      The Ministry has returned this application for revision.
      Please review the reason below and correct the required
      information before resubmitting the application.
    </p>


    {searchResult.revisionReason && (
      <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ministry revision reason
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
          {searchResult.revisionReason}
        </p>

      </div>
    )}


    {searchResult.revisionRequestedAt && (
      <p className="mt-3 text-xs text-blue-700">
        Revision requested:{" "}
        {formatDateTime(
          searchResult.revisionRequestedAt
        )}
      </p>
    )}


    {!showRevisionVerification &&
      !revisionAccessData && (
        <button
          type="button"
          onClick={() => {
            setShowRevisionVerification(
              true
            );

            setRevisionAccessError(
              ""
            );

            setRevisionAccessMessage(
              ""
            );
          }}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <FileSearch
            size={18}
          />

          Correct Application
        </button>
      )}


    {showRevisionVerification &&
      !revisionAccessData && (
        <form
          onSubmit={
            handleRevisionAccessSubmit
          }
          className="mt-6 rounded-xl border border-blue-200 bg-white p-5 sm:p-6"
        >
          <h3 className="font-bold text-slate-900">
            Verify applicant
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Enter the applicant email address and phone number
            used when this application was originally submitted.
          </p>


          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>
              <label
                htmlFor="revisionEmail"
                className="block text-sm font-semibold text-slate-700"
              >
                Applicant email
              </label>

              <input
                id="revisionEmail"
                type="email"
                value={
                  revisionEmail
                }
                onChange={(
                  event
                ) =>
                  setRevisionEmail(
                    event.target.value
                  )
                }
                placeholder="applicant@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>


            <div>
              <label
                htmlFor="revisionPhone"
                className="block text-sm font-semibold text-slate-700"
              >
                Applicant phone
              </label>

              <input
                id="revisionPhone"
                type="text"
                value={
                  revisionPhone
                }
                onChange={(
                  event
                ) =>
                  setRevisionPhone(
                    event.target.value
                  )
                }
                placeholder="+252 ..."
                autoComplete="tel"
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

          </div>


          {revisionAccessError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

              <div className="flex items-start gap-3">
                <XCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <p className="text-sm font-medium leading-6 text-red-700">
                  {revisionAccessError}
                </p>
              </div>

            </div>
          )}


          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={
                isVerifyingRevision
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isVerifyingRevision ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={18}
                  />

                  Verify & Continue
                </>
              )}
            </button>


            <button
              type="button"
              onClick={() => {
                setShowRevisionVerification(
                  false
                );

                setRevisionAccessError(
                  ""
                );

                setRevisionEmail(
                  ""
                );

                setRevisionPhone(
                  ""
                );
              }}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>
      )}


   {revisionAccessData && (
  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">

    <div className="flex items-start gap-3">

      <CheckCircle2
        size={22}
        className="mt-0.5 shrink-0 text-emerald-700"
      />

      <div className="w-full">
        <p className="font-semibold text-emerald-900">
          Applicant verified
        </p>

        <p className="mt-1 text-sm leading-6 text-emerald-800">
          {revisionAccessMessage ||
            "Your applicant information has been verified successfully."}
        </p>

        <p className="mt-2 text-sm text-emerald-800">
          Application:{" "}
          <span className="font-semibold">
            {
              revisionAccessData.applicationNumber
            }
          </span>
        </p>

        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(
              "jaims-organization-revision-v1",
              JSON.stringify({
                application:
                  revisionAccessData,

                revisionAccessEmail:
                  revisionEmail
                    .trim()
                    .toLowerCase(),

                revisionAccessPhone:
                  revisionPhone.trim(),
              })
            );

            window.location.href =
              "/organizations/register";
          }}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <FileSearch
            size={18}
          />

          Continue to Correct Application
        </button>
      </div>

    </div>

  </div>
)}

  </div>
)}


{searchResult.status ===
  "Rejected" && (
  <div className="border-t border-red-200 bg-red-50 p-6">

    <p className="font-semibold text-red-900">
      Application rejected
    </p>

    <p className="mt-1 text-sm leading-6 text-red-800">
      This application has completed review and was not
      approved. Contact the Ministry if further clarification
      is required.
    </p>

  </div>
)}


{searchResult.status ===
  "Approved" && (
  <div className="border-t border-emerald-200 bg-emerald-50 p-6">

    <div className="flex items-start gap-3">

      <CheckCircle2
        size={22}
        className="mt-0.5 shrink-0 text-emerald-700"
      />

      <div>
        <p className="font-semibold text-emerald-900">
          Application approved
        </p>

        <p className="mt-1 text-sm leading-6 text-emerald-800">
          The Ministry has approved this organization
          registration application.
        </p>
      </div>

    </div>

    </div>
)}

          </div>
        )}
      </section>
    </main>
  );
}

export default TrackApplicationPage;