import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  Landmark,
  MapPin,
  Network,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const DRAFT_STORAGE_KEY =
  "jaims-organization-registration-draft-v1";
const REVISION_STORAGE_KEY =
  "jaims-organization-revision-v1";
const ORGANIZATION_APPLICATION_API =
  "http://127.0.0.1:5000/api/v1/public/organization-applications";

const organizationTypes = [
  {
    value: "Local NGO",
    title: "Local NGO",
    description:
      "A non-governmental organization established and operating locally in Somalia.",
    icon: Landmark,
  },
  {
    value: "International NGO",
    title: "International NGO",
    description:
      "An international non-governmental organization operating or seeking to operate in Jubaland.",
    icon: Globe2,
  },
  {
    value: "Consultant",
    title: "Consultant",
    description:
      "An individual or consulting entity providing professional, technical or advisory services.",
    icon: Building2,
  },
  {
    value: "Civil Society Organization",
    title: "Civil Society Organization",
    description:
      "A civil society organization working to support community, social or development priorities.",
    icon: Users,
  },
  {
    value: "Community Based Organization",
    title: "Community Based Organization",
    description:
      "A locally established community organization serving specific communities or local development needs.",
    icon: Users,
  },
  {
    value: "Network",
    title: "Network",
    description:
      "A network bringing together organizations or institutions around shared development or coordination objectives.",
    icon: Network,
  },
  {
    value: "Association",
    title: "Association",
    description:
      "A formally organized association representing members around a shared professional, social or development purpose.",
    icon: Users,
  },
];

const registrationSteps = [
  "Select organization type",
  "Complete organization & applicant details",
  "Operational information & documents",
  "Review and submit",
  "Ministry review & tracking",
];

const sectorOptions = [
  "Agriculture",
  "Education",
  "Energy",
  "Environment",
  "Food Security",
  "Governance",
  "Health",
  "Humanitarian Assistance",
  "Livelihoods",
  "Nutrition",
  "Peacebuilding",
  "Protection",
  "Shelter",
  "Social Development",
  "WASH",
  "Youth Development",
];

const requiredDocuments = [
  {
    key: "registrationCertificate",
    label: "Registration Certificate",
    description:
      "Official registration or legal recognition document.",
  },
  {
    key: "constitution",
    label: "Constitution / Bylaws",
    description:
      "Constitution, bylaws or other governing document.",
  },
  {
    key: "organizationProfile",
    label: "Organization Profile",
    description:
      "Current organizational profile describing mandate and activities.",
  },
  {
    key: "leadershipList",
    label: "Leadership / Board List",
    description:
      "Current leadership, board or management structure.",
  },
  {
    key: "otherSupportingDocument",
    label: "Other Supporting Document",
    description:
      "Any additional document relevant to the registration application.",
    optional: true,
  },
];

const initialFormData = {
  organizationName: "",
  establishmentDate: "",
  registrationCountry: "Somalia",

  organizationEmail: "",
  organizationPhone: "",
  organizationAddress: "",
  website: "",

  applicantFullName: "",
  applicantEmail: "",
  applicantPhone: "",
  applicantAddress: "",
  title: "",

  primarySector: "",
  sectors: [],
  activityAreas: "",
  jubalandActivities: "",

operationalAddress: "",
jubalandOperationsStartDate: "",
activeProjectsInJubaland: "",
};

const initialLocation = {
  region: "",
  district: "",
  village: "",
};

