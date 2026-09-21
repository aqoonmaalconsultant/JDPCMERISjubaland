import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/Aid-coordination.png";

const overview = [
  "The Aid Coordination Department is responsible for coordinating humanitarian and development assistance across Jubaland State and strengthening cooperation between the Government, development partners, United Nations agencies, NGOs and other development actors.",

  "The department supports aid coordination, organization registration and facilitation, development partner engagement, resource mobilization, information sharing and alignment of external assistance with Jubaland State priorities. It promotes effective, transparent and accountable use of development and humanitarian resources.",
];

const values = [
  {
    title: "Partnership",
    description:
      "We promote constructive and long-term cooperation between government institutions, development partners, organizations and communities.",
  },
  {
    title: "Accountability",
    description:
      "We support transparent coordination and oversight of development and humanitarian resources and interventions.",
  },
  {
    title: "Alignment",
    description:
      "We encourage partner-funded programs and assistance to align with Jubaland State development priorities and strategic plans.",
  },
  {
    title: "Inclusiveness",
    description:
      "We promote engagement with government institutions, development partners, local and international organizations and communities.",
  },
  {
    title: "Efficiency",
    description:
      "We work to reduce duplication, improve coordination and promote effective use of development resources.",
  },
  {
    title: "Transparency",
    description:
      "We support open information sharing, reporting and accountability across aid coordination processes.",
  },
];

const services = [
  {
    title: "Aid Coordination",
    description:
      "Coordinates development and humanitarian assistance to improve effectiveness, accountability and alignment with government priorities.",
  },
  {
    title: "Development Partner Coordination",
    description:
      "Facilitates engagement between government institutions, donors, United Nations agencies, implementing partners and international organizations.",
  },
  {
    title: "Organization Registration & Facilitation",
    description:
      "Supports registration, guidance and facilitation of local and international organizations operating in Jubaland State.",
  },
  {
    title: "Regional Coordination",
    description:
      "Supports coordination of development and humanitarian activities implemented at regional and district levels.",
  },
  {
    title: "Resource Mobilization",
    description:
      "Supports mobilization and coordination of domestic and external resources for government development priorities and programs.",
  },
  {
    title: "Aid Information Management",
    description:
      "Supports collection, management and sharing of information on development assistance, organizations and partner-supported interventions.",
  },
  {
    title: "Organization Performance Coordination",
    description:
      "Supports oversight and coordination of organization activities and promotes compliance, accountability and alignment with government priorities.",
  },
  {
    title: "Partner Engagement",
    description:
      "Strengthens communication and cooperation between Jubaland State institutions and humanitarian and development partners.",
  },
];

function AidCoordinationDepartmentPage() {
  return (
    <DepartmentPageLayout
      title="Aid Coordination Department"
      shortTitle="Aid Coordination"
      image={departmentPhoto}
      overview={overview}
      vision="A well-coordinated Jubaland where humanitarian and development assistance is transparent, effective and aligned with government priorities."
      mission="To coordinate development and humanitarian assistance, strengthen partnerships, support organization oversight and improve alignment of external resources with Jubaland State development priorities."
      values={values}
      services={services}
    />
  );
}

export default AidCoordinationDepartmentPage;