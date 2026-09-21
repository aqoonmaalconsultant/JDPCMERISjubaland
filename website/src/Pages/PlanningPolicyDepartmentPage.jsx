import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import planningDepartmentPhoto from "../assets/planning.png";

const overview = [
  "The Planning and Policy Department is responsible for coordinating development planning and policy processes across Jubaland State institutions. The department supports the preparation, alignment and implementation of government development priorities and provides technical guidance to ministries and agencies on planning and policy frameworks.",

  "The department also supports project planning, inter-governmental coordination, policy development and the preparation of strategic development documents designed to guide public investment and development interventions across Jubaland State.",
];

const values = [
  {
    title: "Strategic Planning",
    description:
      "We promote structured and forward-looking planning based on clear development priorities and government policy.",
  },
  {
    title: "Coordination",
    description:
      "We strengthen collaboration across government institutions to ensure development initiatives are aligned and complementary.",
  },
  {
    title: "Evidence-Based Decisions",
    description:
      "We encourage the use of reliable data, analysis and research in planning and policy formulation.",
  },
  {
    title: "Inclusiveness",
    description:
      "We promote planning processes that consider regional, district and community development priorities.",
  },
  {
    title: "Accountability",
    description:
      "We support clear planning frameworks that allow government and partners to measure implementation and results.",
  },
  {
    title: "Sustainability",
    description:
      "We promote development plans that support long-term social, economic and institutional resilience.",
  },
];

const services = [
  {
    title: "Development Planning",
    description:
      "Coordinates state development plans, sector priorities and strategic planning processes across Jubaland institutions.",
  },
  {
    title: "Policy Formulation",
    description:
      "Supports the preparation, review and alignment of development policies and strategic frameworks.",
  },
  {
    title: "Government Coordination",
    description:
      "Facilitates coordination among ministries, agencies, districts and other public institutions on development priorities.",
  },
  {
    title: "Project Planning & Development",
    description:
      "Supports identification, preparation and prioritization of development projects in line with government strategies.",
  },
  {
    title: "Strategic Framework Development",
    description:
      "Coordinates preparation of long-term and medium-term development strategies and implementation frameworks.",
  },
  {
    title: "Planning Technical Support",
    description:
      "Provides technical support to ministries and public institutions on planning methodologies, project formulation and development programming.",
  },
];

function PlanningandPolicyDepartmentPage() {
  return (
    <DepartmentPageLayout
      title="Planning and Policy Department"
      shortTitle="Planning and Policy"
      image={planningDepartmentPhoto}
      overview={overview}
      vision="A well-planned and coordinated Jubaland where development priorities are clearly defined, evidence-based and translated into sustainable results."
      mission="To coordinate effective development planning, policy formulation and project preparation that align government institutions, development partners and public investment with the strategic priorities of Jubaland State."
      values={values}
      services={services}
    />
  );
}

export default PlanningandPolicyDepartmentPage;