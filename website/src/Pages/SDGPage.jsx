import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/SDG-Unit.png";

const overview = [
  "The Sustainable Development Goals (SDG) Unit coordinates the localization, implementation, monitoring and reporting of the Sustainable Development Goals across Jubaland State.",

  "The unit works with government institutions, development partners, civil society and other stakeholders to integrate the SDGs into planning and policy processes, monitor progress, strengthen data and reporting, and promote alignment between Jubaland development priorities and the 2030 Agenda for Sustainable Development.",
];

const values = [
  {
    title: "Inclusiveness",
    description:
      "We promote development approaches that leave no one behind.",
  },
  {
    title: "Accountability",
    description:
      "We support transparent monitoring and reporting of progress toward sustainable development.",
  },
  {
    title: "Partnership",
    description:
      "We promote collaboration across government, partners, communities and civil society.",
  },
];

const services = [
  {
    title: "SDG Localization",
    description:
      "Support integration of the Sustainable Development Goals into Jubaland planning and policies.",
  },
  {
    title: "SDG Monitoring",
    description:
      "Coordinate monitoring of progress against relevant SDG goals, targets and indicators.",
  },
  {
    title: "SDG Reporting",
    description:
      "Support preparation of reports and updates on progress toward the 2030 Agenda.",
  },
  {
    title: "Data Coordination",
    description:
      "Strengthen coordination of data required for monitoring sustainable development progress.",
  },
  {
    title: "Policy Alignment",
    description:
      "Promote alignment between government development priorities and national and global SDG frameworks.",
  },
  {
    title: "Stakeholder Engagement",
    description:
      "Engage government institutions, development partners, civil society and communities in SDG implementation.",
  },
];

export default function SDGPage() {
  return (
    <DepartmentPageLayout
      title="Sustainable Development Goals (SDG) Unit"
      shortTitle="Sustainable Development Goals"
      image={departmentPhoto}
      overview={overview}
      vision="A Jubaland State where sustainable development priorities are integrated, measurable and aligned with the 2030 Agenda."
      mission="To coordinate SDG localization, implementation, monitoring and reporting while strengthening alignment between Jubaland development priorities and the Sustainable Development Goals."
      values={values}
      services={services}
    />
  );
}