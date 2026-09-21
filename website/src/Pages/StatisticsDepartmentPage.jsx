import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/Statistics.png";

const overview = [
  "The Statistics Department is responsible for coordinating official statistical activities and supporting the production, management and dissemination of reliable data for Jubaland State.",

  "The department supports censuses, surveys and data collection; social and economic statistics; statistical standards and methodologies; MIS and GIS systems; and publication of statistical information. It also provides technical support to government institutions and partners requiring reliable data for planning, monitoring and decision-making.",
];

const values = [
  {
    title: "Accuracy",
    description:
      "We promote reliable statistical methods and quality assurance to improve the accuracy of government data.",
  },
  {
    title: "Objectivity",
    description:
      "We support impartial and evidence-based statistical production and reporting.",
  },
  {
    title: "Accessibility",
    description:
      "We promote access to statistical information for government institutions, partners and other authorized users.",
  },
  {
    title: "Innovation",
    description:
      "We encourage digital data collection, statistical software, MIS and GIS technologies to modernize statistical systems.",
  },
  {
    title: "Standardization",
    description:
      "We support common standards, templates and methodologies across government statistical activities.",
  },
  {
    title: "Data Integrity",
    description:
      "We promote responsible management, documentation and preservation of official statistical records.",
  },
];

const services = [
  {
    title: "Census & Survey Coordination",
    description:
      "Supports design, coordination and implementation of censuses, surveys and other major statistical data collection activities.",
  },
  {
    title: "Social Statistics",
    description:
      "Produces and coordinates statistics related to population, health, education, WASH, culture and other social sectors.",
  },
  {
    title: "Economic Statistics",
    description:
      "Supports collection and analysis of economic, agricultural and other sector-related statistical information.",
  },
  {
    title: "Statistical Standards & Quality",
    description:
      "Develops standards, templates and methodological approaches and supports quality control of surveys and statistical activities.",
  },
  {
    title: "MIS & Data Management",
    description:
      "Maintains statistical records and supports computerized systems for data collection, aggregation, management and reporting.",
  },
  {
    title: "GIS Services",
    description:
      "Supports geographical information systems and spatial data capabilities for government planning and analysis.",
  },
  {
    title: "Statistical Publications",
    description:
      "Produces statistical reports, survey publications, annual statistical yearbooks and related documentation.",
  },
  {
    title: "Data Support to Institutions",
    description:
      "Provides statistical data and technical support to government institutions and development partners upon request.",
  },
];

function StatisticsDepartmentPage() {
  return (
    <DepartmentPageLayout
      title="Statistics Department"
      shortTitle="Statistics"
      image={departmentPhoto}
      overview={overview}
      vision="A Jubaland where reliable, timely and accessible statistics guide public policy, development planning and investment decisions."
      mission="To produce, coordinate, manage and disseminate high-quality official statistics using sound methodologies, modern data systems and strong institutional collaboration."
      values={values}
      services={services}
    />
  );
}

export default StatisticsDepartmentPage;