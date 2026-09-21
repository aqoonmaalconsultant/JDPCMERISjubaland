import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/Admin-HR-finance.png";
const overview = [
  "The Administration, Finance & Human Resources Department provides the institutional, administrative and operational support required for the Ministry to perform its mandate effectively.",

  "The department manages administration, procurement and logistics, financial management, human resources, ICT systems, archives, assets, facilities and other internal support services. It works to ensure that Ministry resources, staff and systems are managed efficiently, transparently and in accordance with established procedures.",
];

const values = [
  {
    title: "Integrity",
    description:
      "We promote responsible management of public resources, finances, assets and administrative systems.",
  },
  {
    title: "Transparency",
    description:
      "We support clear procedures, documentation, reporting and accountability in administrative and financial operations.",
  },
  {
    title: "Efficiency",
    description:
      "We aim to provide timely and effective support services that enable the Ministry to deliver its mandate.",
  },
  {
    title: "Professionalism",
    description:
      "We promote strong standards of conduct, competence and responsibility among Ministry staff.",
  },
  {
    title: "Service",
    description:
      "We provide dependable administrative, financial, HR and ICT support to Ministry departments and leadership.",
  },
  {
    title: "Compliance",
    description:
      "We support adherence to approved policies, procedures, budgets, procurement requirements and administrative controls.",
  },
];

const services = [
  {
    title: "Administration",
    description:
      "Provides administrative support, facility management, utilities, office services and institutional operational coordination.",
  },
  {
    title: "Procurement & Logistics",
    description:
      "Prepares procurement plans, supports procurement activities, manages logistics and coordinates supply and operational requirements.",
  },
  {
    title: "Finance & Accounting",
    description:
      "Manages cash, budgeting, accounting, bank reconciliation, financial documentation and financial reporting.",
  },
  {
    title: "Budget Management",
    description:
      "Supports preparation, control, monitoring and reporting of the Ministry budget and financial projections.",
  },
  {
    title: "Human Resources",
    description:
      "Manages staff records, contracts, leave, performance, job descriptions, HR policies and workforce administration.",
  },
  {
    title: "Staff Development",
    description:
      "Identifies training needs, supports capacity-building programs, internships and staff development planning.",
  },
  {
    title: "ICT Services",
    description:
      "Manages Ministry IT systems, networks, email services, servers, databases, hardware and technical support.",
  },
  {
    title: "Records & Archives",
    description:
      "Manages incoming and outgoing documents, manual and electronic archives and institutional records.",
  },
  {
    title: "Asset Management",
    description:
      "Maintains inventories and supports management of vehicles, equipment, fixed assets, stores and Ministry facilities.",
  },
];

function AdministrationFinancePage() {
  return (
    <DepartmentPageLayout
      title="Administration, Finance & Human Resources Department"
      shortTitle="Administration, Finance & Human Resources"
      image={departmentPhoto}
      overview={overview}
      vision="A well-managed Ministry supported by efficient administration, sound financial systems, capable staff and reliable institutional services."
      mission="To provide transparent, efficient and professional administrative, financial, human resource, procurement, ICT and institutional support services that enable the Ministry to achieve its mandate."
      values={values}
      services={services}
    />
  );
}

export default AdministrationFinancePage;