const initialDocuments = {
  registrationCertificate: null,
  constitution: null,
  organizationProfile: null,
  leadershipList: null,
  otherSupportingDocument: null,
};

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function ReviewItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function ReviewSection({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-bold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function OrganizationRegisterPage() {
  const [currentStep, setCurrentStep] =
    useState(1);

  const [selectedType, setSelectedType] =
    useState("");

  const [formData, setFormData] =
    useState(initialFormData);

  const [
    operationalLocations,
    setOperationalLocations,
  ] = useState([{ ...initialLocation }]);

  const [documents, setDocuments] =
    useState(initialDocuments);

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  const [draftRestored, setDraftRestored] =
    useState(false);

  const [lastSavedAt, setLastSavedAt] =
    useState(null);

  const [
    declarationAccepted,
    setDeclarationAccepted,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    submittedApplication,
    setSubmittedApplication,
  ] = useState(null);
const [
  revisionApplication,
  setRevisionApplication,
] = useState(null);

const [
  existingDocuments,
  setExistingDocuments,
] = useState([]);
  const selectedOrganization = useMemo(
    () =>
      organizationTypes.find(
        (organizationType) =>
          organizationType.value ===
          selectedType
      ),
    [selectedType]
  );
useEffect(() => {
  try {
    const rawRevision =
      sessionStorage.getItem(
        REVISION_STORAGE_KEY
      );

    if (!rawRevision) {
      return;
    }

    const revision =
      JSON.parse(rawRevision);

    const application =
      revision?.application;

    if (
      !application ||
      !application.applicationNumber
    ) {
      sessionStorage.removeItem(
        REVISION_STORAGE_KEY
      );

      return;
    }

    setRevisionApplication(
      revision
    );

    setSelectedType(
      application.organizationType ||
        ""
    );

    const establishmentDate =
      application.establishmentDate
        ? String(
            application.establishmentDate
          ).slice(0, 10)
        : "";

    const applicationSectors =
      Array.isArray(
        application.sectors
      )
        ? application.sectors
        : [];

    const primarySector =
      applicationSectors[0] || "";

    setFormData({
      ...initialFormData,

      organizationName:
        application.organizationName ||
        "",

      establishmentDate,

      registrationCountry:
        application.registrationCountry ||
        "Somalia",

      organizationEmail:
        application.organizationContact
          ?.email || "",

      organizationPhone:
        application.organizationContact
          ?.phone || "",

      organizationAddress:
        application.organizationContact
          ?.address || "",

      website:
        application.organizationContact
          ?.website || "",

      applicantFullName:
        application.applicant
          ?.fullName || "",

      applicantEmail:
        application.applicant
          ?.email || "",

      applicantPhone:
        application.applicant
          ?.phone || "",

      applicantAddress:
        application.applicant
          ?.address || "",

      title:
  application.applicant
    ?.title || "",

      primarySector,

      sectors:
        applicationSectors.filter(
          (sector) =>
            sector !== primarySector
        ),

      activityAreas:
        Array.isArray(
          application.activityAreas
        )
          ? application.activityAreas.join(
              ", "
            )
          : "",
          operationalAddress:
  application.operationalAddress ||
  "",

jubalandOperationsStartDate:
  application.jubalandOperationsStartDate
    ? String(
        application.jubalandOperationsStartDate
      ).slice(0, 10)
    : "",

activeProjectsInJubaland:
  application.activeProjectsInJubaland ??
  "",
    });

    setExistingDocuments(
      Array.isArray(
        application.supportingDocuments
      )
        ? application.supportingDocuments
        : []
    );

    setDocuments({
      ...initialDocuments,
    });

    setDeclarationAccepted(
      false
    );

    setSubmitError("");

    /*
     * Begin correction at the organization
     * details step instead of asking the
     * applicant to choose the type again.
     */
    setCurrentStep(2);

  } catch (error) {
    console.error(
      "Unable to load organization revision data:",
      error
    );

    sessionStorage.removeItem(
      REVISION_STORAGE_KEY
    );
  }
}, []);
 useEffect(() => {
  try {
    const rawRevision =
      sessionStorage.getItem(
        REVISION_STORAGE_KEY
      );

    if (rawRevision) {
      setDraftLoaded(true);
      return;
    }

    const rawDraft =
      localStorage.getItem(
        DRAFT_STORAGE_KEY
      );

      if (!rawDraft) {
        setDraftLoaded(true);
        return;
      }

      const savedDraft =
        JSON.parse(rawDraft);

      if (
        savedDraft.selectedType &&
        organizationTypes.some(
          (organizationType) =>
            organizationType.value ===
            savedDraft.selectedType
        )
      ) {
        setSelectedType(
          savedDraft.selectedType
        );
      }

      if (
        savedDraft.formData &&
        typeof savedDraft.formData ===
          "object"
      ) {
        setFormData({
          ...initialFormData,
          ...savedDraft.formData,
          sectors: Array.isArray(
            savedDraft.formData.sectors
          )
            ? savedDraft.formData.sectors
            : [],
        });
      }

      if (
        Array.isArray(
          savedDraft.operationalLocations
        ) &&
        savedDraft.operationalLocations
          .length > 0
      ) {
        setOperationalLocations(
          savedDraft.operationalLocations.map(
            (location) => ({
              ...initialLocation,
              ...location,
            })
          )
        );
      }

      const savedStep = Number(
        savedDraft.currentStep
      );

      if (
        Number.isInteger(savedStep) &&
        savedStep >= 1 &&
        savedStep <= 4
      ) {
        setCurrentStep(savedStep);
      }

      if (savedDraft.savedAt) {
        setLastSavedAt(
          new Date(savedDraft.savedAt)
        );
      }

      setDraftRestored(true);
    } catch (error) {
      console.error(
        "Unable to restore organization registration draft:",
        error
      );

      localStorage.removeItem(
        DRAFT_STORAGE_KEY
      );
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (
      !draftLoaded ||
      submittedApplication ||
      currentStep === 5
    ) {
      return;
    }

    const hasDraftContent =
      Boolean(selectedType) ||
      Object.entries(formData).some(
        ([key, value]) => {
          if (
            key ===
            "registrationCountry"
          ) {
            return false;
          }

          if (Array.isArray(value)) {
            return value.length > 0;
          }

          return Boolean(
            String(value ?? "").trim()
          );
        }
      ) ||
      operationalLocations.some(
        (location) =>
          Boolean(
            location.region ||
              location.district ||
              location.village
          )
      );

    if (!hasDraftContent) {
      return;
    }

    const saveTimer =
      window.setTimeout(() => {
        try {
          const savedAt =
            new Date().toISOString();

          const draft = {
            version: 1,
            currentStep,
            selectedType,
            formData,
            operationalLocations,
            savedAt,
          };

          localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify(draft)
          );

          setLastSavedAt(
            new Date(savedAt)
          );
        } catch (error) {
          console.error(
            "Unable to save organization registration draft:",
            error
          );
        }
      }, 400);

    return () => {
      window.clearTimeout(
        saveTimer
      );
    };
  }, [
    currentStep,
    selectedType,
    formData,
    operationalLocations,
    draftLoaded,
    submittedApplication,
  ]);

  const handleFieldChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setFormData(
      (currentFormData) => ({
        ...currentFormData,
        [name]: value,
      })
    );
  };

  const handleSelectType = (
    organizationType
  ) => {
    setSelectedType(
      organizationType.value
    );
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleContinueFromStepOne =
    () => {
      if (!selectedType) {
        return;
      }

      setCurrentStep(2);
      scrollToTop();
    };

  const handleBackToStepOne = () => {
    setCurrentStep(1);
    scrollToTop();
  };

  const handleStepTwoSubmit = (
    event
  ) => {
    event.preventDefault();

    setCurrentStep(3);
    scrollToTop();
  };

  const handleBackToStepTwo = () => {
    setCurrentStep(2);
    scrollToTop();
  };

  const handleSectorToggle = (
    sector
  ) => {
    setFormData(
      (currentFormData) => {
        const exists =
          currentFormData.sectors.includes(
            sector
          );

        return {
          ...currentFormData,
          sectors: exists
            ? currentFormData.sectors.filter(
                (selectedSector) =>
                  selectedSector !==
                  sector
              )
            : [
                ...currentFormData.sectors,
                sector,
              ],
        };
      }
    );
  };

  const handleLocationChange = (
    index,
    field,
    value
  ) => {
    setOperationalLocations(
      (currentLocations) =>
        currentLocations.map(
          (
            location,
            locationIndex
          ) =>
            locationIndex === index
              ? {
                  ...location,
                  [field]: value,
                }
              : location
        )
    );
  };

  const handleAddLocation = () => {
    setOperationalLocations(
      (currentLocations) => [
        ...currentLocations,
        { ...initialLocation },
      ]
    );
  };

  const handleRemoveLocation = (
    index
  ) => {
    if (
      operationalLocations.length ===
      1
    ) {
      return;
    }

    setOperationalLocations(
      (currentLocations) =>
        currentLocations.filter(
          (_, locationIndex) =>
            locationIndex !== index
        )
    );
  };

  const handleDocumentChange = (
    event,
    documentKey
  ) => {
    const selectedFile =
      event.target.files?.[0] ??
      null;

    setDocuments(
      (currentDocuments) => ({
        ...currentDocuments,
        [documentKey]:
          selectedFile,
      })
    );
  };

  const handleRemoveDocument = (
    documentKey
  ) => {
    setDocuments(
      (currentDocuments) => ({
        ...currentDocuments,
        [documentKey]: null,
      })
    );
  };

  const handleStepThreeSubmit = (
    event
  ) => {
    event.preventDefault();

    setCurrentStep(4);
    setDeclarationAccepted(false);
    setSubmitError("");

    scrollToTop();
  };

  const handleBackToStepThree =
    () => {
      setCurrentStep(3);
      setSubmitError("");

      scrollToTop();
    };

  const handleFinalSubmit =
    async (event) => {
      event.preventDefault();
let activeRevision =
  revisionApplication;

if (!activeRevision) {
  try {
    const rawRevision =
      sessionStorage.getItem(
        REVISION_STORAGE_KEY
      );

    activeRevision =
      rawRevision
        ? JSON.parse(rawRevision)
        : null;
  } catch {
    activeRevision = null;
  }
}
      if (
        !declarationAccepted ||
        isSubmitting
      ) {
        return;
      }

      const missingRequiredDocuments =
  requiredDocuments
    .filter(
      (document) => {
        if (document.optional) {
          return false;
        }

        const newFile =
          documents[
            document.key
          ];

        const existingFile =
          existingDocuments.some(
            (existingDocument) =>
              existingDocument.documentType ===
                document.key
          );

        return (
          !newFile &&
          !existingFile
        );
      }
    )
    .map(
      (document) =>
        document.label
    );

      if (
        missingRequiredDocuments.length >
        0
      ) {
        setSubmitError(
          `Please upload the following required supporting documents before submitting: ${missingRequiredDocuments.join(
            ", "
          )}.`
        );

        setCurrentStep(3);
        scrollToTop();
        return;
      }

      setIsSubmitting(true);
      setSubmitError("");

      const submissionData =
        new FormData();

      submissionData.append(
        "organizationType",
        selectedType
      );

      submissionData.append(
        "organizationName",
        formData.organizationName
      );

      submissionData.append(
        "establishmentDate",
        formData.establishmentDate
      );

      submissionData.append(
        "registrationCountry",
        formData.registrationCountry
      );

      submissionData.append(
        "organizationEmail",
        formData.organizationEmail
      );

      submissionData.append(
        "organizationPhone",
        formData.organizationPhone
      );

      submissionData.append(
        "organizationAddress",
        formData.organizationAddress
      );

      submissionData.append(
        "website",
        formData.website || ""
      );

      submissionData.append(
        "applicantFullName",
        formData.applicantFullName
      );

      submissionData.append(
        "applicantEmail",
        formData.applicantEmail
      );

      submissionData.append(
        "applicantPhone",
        formData.applicantPhone
      );

      submissionData.append(
        "applicantAddress",
        formData.applicantAddress
      );

      submissionData.append(
  "title",
  formData.title || ""
);
      submissionData.append(
        "primarySector",
        formData.primarySector
      );

      submissionData.append(
        "sectors",
        JSON.stringify(
          formData.sectors
        )
      );

      submissionData.append(
        "activityAreas",
        formData.activityAreas
      );
submissionData.append(
  "operationalAddress",
  formData.operationalAddress || ""
);

submissionData.append(
  "jubalandOperationsStartDate",
  formData.jubalandOperationsStartDate || ""
);

submissionData.append(
  "activeProjectsInJubaland",
  formData.activeProjectsInJubaland || ""
);
if (activeRevision) {
  submissionData.append(
    "revisionAccessEmail",
    activeRevision
  .revisionAccessEmail ||
      ""
  );

  submissionData.append(
    "revisionAccessPhone",
    activeRevision
  .revisionAccessPhone ||
      ""
  );
}
      requiredDocuments.forEach(
        (document) => {
          const file =
            documents[document.key];

          if (file) {
            submissionData.append(
              document.key,
              file,
              file.name
            );
          }
        }
      );

      try {
     const submissionUrl =
  activeRevision
    ? `${ORGANIZATION_APPLICATION_API}/${encodeURIComponent(
        activeRevision
          .application
          .applicationNumber
      )}/resubmit`
    : ORGANIZATION_APPLICATION_API;

console.log(
  "JAIMS SUBMISSION DEBUG",
  {
    activeRevision,
    submissionUrl,
    revisionStorage:
      sessionStorage.getItem(
        REVISION_STORAGE_KEY
      ),
  }
);

let submitResult = null;

const response =
await fetch(
submissionUrl,
{
method: "POST",
body: submissionData,
}
);

try {
  submitResult =
    await response.json();
} catch {
  submitResult = null;
}

if (!response.ok) {
  throw new Error(
    submitResult?.message ||
    `Unable to submit application. Server returned ${response.status}.`
  );
}

if (
  !submitResult?.data?.applicationNumber
) {
  throw new Error(
    "Application was submitted, but the server did not return an application number."
  );
}

setSubmittedApplication(
  submitResult.data
);

setCurrentStep(5);

if (activeRevision) {
  sessionStorage.removeItem(
    REVISION_STORAGE_KEY
  );

  localStorage.removeItem(
    DRAFT_STORAGE_KEY
  );

  setRevisionApplication(
    null
  );

  setExistingDocuments(
    []
  );
} else {
  localStorage.removeItem(
    DRAFT_STORAGE_KEY
  );
}

setDraftRestored(false);
setLastSavedAt(null);
setDeclarationAccepted(false);
setSubmitError("");

scrollToTop();
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleClearDraft = () => {
  const shouldClear =
    window.confirm(
      "Clear this registration draft and start a new application?"
    );

  if (!shouldClear) {
    return;
  }

  localStorage.removeItem(
    DRAFT_STORAGE_KEY
  );

  sessionStorage.removeItem(
    REVISION_STORAGE_KEY
  );

  setRevisionApplication(
    null
  );

  setExistingDocuments(
    []
  );

  setCurrentStep(1);
  setSelectedType("");

  setFormData({
    ...initialFormData,
    sectors: [],
  });

  setOperationalLocations([
    { ...initialLocation },
  ]);

  setDocuments({
    ...initialDocuments,
  });

  setDeclarationAccepted(false);
  setSubmitError("");
  setSubmittedApplication(null);

  setLastSavedAt(null);
  setDraftRestored(false);

  scrollToTop();
};

  const formattedSavedTime =
    lastSavedAt
      ? lastSavedAt.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "";

  const formattedEstablishmentDate =
    formData.establishmentDate
      ? new Date(
          `${formData.establishmentDate}T00:00:00`
        ).toLocaleDateString()
      : "";
const formattedJubalandOperationsStartDate =
  formData.jubalandOperationsStartDate
    ? new Date(
        `${formData.jubalandOperationsStartDate}T00:00:00`
      ).toLocaleDateString()
    : "";
  const allSectors = [
    formData.primarySector,

    ...formData.sectors.filter(
      (sector) =>
        sector !==
        formData.primarySector
    ),
  ].filter(Boolean);

  const formattedSubmittedDate =
    submittedApplication?.submittedAt
      ? new Date(
          submittedApplication.submittedAt
        ).toLocaleString()
      : "";

  return (
    <main className="bg-slate-50">
      <section className="border-b border-emerald-900 bg-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/60 px-4 py-2 text-sm text-emerald-100">
              <ShieldCheck size={17} />
              Ministry Digital Service
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Organization Registration Portal
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
              Apply online for organization registration and follow your
              application through the Ministry review and approval process.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div>
          {draftRestored &&
            currentStep < 5 && (
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Save
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />

                  <div>
                    <p className="font-semibold text-blue-950">
                      Saved draft restored
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Your previous registration information has been restored
                      from this browser. Uploaded documents must be selected
                      again after a browser refresh.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {submitError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-bold text-red-900">
                Application could not be submitted
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {submitError}
              </p>

              <p className="mt-2 text-sm text-red-700">
                Your draft has not been deleted. Please correct the problem
                and try again.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <>
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Step 1 of 5
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Select organization type
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Choose the category that correctly represents your
                    organization.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {organizationTypes.map(
                    (organizationType) => {
                      const Icon =
                        organizationType.icon;

                      const isSelected =
                        selectedType ===
                        organizationType.value;

                      return (
                        <button
                          key={
                            organizationType.value
                          }
                          type="button"
                          onClick={() =>
                            handleSelectType(
                              organizationType
                            )
                          }
                          className={[
                            "relative rounded-xl border p-5 text-left transition",
                            isSelected
                              ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100"
                              : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {isSelected && (
                            <CheckCircle2
                              size={22}
                              className="absolute right-4 top-4 text-emerald-700"
                            />
                          )}

                          <div
                            className={[
                              "mb-4 flex h-11 w-11 items-center justify-center rounded-lg",
                              isSelected
                                ? "bg-emerald-700 text-white"
                                : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            <Icon
                              size={22}
                            />
                          </div>

                          <h3 className="font-bold text-slate-900">
                            {
                              organizationType.title
                            }
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {
                              organizationType.description
                            }
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>

                {selectedOrganization && (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={21}
                        className="mt-0.5 shrink-0 text-emerald-700"
                      />

                      <div>
                        <p className="font-semibold text-emerald-900">
                          {
                            selectedOrganization.title
                          }{" "}
                          selected
                        </p>

                        <p className="mt-1 text-sm leading-6 text-emerald-800">
                          The next stage will collect applicant, organization
                          and contact information before operational information
                          and supporting documents are added.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Your progress is saved automatically in this browser.
                  </p>

                  <button
                    type="button"
                    disabled={
                      !selectedType
                    }
                    onClick={
                      handleContinueFromStepOne
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Continue Application
                    <ArrowRight
                      size={18}
                    />
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <form
                onSubmit={
                  handleStepTwoSubmit
                }
              >
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Step 2 of 5
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Organization & applicant details
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Complete the organization information and details of the
                    person submitting the application.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={21}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Selected organization type
                      </p>

                      <p className="mt-1 text-base font-bold text-emerald-800">
                        {
                          selectedOrganization?.title
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <section className="mt-8">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Organization information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Provide the organization&apos;s legal and basic profile
                      information.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Field
                        label="Organization name"
                        name="organizationName"
                        value={
                          formData.organizationName
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="Enter official organization name"
                        required
                      />
                    </div>

                    <Field
                      label="Establishment date"
                      name="establishmentDate"
                      type="date"
                      value={
                        formData.establishmentDate
                      }
                      onChange={
                        handleFieldChange
                      }
                      required
                    />

                    <Field
                      label="Registration country"
                      name="registrationCountry"
                      value={
                        formData.registrationCountry
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="Somalia"
                      required
                    />
                  </div>
                </section>

                <section className="mt-10">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Organization contact
                    </h3>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field
                      label="Organization email"
                      name="organizationEmail"
                      type="email"
                      value={
                        formData.organizationEmail
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="organization@example.org"
                      required
                    />

                    <Field
                      label="Organization phone"
                      name="organizationPhone"
                      value={
                        formData.organizationPhone
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="+252 ..."
                      required
                    />

                    <div className="md:col-span-2">
                      <Field
                        label="Organization address"
                        name="organizationAddress"
                        value={
                          formData.organizationAddress
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="Office address"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Field
                        label="Website"
                        name="website"
                        type="url"
                        value={
                          formData.website
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="https://example.org"
                      />
                    </div>
                  </div>
                </section>

                <section className="mt-10">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Applicant / representative information
                    </h3>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Field
                        label="Full name"
                        name="applicantFullName"
                        value={
                          formData.applicantFullName
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="Applicant full name"
                        required
                      />
                    </div>

                    <Field
                      label="Applicant email"
                      name="applicantEmail"
                      type="email"
                      value={
                        formData.applicantEmail
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="applicant@example.com"
                      required
                    />

                    <Field
                      label="Applicant phone"
                      name="applicantPhone"
                      value={
                        formData.applicantPhone
                      }
                      onChange={
                        handleFieldChange
                      }
                      placeholder="+252 ..."
                      required
                    />

                    <div className="md:col-span-2">
                      <Field
                        label="Applicant address"
                        name="applicantAddress"
                        value={
                          formData.applicantAddress
                        }
                        onChange={
                          handleFieldChange
                        }
                        placeholder="Current address"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Field
  label="Applicant Title / Position"
  name="title"
  value={
    formData.title
  }
  onChange={
    handleFieldChange
  }
  placeholder="Example: Executive Director, Country Director, Program Manager"
/>
                    </div>
                  </div>
                </section>

                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={
                      handleBackToStepOne
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft
                      size={18}
                    />
                    Back
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Continue to Operational Information
                    <ArrowRight
                      size={18}
                    />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <form
                onSubmit={
                  handleStepThreeSubmit
                }
              >
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Step 3 of 5
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Operational information & documents
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Provide information about the organization&apos;s work,
                    geographical coverage and supporting documentation.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    {formData.organizationName ||
                      "Organization"}
                  </p>

                  <p className="mt-1 text-sm text-emerald-800">
                    {
                      selectedOrganization?.title
                    }
                  </p>
                </div>

                <section className="mt-8">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Operational profile
                    </h3>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="primarySector"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Primary sector
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      id="primarySector"
                      name="primarySector"
                      value={
                        formData.primarySector
                      }
                      onChange={
                        handleFieldChange
                      }
                      required
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    >
                      <option value="">
                        Select primary sector
                      </option>

                      {sectorOptions.map(
                        (sector) => (
                          <option
                            key={sector}
                            value={sector}
                          >
                            {sector}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-800">
                      Additional sectors
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {sectorOptions.map(
                        (sector) => {
                          const selected =
                            formData.sectors.includes(
                              sector
                            );

                          return (
                            <button
                              key={
                                sector
                              }
                              type="button"
                              onClick={() =>
                                handleSectorToggle(
                                  sector
                                )
                              }
                              className={[
                                "rounded-full border px-4 py-2 text-sm font-medium transition",
                                selected
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-800",
                              ].join(
                                " "
                              )}
                            >
                              {
                                sector
                              }
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="activityAreas"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Main areas of intervention
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <textarea
                      id="activityAreas"
                      name="activityAreas"
                      value={
                        formData.activityAreas
                      }
                      onChange={
                        handleFieldChange
                      }
                      required
                      rows={4}
                      placeholder="Example: community development, institutional capacity building, emergency response..."
                      className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="jubalandActivities"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Description of activities in Jubaland
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <textarea
                      id="jubalandActivities"
                      name="jubalandActivities"
                      value={
                        formData.jubalandActivities
                      }
                      onChange={
                        handleFieldChange
                      }
                      required
                      rows={5}
                      className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </section>

                <section className="mt-10">
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={21}
                        className="mt-0.5 text-emerald-700"
                      />

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Geographical coverage
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {operationalLocations.map(
                      (
                        location,
                        index
                      ) => (
                        <div
                          key={`location-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="font-semibold text-slate-900">
                              Location{" "}
                              {index +
                                1}
                            </p>

                            {operationalLocations.length >
                              1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveLocation(
                                    index
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600"
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="block text-sm font-semibold text-slate-800">
  Region
</label>

                              <input
                                type="text"
                                value={
                                  location.region
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleLocationChange(
                                    index,
                                    "region",
                                    event
                                      .target
                                      .value
                                  )
                                }
                               
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
                              />
                            </div>

                            <div>
                             <label className="block text-sm font-semibold text-slate-800">
  District
</label>

                              <input
                                type="text"
                                value={
                                  location.district
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleLocationChange(
                                    index,
                                    "district",
                                    event
                                      .target
                                      .value
                                  )
                                }
                               
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-slate-800">
                                Village / Location
                              </label>

                              <input
                                type="text"
                                value={
                                  location.village
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleLocationChange(
                                    index,
                                    "village",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleAddLocation
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800"
                  >
                    <Plus size={17} />
                    Add another location
                  </button>
                  <div className="mt-6">
  <label
    htmlFor="operationalAddress"
    className="block text-sm font-semibold text-slate-800"
  >
    Operational address / location description
  </label>

  <textarea
    id="operationalAddress"
    name="operationalAddress"
    value={
      formData.operationalAddress
    }
    onChange={
      handleFieldChange
    }
    rows={4}
    placeholder="Example: Farjano, Kismayo, Lower Juba — near Kismayo University."
    className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
  />

  <p className="mt-2 text-xs leading-5 text-slate-500">
    You may provide the geographical coverage above,
    an operational address, or both.
  </p>
</div>
                </section>

                <section className="mt-10">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Organization capacity
                    </h3>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field
  label="Operations started in Jubaland"
  name="jubalandOperationsStartDate"
  type="date"
  value={
    formData.jubalandOperationsStartDate
  }
  onChange={
    handleFieldChange
  }
/>

<Field
  label="Active projects / programmes in Jubaland"
  name="activeProjectsInJubaland"
  type="number"
  min="0"
  value={
    formData.activeProjectsInJubaland
  }
  onChange={
    handleFieldChange
  }
/>
</div>
</section>

                <section className="mt-10">
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-start gap-3">
                      <Upload
                        size={21}
                        className="mt-0.5 text-emerald-700"
                      />

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Supporting documents
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {requiredDocuments.map(
                      (document) => {
                        const file =
                          documents[
                            document
                              .key
                          ];

                        return (
                          <div
                            key={
                              document.key
                            }
                            className="rounded-xl border border-slate-200 p-5"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {
                                    document.label
                                  }

                                  {!document.optional && (
                                    <span className="ml-1 text-red-500">
                                      *
                                    </span>
                                  )}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    document.description
                                  }
                                </p>
                              </div>

                              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
                                <Upload
                                  size={
                                    17
                                  }
                                />

                                {file
                                  ? "Replace file"
                                  : "Choose file"}

                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  required={
                                    !document.optional &&
                                    !file
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleDocumentChange(
                                      event,
                                      document.key
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {file && (
                              <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
                                <div>
                                  <p className="text-sm font-semibold text-emerald-900">
                                    {
                                      file.name
                                    }
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDocument(
                                      document.key
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2
                                    size={
                                      18
                                    }
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm leading-6 text-emerald-900">
                      Selected supporting documents will be uploaded securely
                      to JAIMS when the application is submitted. Required
                      documents must remain selected until submission is
                      completed.
                    </p>
                  </div>
                </section>

                <div className="mt-10 flex justify-between border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={
                      handleBackToStepTwo
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold"
                  >
                    <ArrowLeft
                      size={18}
                    />
                    Back
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Continue to Review
                    <ArrowRight
                      size={18}
                    />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <form
                onSubmit={
                  handleFinalSubmit
                }
              >
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Step 4 of 5
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Review and submit
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Review your registration information carefully before
                    submitting it to the Ministry.
                  </p>
                </div>

                <div className="space-y-6">
                  <ReviewSection title="Registration classification">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ReviewItem
                        label="Organization type"
                        value={
                          selectedOrganization?.title
                        }
                      />

                      <ReviewItem
                        label="Registration country"
                        value={
                          formData.registrationCountry
                        }
                      />
                    </div>
                  </ReviewSection>

                  <ReviewSection title="Organization information">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ReviewItem
                        label="Organization name"
                        value={
                          formData.organizationName
                        }
                      />

                      <ReviewItem
                        label="Establishment date"
                        value={
                          formattedEstablishmentDate
                        }
                      />

                      <ReviewItem
                        label="Email"
                        value={
                          formData.organizationEmail
                        }
                      />

                      <ReviewItem
                        label="Phone"
                        value={
                          formData.organizationPhone
                        }
                      />

                      <ReviewItem
                        label="Address"
                        value={
                          formData.organizationAddress
                        }
                      />

                      <ReviewItem
                        label="Website"
                        value={
                          formData.website
                        }
                      />
                    </div>
                  </ReviewSection>

                  <ReviewSection title="Applicant / representative">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ReviewItem
                        label="Full name"
                        value={
                          formData.applicantFullName
                        }
                      />

                      <ReviewItem
                        label="Email"
                        value={
                          formData.applicantEmail
                        }
                      />

                      <ReviewItem
                        label="Phone"
                        value={
                          formData.applicantPhone
                        }
                      />

                      <ReviewItem
                        label="Address"
                        value={
                          formData.applicantAddress
                        }
                      />

                      <ReviewItem
  label="Applicant Title / Position"
  value={
    formData.title
  }
/>
                    </div>
                  </ReviewSection>

                  <ReviewSection title="Operational profile">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ReviewItem
                        label="Primary sector"
                        value={
                          formData.primarySector
                        }
                      />

                      <ReviewItem
                        label="Sectors"
                        value={
                          allSectors.join(
                            ", "
                          )
                        }
                      />

                      <div className="sm:col-span-2">
                        <ReviewItem
                          label="Main areas of intervention"
                          value={
                            formData.activityAreas
                          }
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <ReviewItem
                          label="Activities in Jubaland"
                          value={
                            formData.jubalandActivities
                          }
                        />
                      </div>
                    </div>
                  </ReviewSection>
<div>
  <ReviewItem
    label="Operations started in Jubaland"
    value={
      formattedJubalandOperationsStartDate
    }
  />
</div>

<div>
  <ReviewItem
    label="Active projects / programmes in Jubaland"
    value={
      formData.activeProjectsInJubaland
    }
  />
</div>
                  <ReviewSection title="Geographical coverage">
  <div className="space-y-4">
    {operationalLocations.map(
      (
        location,
        index
      ) => (
        <div
          key={`review-location-${index}`}
          className="rounded-lg bg-slate-50 p-4"
        >
          <p className="text-sm font-bold text-emerald-800">
            Location{" "}
            {index + 1}
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <ReviewItem
              label="Region"
              value={
                location.region
              }
            />

            <ReviewItem
              label="District"
              value={
                location.district
              }
            />

            <ReviewItem
              label="Village / Location"
              value={
                location.village
              }
            />
          </div>
        </div>
      )
    )}

    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <ReviewItem
        label="Operational address / location description"
        value={
          formData.operationalAddress
        }
      />
    </div>
  </div>
</ReviewSection>
                  <ReviewSection title="Supporting documents">
                    <div className="space-y-3">
                      {requiredDocuments.map(
                        (document) => {
                          const file =
                            documents[
                              document
                                .key
                            ];

                          return (
                            <div
                              key={
                                document.key
                              }
                              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  document.label
                                }
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {file
                                  ? file.name
                                  : "Not selected"}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </ReviewSection>

                  <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <h3 className="text-lg font-bold text-amber-950">
                      Applicant Declaration
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      Confirm that the information provided is accurate and
                      that you are authorized to submit this application.
                    </p>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg bg-white p-4">
                      <input
                        type="checkbox"
                        checked={
                          declarationAccepted
                        }
                        onChange={(
                          event
                        ) =>
                          setDeclarationAccepted(
                            event
                              .target
                              .checked
                          )
                        }
                        className="mt-1 h-4 w-4"
                      />

                      <span className="text-sm font-medium leading-6 text-slate-700">
                        I confirm that the information provided in this
                        application is true and complete to the best of my
                        knowledge, and that I am authorized to submit this
                        registration application on behalf of the organization.
                      </span>
                    </label>
                  </section>
                </div>

                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    disabled={
                      isSubmitting
                    }
                    onClick={
                      handleBackToStepThree
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <ArrowLeft
                      size={18}
                    />
                    Back to Documents
                  </button>

                  <button
                    type="submit"
                    disabled={
                      !declarationAccepted ||
                      isSubmitting
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Application"}

                    {!isSubmitting && (
                      <ArrowRight
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5 */}
            {currentStep === 5 &&
              submittedApplication && (
                <div>
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2
                        size={42}
                      />
                    </div>

                    <p className="mt-6 text-sm font-bold uppercase tracking-wide text-emerald-700">
                      Step 5 of 5
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                      Application submitted successfully
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                      Your organization registration application has been
                      received by the Ministry and entered into JAIMS for
                      review.
                    </p>
                  </div>

                  <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Application number
                    </p>

                    <p className="mt-3 break-all text-2xl font-bold text-emerald-950 sm:text-3xl">
                      {
                        submittedApplication.applicationNumber
                      }
                    </p>

                    <p className="mt-4 text-sm leading-6 text-emerald-800">
                      Keep this application number. You will need it to track
                      the Ministry&apos;s review of your application.
                    </p>
                  </div>

                  <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ReviewItem
                        label="Organization"
                        value={
                          submittedApplication.organizationName
                        }
                      />

                      <ReviewItem
                        label="Organization type"
                        value={
                          submittedApplication.organizationType
                        }
                      />

                      <ReviewItem
                        label="Status"
                        value={
                          submittedApplication.status
                        }
                      />

                      <ReviewItem
                        label="Review stage"
                        value={
                          submittedApplication.approvalStage
                        }
                      />

                      <div className="sm:col-span-2">
                        <ReviewItem
                          label="Submitted"
                          value={
                            formattedSubmittedDate
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center">
                    <a
                      href={`/organizations/track?applicationNumber=${encodeURIComponent(
                        submittedApplication.applicationNumber
                      )}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Track Application
                      <ArrowRight
                        size={18}
                      />
                    </a>

                    <a
                      href="/"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Return to Home
                    </a>
                  </div>

                  <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <p className="text-sm leading-6 text-blue-900">
                      Your browser draft has been cleared because this
                      application was successfully submitted. A new
                      registration can now be started separately.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        <aside className="space-y-5">
          {currentStep < 5 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <Save
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <div>
                  <p className="font-bold text-emerald-950">
                    Draft auto-save
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Your registration details are saved automatically on this
                    browser.
                  </p>

                  {formattedSavedTime && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      Last saved at{" "}
                      {
                        formattedSavedTime
                      }
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleClearDraft
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <RotateCcw
                  size={16}
                />
                Clear draft & start new
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <FileText
                size={22}
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Registration process
            </h2>

            <ol className="mt-5 space-y-4">
              {registrationSteps.map(
                (step, index) => {
                  const stepNumber =
                    index + 1;

                  const isCurrent =
                    stepNumber ===
                    currentStep;

                  const isCompleted =
                    currentStep === 5
                      ? stepNumber <
                        5
                      : stepNumber <
                        currentStep;

                  return (
                    <li
                      key={step}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          isCurrent
                            ? "bg-emerald-700 text-white"
                            : isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        {isCompleted ? (
                          <CheckCircle2
                            size={15}
                          />
                        ) : (
                          stepNumber
                        )}
                      </span>

                      <span
                        className={[
                          "pt-0.5",
                          isCurrent
                            ? "font-semibold text-slate-900"
                            : "text-slate-600",
                        ].join(" ")}
                      >
                        {step}
                      </span>
                    </li>
                  );
                }
              )}
            </ol>
          </div>

          {currentStep < 5 && (
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <h2 className="font-bold">
                Already submitted?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use your application number to check the current status and
                review history.
              </p>

              <a
                href="/organizations/track"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Track application
                <ArrowRight
                  size={17}
                />
              </a>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default OrganizationRegisterPage;