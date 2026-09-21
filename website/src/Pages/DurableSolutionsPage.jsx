import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/Durable-Solution.png";

const overview = [
  "The Durable Solutions Unit coordinates government efforts to address displacement and support sustainable solutions for internally displaced persons, returnees and displacement-affected communities across Jubaland State.",

  "The unit works with government institutions, humanitarian and development partners and communities to strengthen durable solutions planning, coordination, data, policy alignment and implementation of initiatives that support voluntary return, local integration, resilience and long-term recovery.",
];

const values = [
  {
    title: "Dignity",
    description:
      "We promote solutions that respect the rights, dignity and choices of displacement-affected people.",
  },
  {
    title: "Inclusion",
    description:
      "We support inclusive planning that involves affected communities and relevant institutions.",
  },
  {
    title: "Coordination",
    description:
      "We strengthen coordinated government and partner action on durable solutions.",
  },
];

const services = [
  {
    title: "Durable Solutions Coordination",
    description:
      "Coordinate government institutions and partners working on displacement and durable solutions.",
  },
  {
    title: "Policy & Planning",
    description:
      "Support durable solutions strategies, policies and government planning processes.",
  },
  {
    title: "Displacement Data",
    description:
      "Promote evidence-based planning through displacement data, analysis and information sharing.",
  },
  {
    title: "Return & Reintegration",
    description:
      "Support coordinated planning for voluntary return, reintegration and recovery.",
  },
  {
    title: "Local Integration",
    description:
      "Support sustainable local integration approaches for displacement-affected populations.",
  },
  {
    title: "Partner Engagement",
    description:
      "Coordinate engagement with humanitarian, development and peacebuilding partners.",
  },
];

export default function DurableSolutionsPage() {
  return (
    <DepartmentPageLayout
      title="Durable Solutions Unit"
      shortTitle="Durable Solutions"
      image={departmentPhoto}
      overview={overview}
      vision="Displacement-affected communities in Jubaland achieve sustainable, dignified and resilient solutions."
      mission="To coordinate government and partner action that supports durable solutions, resilience, recovery and long-term development for displacement-affected communities."
      values={values}
      services={services}
    />
  );
}