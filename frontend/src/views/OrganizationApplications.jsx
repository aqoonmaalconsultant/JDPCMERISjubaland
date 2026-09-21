import {
  useMemo,
  useState,
} from 'react';

import {
  CheckCircle,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import {
  useNGOApplications,
  useNGOApplication,
  useStartNGOApplicationReview,
  useCompleteDocumentVerification,
  useReturnNGOApplicationForRevision,
  useCompleteRegistrationReview,
  useApproveNGOApplicationByDirectorGeneral,
  useVerifyNGOPayment,
  useGenerateNGOCertificate,
  useDownloadNGOCertificate,
  useRegenerateNGOCertificate,
  viewNGOApplicationDocument,
  downloadNGOApplicationDocument,
  viewNGOApplicationPaymentReceipt,
  downloadNGOApplicationPaymentReceipt,
} from '../api/organizationApplications.js';

import {
  StatusBadge,
} from '../ui/StatusBadge.jsx';

import {
  MetricCard,
} from '../ui/MetricCard.jsx';


function formatDate(
  value
) {
  if (!value) {
    return 'N/A';
  }

  return new Date(
    value
  ).toLocaleDateString();
}


const NEW_REGISTRATION_REQUIRED_DOCUMENTS =
  [
    {
      documentType:
        'constitution',

      label:
        'Constitution',
    },

    {
      documentType:
        'organizationProfile',

      label:
        'Organization Profile',
    },

    {
      documentType:
        'leadershipList',

      label:
        'Leadership List',
    },
  ];


const RENEWAL_REQUIRED_DOCUMENTS =
  [
    {
      documentType:
        'registrationCertificate',

      label:
        'Previous Registration Certificate',
    },
  ];

function OrganizationApplications() {

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null);

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    actionError,
    setActionError,
  ] = useState('');

  const [
    approvedNGO,
    setApprovedNGO,
  ] = useState(null);

  const [
    documentReviewConfirmed,
    setDocumentReviewConfirmed,
  ] = useState(false);

  const [
    registrationReviewConfirmed,
    setRegistrationReviewConfirmed,
  ] = useState(false);

  const [
    documentActionKey,
    setDocumentActionKey,
  ] = useState('');


  const {
    data,
    isLoading,
    refetch,
  } =
    useNGOApplications();


  const selectedApplicationId =
    selectedApplication?.id ||
    selectedApplication?.rawId ||
    selectedApplication?._id ||
    null;


  const {
    data: selectedApplicationDetails,
    isLoading: isApplicationLoading,
    isError: isApplicationError,
    error: applicationLoadError,
  } =
    useNGOApplication(
      selectedApplicationId,
      {
        enabled:
          Boolean(
            selectedApplicationId
          ),
      }
    );


  const currentApplication =
    selectedApplicationDetails ||
    selectedApplication;


  const startReviewMutation =
    useStartNGOApplicationReview();

  const completeDocumentVerificationMutation =
    useCompleteDocumentVerification();

  const returnForRevisionMutation =
    useReturnNGOApplicationForRevision();

  const completeRegistrationReviewMutation =
    useCompleteRegistrationReview();

  const approveMutation =
    useApproveNGOApplicationByDirectorGeneral();

  const verifyPaymentMutation =
    useVerifyNGOPayment();

  const generateCertificateMutation =
    useGenerateNGOCertificate();

  const downloadCertificateMutation =
    useDownloadNGOCertificate();

  const regenerateCertificateMutation =
    useRegenerateNGOCertificate();


  const applications =
    data?.items || [];


  const supportingDocuments =
    Array.isArray(
      currentApplication?.supportingDocuments
    )
      ? currentApplication.supportingDocuments
      : [];


  const requiredDocuments =
    currentApplication
      ?.applicationType ===
    'Renewal'
      ? RENEWAL_REQUIRED_DOCUMENTS
      : NEW_REGISTRATION_REQUIRED_DOCUMENTS;


  const requiredDocumentRows =
    requiredDocuments.map(
      (requiredDocument) => {

        const uploadedDocument =
          supportingDocuments.find(
            (document) =>
              document.documentType ===
              requiredDocument.documentType
          );

        return {
          ...requiredDocument,

          document:
            uploadedDocument ||
            null,
        };
      }
    );


  const missingRequiredDocuments =
    requiredDocumentRows.filter(
      (item) =>
        !item.document
    );


  const filteredApplications =
    useMemo(
      () => {

        if (!search) {
          return applications;
        }

        return applications.filter(
          (item) =>
            item.organizationName
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );

      },
      [
        applications,
        search,
      ]
    );


  function clearActionState() {

    setActionMessage('');

    setActionError('');
  }


  function closeModal() {

    setSelectedApplication(
      null
    );

    setApprovedNGO(
      null
    );

    setDocumentReviewConfirmed(
      false
    );

    setRegistrationReviewConfirmed(
      false
    );

    setDocumentActionKey(
      ''
    );

    clearActionState();
  }


  async function handlePaymentVerification(
    applicationId
  ) {

    clearActionState();

    try {

      await verifyPaymentMutation.mutateAsync(
        {
          applicationId,

          paymentReference:
            currentApplication
              ?.registrationFee
              ?.paymentReference ||
            '',
        }
      );

      setActionMessage(
        'Registration fee payment verified successfully.'
      );

      await refetch();

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to verify payment.'
      );

    }
  }


  async function handleStartReview() {

    if (
      !currentApplication ||
      !selectedApplicationId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Start review of ${currentApplication.organizationName}?`
      );

    if (!confirmed) {
      return;
    }

    clearActionState();

    try {

      await startReviewMutation.mutateAsync(
        selectedApplicationId
      );

      setActionMessage(
        'Application review started successfully. The application is now at Document Verification.'
      );

      await refetch();

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to start application review.'
      );

    }
  }


  async function handleViewSupportingDocument(
    documentType
  ) {

    if (
      !selectedApplicationId ||
      !documentType
    ) {
      return;
    }

    clearActionState();

    setDocumentActionKey(
      `view:${documentType}`
    );

    try {

      await viewNGOApplicationDocument(
        selectedApplicationId,
        documentType
      );

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to open supporting document.'
      );

    } finally {

      setDocumentActionKey('');

    }
  }


  async function handleDownloadSupportingDocument(
    document
  ) {

    if (
      !selectedApplicationId ||
      !document?.documentType
    ) {
      return;
    }

    clearActionState();

    setDocumentActionKey(
      `download:${document.documentType}`
    );

    try {

      await downloadNGOApplicationDocument(
        selectedApplicationId,
        document.documentType,
        document.fileName ||
          `${document.documentType}-document`
      );

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to download supporting document.'
      );

    } finally {

      setDocumentActionKey('');

    }
  }


  /*
   * PAYMENT RECEIPT
   * View the receipt submitted by the applicant.
   */
  async function handleViewPaymentReceipt() {

    if (
      !selectedApplicationId
    ) {
      return;
    }

    clearActionState();

    setDocumentActionKey(
      'view:payment-receipt'
    );

    try {

      await viewNGOApplicationPaymentReceipt(
        selectedApplicationId
      );

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to open payment receipt.'
      );

    } finally {

      setDocumentActionKey('');

    }
  }


  /*
   * PAYMENT RECEIPT
   * Download the receipt submitted by the applicant.
   */
  async function handleDownloadPaymentReceipt() {

    if (
      !selectedApplicationId
    ) {
      return;
    }

    clearActionState();

    setDocumentActionKey(
      'download:payment-receipt'
    );

    try {

      await downloadNGOApplicationPaymentReceipt(
        selectedApplicationId,
        `payment-receipt-${
          currentApplication
            ?.applicationNumber ||
          'application'
        }`
      );

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to download payment receipt.'
      );

    } finally {

      setDocumentActionKey('');

    }
  }


  async function handleCompleteDocumentVerification(
    paymentDecision
  ) {

    if (
      !currentApplication ||
      !selectedApplicationId
    ) {
      return;
    }

    if (
      missingRequiredDocuments.length
    ) {

      setActionError(
        'Document verification cannot be completed because one or more required supporting documents are missing.'
      );

      return;
    }

    if (
      !documentReviewConfirmed ||
      !registrationReviewConfirmed
    ) {

      setActionError(
        'Confirm that you have reviewed both the required supporting documents and the organization registration information before completing document verification.'
      );

      return;
    }

    if (
      ![
        'payment',
        'exempt',
      ].includes(
        paymentDecision
      )
    ) {

      setActionError(
        'Choose whether this application should proceed to payment or receive a payment exemption.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        paymentDecision ===
          'exempt'
          ? `Submit ${currentApplication.organizationName} with payment exemption and move it to Final Review?`
          : `Submit ${currentApplication.organizationName} for registration fee payment?`
      );

    if (!confirmed) {
      return;
    }

    clearActionState();

    try {

      await completeDocumentVerificationMutation.mutateAsync(
        {
          applicationId:
            selectedApplicationId,

          paymentDecision,
        }
      );

      setDocumentReviewConfirmed(
        false
      );

      setRegistrationReviewConfirmed(
        false
      );


      setActionMessage(
        paymentDecision ===
          'exempt'
          ? 'Document verification completed successfully. Payment has been exempted and the application is now awaiting Final Review.'
          : 'Document verification completed successfully. The application is now awaiting the registration fee.'
      );

      await refetch();

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to complete document verification.'
      );

    }
  }


  async function handleReturnForRevision() {

    if (
      !currentApplication ||
      !selectedApplicationId
    ) {
      return;
    }

    clearActionState();

    const reason =
      window.prompt(
        'Enter the reason for returning this application to the applicant for revision:'
      );

    if (
      !reason?.trim()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Return this application to the applicant for revision?'
      );

    if (!confirmed) {
      return;
    }

    try {

      await returnForRevisionMutation.mutateAsync(
        {
          applicationId:
            selectedApplicationId,

          reason:
            reason.trim(),
        }
      );

      setDocumentReviewConfirmed(
        false
      );

      setRegistrationReviewConfirmed(
        false
      );

      setActionMessage(
        'Application returned to the applicant for revision successfully.'
      );

      await refetch();

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to return application for revision.'
      );

    }
  }


  async function handleCompleteRegistrationReview() {

    if (
      !currentApplication ||
      !selectedApplicationId
    ) {
      return;
    }

    if (
      !registrationReviewConfirmed
    ) {

      setActionError(
        'Confirm that you have reviewed the organization registration and compliance information before completing this stage.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Complete registration and compliance review for ${currentApplication.organizationName}?`
      );

    if (!confirmed) {
      return;
    }

    clearActionState();

    try {

      await completeRegistrationReviewMutation.mutateAsync(
        selectedApplicationId
      );

      setRegistrationReviewConfirmed(
        false
      );

      setActionMessage(
        'Registration and compliance review completed successfully. The application is now awaiting the registration fee.'
      );

      await refetch();

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to complete registration and compliance review.'
      );

    }
  }


  async function handleDirectorGeneralApproval() {

    if (
      !currentApplication ||
      !selectedApplicationId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Approve registration of ${currentApplication.organizationName}?`
      );

    if (!confirmed) {
      return;
    }

    clearActionState();

    try {

      const result =
        await approveMutation.mutateAsync(
          selectedApplicationId
        );

      /*
       * Backend returns the registered organization.
       * Extract the NGO ID for certificate generation.
       */

      const ngoId =
        result.organization?._id ||
        result.organization?.id ||
        result.application?.existingNGO?._id ||
        result.application?.existingNGO ||
        null;


      if (!ngoId) {

        throw new Error(
          'Organization approved but registered NGO ID was not returned.'
        );

      }


      let certificate = null;


      try {

        const certificateResult =
          await generateCertificateMutation.mutateAsync(
            ngoId
          );

        certificate =
          certificateResult?.data ||
          certificateResult?.certificate ||
          certificateResult ||
          null;

      } catch (
        certificateError
      ) {

        /*
         * 409 means certificate already exists.
         * This is acceptable.
         */

        if (
          certificateError
            ?.response
            ?.status !== 409
        ) {

          throw certificateError;

        }

      }


      setApprovedNGO({

        _id:
          ngoId,

        id:
          ngoId,

        ...(result.organization || {}),

        certificate,

      });


      setActionMessage(
        'Organization approved successfully. Registration certificate generated.'
      );


      await refetch();


    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to approve organization registration.'
      );

    }

  }


  async function handleDownloadCertificate() {

    if (
      !approvedNGO?._id
    ) {
      return;
    }


    try {

      await downloadCertificateMutation.mutateAsync(
        approvedNGO._id
      );

    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to download certificate.'
      );

    }

  }


  async function handleRegenerateCertificate() {

    if (
      !approvedNGO?._id
    ) {
      return;
    }


    try {

      const result =
        await regenerateCertificateMutation.mutateAsync(
          approvedNGO._id
        );


      setApprovedNGO(
        (previous) => ({
          ...previous,

          certificate:
            result?.data ||
            result,
        })
      );


      setActionMessage(
        'Certificate regenerated successfully.'
      );


    } catch (error) {

      setActionError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to regenerate certificate.'
      );

    }

  }


  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight">
            Organization Registration Applications
          </h1>

          <p className="text-gray-500">
            Review and manage organization registration applications and approval workflow.
          </p>

        </div>


        <div className="flex items-center gap-2">

          <Search size={18}/>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search organization..."
            className="border rounded-lg px-3 py-2"
          />

        </div>

      </div>


      {actionMessage && (

        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">

          {actionMessage}

        </div>

      )}


      {actionError && (

        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">

          {actionError}

        </div>

      )}


      {approvedNGO && (

        <div className="border rounded-xl bg-white shadow-sm p-5">

          <div className="flex justify-between items-start">

            <div>

              <h2 className="font-bold text-lg flex items-center gap-2">

                <CheckCircle
                  className="text-green-600"
                />

                Registration Certificate Ready

              </h2>


              <p className="text-gray-600 mt-1">

                {approvedNGO.organizationName}

              </p>


              <p className="text-sm text-gray-500">

                Registration Number:
                {' '}
                {
                  approvedNGO.registrationNumber ||
                  'Generated'
                }

              </p>

            </div>


            <FileText
              className="text-blue-600"
              size={36}
            />

          </div>


          <div className="flex gap-3 mt-5 flex-wrap">

            <button

              onClick={() =>
                window.open(
                  `http://localhost:5000/api/v1/ngos/${approvedNGO._id}/certificate`,
                  '_blank'
                )
              }

              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"

            >

              <Eye size={16}/>

              View Certificate

            </button>


            <button

              onClick={
                handleDownloadCertificate
              }

              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"

            >

              <Download size={16}/>

              Download Certificate

            </button>


            <button

              onClick={
                handleRegenerateCertificate
              }

              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg"

            >

              <RefreshCw size={16}/>

              Regenerate

            </button>

          </div>

        </div>

      )}


      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                Organization
              </th>
               <th className="p-3 text-left">
                Registration
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Action
              </th>

            </tr>

          </thead>


          <tbody>
                        {filteredApplications.map(
              (application) => (

                <tr
                  key={
                    application.id ||
                    application.rawId ||
                    application._id
                  }

                  className="border-t"
                >

                  <td className="p-3">

                    <div className="font-medium">

                      {
                        application.organizationName
                      }

                    </div>


                    <div className="text-sm text-gray-500">

                      {
                        application.organizationType
                      }

                    </div>

                  </td>


                  <td className="p-3">

                    {
                      application.applicationNumber
                    }

                  </td>


                  <td className="p-3">

                    <StatusBadge

                      status={
                        application.status
                      }

                    />

                  </td>


                  <td className="p-3">

                    {
                      formatDate(
                        application.createdAt
                      )
                    }

                  </td>


                  <td className="p-3">

                    <button

                      onClick={() => {

                        setDocumentReviewConfirmed(
                          false
                        );

                        setRegistrationReviewConfirmed(
                          false
                        );

                        setDocumentActionKey('');

                        setSelectedApplication(
                          application
                        );

                      }}

                      className="text-blue-600"

                    >

                      View

                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {selectedApplication && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center p-5 border-b">

              <div>

                <h2 className="text-xl font-bold">

                  Application Review

                </h2>


                <p className="text-gray-500">

                  {
                    currentApplication?.organizationName
                  }

                </p>

              </div>


              <button

                onClick={
                  closeModal
                }

              >

                <X />

              </button>

            </div>


            <div className="p-5 space-y-4">

              {isApplicationError && (

                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">

                  {
                    applicationLoadError
                      ?.response
                      ?.data
                      ?.message ||
                    applicationLoadError
                      ?.message ||
                    'Unable to load the complete application details.'
                  }

                </div>

              )}


              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="text-sm text-gray-500">
                    Organization Type
                  </label>


                  <p className="font-medium">

                    {
                      currentApplication?.organizationType ||
                      'N/A'
                    }

                  </p>

                </div>


                <div>

                  <label className="text-sm text-gray-500">
                    Application Number
                  </label>


                  <p className="font-medium">

                    {
                      currentApplication?.applicationNumber
                    }

                  </p>

                </div>


                <div>

                  <label className="text-sm text-gray-500">
                    Status
                  </label>


                  <StatusBadge

                    status={
                      currentApplication?.status
                    }

                  />

                </div>


                <div>

                  <label className="text-sm text-gray-500">
                    Approval Stage
                  </label>


                  <p className="font-medium">

                    {
                      isApplicationLoading
                        ? 'Loading...'
                        :
                        (
                          currentApplication
                            ?.approvalStage ===
                            'Director General Review'
                            ? 'Final Review'
                            :
                            (
                              currentApplication
                                ?.approvalStage ||
                              'N/A'
                            )
                        )
                    }

                  </p>

                </div>


                <div>

                  <label className="text-sm text-gray-500">
                    Submitted
                  </label>


                  <p>

                    {
                      formatDate(
                        currentApplication?.createdAt
                      )
                    }

                  </p>

                </div>

              </div>


              {
                !isApplicationLoading &&
                currentApplication
                  ?.approvalStage ===
                  'Document Verification' && (

                  <div className="border rounded-lg p-4 bg-white">

                    <div className="mb-4">

                      <h3 className="font-semibold text-lg">

                        Supporting Documents Review

                      </h3>

                      <p className="text-sm text-gray-500 mt-1">

                        Open and review each required document before completing document verification.

                      </p>

                    </div>


                    <div className="space-y-3">

                      {
                        requiredDocumentRows.map(
                          (item) => (

                            <div
                              key={
                                item.documentType
                              }
                              className="border rounded-lg p-3 flex items-center justify-between gap-4"
                            >

                              <div className="min-w-0">

                                <div className="font-medium">

                                  {item.label}

                                </div>

                                {
                                  item.document
                                    ? (

                                      <div className="text-sm text-gray-500 truncate mt-1">

                                        {
                                          item.document.fileName ||
                                          'Uploaded document'
                                        }

                                      </div>

                                    )
                                    : (

                                      <div className="text-sm text-red-600 mt-1">

                                        Required document missing

                                      </div>

                                    )
                                }

                              </div>


                              {
                                item.document && (

                                  <div className="flex items-center gap-2 flex-shrink-0">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleViewSupportingDocument(
                                          item.documentType
                                        )
                                      }
                                      disabled={
                                        documentActionKey ===
                                        `view:${item.documentType}`
                                      }
                                      className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                                    >

                                      <Eye size={15}/>

                                      {
                                        documentActionKey ===
                                        `view:${item.documentType}`
                                          ? 'Opening...'
                                          : 'View'
                                      }

                                    </button>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownloadSupportingDocument(
                                          item.document
                                        )
                                      }
                                      disabled={
                                        documentActionKey ===
                                        `download:${item.documentType}`
                                      }
                                      className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                                    >

                                      <Download size={15}/>

                                      {
                                        documentActionKey ===
                                        `download:${item.documentType}`
                                          ? 'Downloading...'
                                          : 'Download'
                                      }

                                    </button>

                                  </div>

                                )
                              }

                            </div>

                          )
                        )
                      }

                    </div>


                    {
                      missingRequiredDocuments.length > 0 && (

                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">

                          Document verification cannot be completed until all required supporting documents are available.

                        </div>

                      )
                    }


                    {
                      missingRequiredDocuments.length === 0 && (

                        <label className="mt-4 flex items-start gap-3 p-3 border rounded-lg bg-gray-50 cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              documentReviewConfirmed
                            }
                            onChange={
                              (event) =>
                                setDocumentReviewConfirmed(
                                  event.target.checked
                                )
                            }
                            className="mt-1"
                          />

                          <span className="text-sm">

                            I confirm that I have reviewed all required supporting documents and they are complete for this stage.

                          </span>

                        </label>

                      )
                    }

                  </div>

                )
              }


              {
                !isApplicationLoading &&
                [
                  'Document Verification',
                  'Registration Review',
                ].includes(
                  currentApplication?.approvalStage
                ) && (

                  <div className="border rounded-lg p-4 bg-white">

                    <div className="mb-4">

                      <h3 className="font-semibold text-lg">

                        Registration / Compliance Review

                      </h3>

                      <p className="text-sm text-gray-500 mt-1">

                        Review the organization registration and compliance information together with the supporting documents before completing Document Verification.

                      </p>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="border rounded-lg p-3">

                        <div className="text-sm text-gray-500">
                          Organization Name
                        </div>

                        <div className="font-medium mt-1">

                          {
                            currentApplication
                              ?.organizationName ||
                            'N/A'
                          }

                        </div>

                      </div>


                      <div className="border rounded-lg p-3">

                        <div className="text-sm text-gray-500">
                          Organization Type
                        </div>

                        <div className="font-medium mt-1">

                          {
                            currentApplication
                              ?.organizationType ||
                            'N/A'
                          }

                        </div>

                      </div>


                      <div className="border rounded-lg p-3">

                        <div className="text-sm text-gray-500">
                          Establishment Date
                        </div>

                        <div className="font-medium mt-1">

                          {
                            formatDate(
                              currentApplication
                                ?.establishmentDate
                            )
                          }

                        </div>

                      </div>


                      <div className="border rounded-lg p-3">

                        <div className="text-sm text-gray-500">
                          Registration Country
                        </div>

                        <div className="font-medium mt-1">

                          {
                            currentApplication
                              ?.registrationCountry ||
                            'N/A'
                          }

                        </div>

                      </div>


                      <div className="border rounded-lg p-3">

                        <div className="text-sm text-gray-500">
                          Applicant
                        </div>

                        <div className="font-medium mt-1">

                          {
                            currentApplication
                              ?.applicant
                              ?.fullName ||
                            'N/A'
                          }

                        </div>

                        <div className="text-sm text-gray-500 mt-1">

                          {
                            currentApplication
                              ?.applicant
                              ?.email ||
                            'No email'
                          }

                        </div>

                        <div className="text-sm text-gray-500">

                          {
                            currentApplication
                              ?.applicant
                              ?.phone ||
                            'No phone'
                          }

                        </div>

                      </div>


                      <div className="border rounded-lg p-3">

                        <div className="text-sm text-gray-500">
                          Organization Contact
                        </div>

                        <div className="font-medium mt-1">

                          {
                            currentApplication
                              ?.organizationContact
                              ?.email ||
                            'N/A'
                          }

                        </div>

                        <div className="text-sm text-gray-500 mt-1">

                          {
                            currentApplication
                              ?.organizationContact
                              ?.phone ||
                            'No phone'
                          }

                        </div>

                        <div className="text-sm text-gray-500">

                          {
                            currentApplication
                              ?.organizationContact
                              ?.address ||
                            'No address'
                          }

                        </div>

                      </div>

                    </div>


                    <label className="mt-4 flex items-start gap-3 p-3 border rounded-lg bg-gray-50 cursor-pointer">

                      <input
                        type="checkbox"
                        checked={
                          registrationReviewConfirmed
                        }
                        onChange={
                          (event) =>
                            setRegistrationReviewConfirmed(
                              event.target.checked
                            )
                        }
                        className="mt-1"
                      />

                      <span className="text-sm">

                        I confirm that I have reviewed the organization registration and compliance information and it is complete for this stage.

                      </span>

                    </label>

                  </div>

                )
              }


              {
                !isApplicationLoading &&
                [
                  'Awaiting Registration Fee',
                  'Payment Verification',
                  'Director General Review',
                  'Approved',
                ].includes(
                  currentApplication
                    ?.approvalStage
                ) && (

                  <div className="border rounded-lg p-4 bg-gray-50">

                    <h3 className="font-semibold mb-3">
                      Registration Fee
                    </h3>


                    <p>
                      Payment Status:{' '}

                      <span className="font-medium">
                        {
                          currentApplication
                            ?.registrationFee
                            ?.paymentStatus ||
                          'Not available'
                        }
                      </span>
                    </p>


                    <p className="mt-2">
                      Amount Due:{' '}

                      <span className="font-medium">
                        {
                          currentApplication
                            ?.registrationFee
                            ?.paymentStatus ===
                          'Exempt'
                            ? '$0.00'
                            : `$${Number(
                                currentApplication
                                  ?.registrationFee
                                  ?.amount || 0
                              ).toFixed(2)}`
                        }
                      </span>
                    </p>


                    <p className="mt-2">
                      Payment Required:{' '}

                      <span className="font-medium">
                        {
                          currentApplication
                            ?.registrationFee
                            ?.paymentRequired ===
                          false
                            ? 'No'
                            : 'Yes'
                        }
                      </span>
                    </p>


                    {
                      currentApplication
                        ?.registrationFee
                        ?.paymentReference && (

                        <p className="mt-2">

                          Transaction Reference:{' '}

                          <span className="font-medium">
                            {
                              currentApplication
                                .registrationFee
                                .paymentReference
                            }
                          </span>

                        </p>

                      )
                    }


                    {
                      currentApplication
                        ?.registrationFee
                        ?.paymentDate && (

                        <p className="mt-2">

                          Payment Date:{' '}

                          <span className="font-medium">
                            {
                              formatDate(
                                currentApplication
                                  .registrationFee
                                  .paymentDate
                              )
                            }
                          </span>

                        </p>

                      )
                    }


                    {
                      !isApplicationLoading &&
                      currentApplication
                        ?.approvalStage ===
                        'Payment Verification' &&
                      currentApplication
                        ?.registrationFee
                        ?.paymentStatus ===
                        'Paid' && (

                        <div className="mt-4">

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={
                                handleViewPaymentReceipt
                              }
                              disabled={
                                documentActionKey ===
                                'view:payment-receipt'
                              }
                              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >

                              <Eye size={16}/>

                              {
                                documentActionKey ===
                                'view:payment-receipt'
                                  ? 'Opening...'
                                  : 'View Receipt'
                              }

                            </button>


                            <button
                              type="button"
                              onClick={
                                handleDownloadPaymentReceipt
                              }
                              disabled={
                                documentActionKey ===
                                'download:payment-receipt'
                              }
                              className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >

                              <Download size={16}/>

                              {
                                documentActionKey ===
                                'download:payment-receipt'
                                  ? 'Downloading...'
                                  : 'Download Receipt'
                              }

                            </button>

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              handlePaymentVerification(
                                selectedApplicationId
                              )
                            }
                            disabled={
                              verifyPaymentMutation.isPending
                            }
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >

                            {
                              verifyPaymentMutation.isPending
                                ? 'Verifying...'
                                : 'Verify Payment'
                            }

                          </button>

                        </div>

                      )
                    }

                  </div>

                )
              }


              <div className="flex justify-end gap-3 pt-5 border-t">

                <button

                  onClick={
                    closeModal
                  }

                  className="px-4 py-2 border rounded-lg"

                >

                  Close

                </button>


                {
                  !isApplicationLoading &&
                  currentApplication
                    ?.status ===
                    'Submitted' &&
                  currentApplication
                    ?.approvalStage ===
                    'Submitted' && (

                    <button

                      onClick={
                        handleStartReview
                      }

                      disabled={
                        startReviewMutation.isPending
                      }

                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"

                    >

                      {
                        startReviewMutation.isPending
                          ? 'Starting...'
                          : 'Start Review'
                      }

                    </button>

                  )
                }


                {
                  !isApplicationLoading &&
                  currentApplication
                    ?.status ===
                    'Under Review' &&
                  currentApplication
                    ?.approvalStage ===
                    'Document Verification' && (

                    <div className="flex gap-3 flex-wrap">

                      <button
                        type="button"
                        onClick={
                          handleReturnForRevision
                        }
                        disabled={
                          returnForRevisionMutation.isPending
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        {
                          returnForRevisionMutation.isPending
                            ? 'Returning...'
                            : 'Return for Revision'
                        }

                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteDocumentVerification(
                            'payment'
                          )
                        }
                        disabled={
                          completeDocumentVerificationMutation.isPending ||
                          missingRequiredDocuments.length > 0 ||
                          !documentReviewConfirmed ||
                          !registrationReviewConfirmed
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        {
                          completeDocumentVerificationMutation.isPending
                            ? 'Submitting...'
                            : 'Submit for Payment'
                        }

                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleCompleteDocumentVerification(
                            'exempt'
                          )
                        }
                        disabled={
                          completeDocumentVerificationMutation.isPending ||
                          missingRequiredDocuments.length > 0 ||
                          !documentReviewConfirmed ||
                          !registrationReviewConfirmed
                        }
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        {
                          completeDocumentVerificationMutation.isPending
                            ? 'Submitting...'
                            : 'Submit with Payment Exemption'
                        }

                      </button>

                    </div>

                  )
                }


                {
                  !isApplicationLoading &&
                  currentApplication
                    ?.status ===
                    'Under Review' &&
                  currentApplication
                    ?.approvalStage ===
                    'Registration Review' && (

                    <button
                      onClick={
                        handleCompleteRegistrationReview
                      }
                      disabled={
                        completeRegistrationReviewMutation.isPending ||
                        !registrationReviewConfirmed
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {
                        completeRegistrationReviewMutation.isPending
                          ? 'Completing...'
                          : 'Complete Registration Review'
                      }

                    </button>

                  )
                }


                {
                  !isApplicationLoading &&
                  currentApplication
                    ?.approvalStage ===
                    'Director General Review' &&
                  [
                    'Verified',
                    'Exempt',
                  ].includes(
                    currentApplication
                      ?.registrationFee
                      ?.paymentStatus
                  ) && (

                    <button

                      onClick={
                        handleDirectorGeneralApproval
                      }

                      disabled={
                        approveMutation.isPending
                      }

                      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"

                    >

                      {
                        approveMutation.isPending
                          ? 'Approving...'
                          :
                          (
                            <>
                              <CheckCircle size={16}/>
                              Approve
                            </>
                          )
                      }

                    </button>

                  )
                }

              </div>

            </div>

          </div>

        </div>

      )}


    </div>

  );

}


export default OrganizationApplications;