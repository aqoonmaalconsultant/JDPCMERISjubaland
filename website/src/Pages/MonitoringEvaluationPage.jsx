import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/Monitoring-department.png";
const overview = [
  "The Monitoring, Evaluation, Research & Learning Department supports the Ministry and Jubaland State institutions in tracking development performance, assessing results and generating evidence for improved decision-making.",

  "The department develops and maintains monitoring systems, supports evaluation and results analysis, conducts research and studies, and promotes learning from development programs and projects. Its work helps government institutions and partners understand progress, identify challenges and strengthen the effectiveness of interventions.",
];

const values = [
  {
    title: "Evidence",
    description:
      "We promote decisions based on reliable monitoring information, evaluation findings and research evidence.",
  },
  {
    title: "Accountability",
    description:
      "We support transparent reporting and measurement of development progress, performance and results.",
  },
  {
    title: "Learning",
    description:
      "We encourage institutions to use implementation experience and evaluation findings to improve future programs.",
  },
  {
    title: "Quality",
    description:
      "We promote sound monitoring, evaluation and research methodologies and consistent analytical standards.",
  },
  {
    title: "Transparency",
    description:
      "We support clear and accessible reporting of progress, achievements, challenges and lessons.",
  },
  {
    title: "Continuous Improvement",
    description:
      "We use monitoring, research and evaluation findings to strengthen program design and institutional performance.",
  },
];

const services = [
  {
    title: "Project Monitoring",
    description:
      "Tracks implementation progress, outputs, activities and performance of development projects and programs.",
  },
  {
    title: "Monitoring Systems",
    description:
      "Develops and maintains monitoring tools, frameworks and systems for tracking government and development interventions.",
  },
  {
    title: "Evaluation",
    description:
      "Supports assessments of project and program relevance, effectiveness, efficiency, outcomes and results.",
  },
  {
    title: "Results Measurement",
    description:
      "Supports results frameworks, indicators and analysis of progress against development objectives.",
  },
  {
    title: "Research & Studies",
    description:
      "Conducts and coordinates research, studies and analytical work to support government policies and development programming.",
  },
  {
    title: "Performance Reporting",
    description:
      "Supports preparation of monitoring reports, evaluation findings and performance information for management and stakeholders.",
  },
  {
    title: "Learning & Knowledge Management",
    description:
      "Promotes documentation and use of lessons learned, good practices and evidence from development interventions.",
  },
  {
    title: "Technical M&E Support",
    description:
      "Provides guidance and technical assistance to government institutions and projects on monitoring and evaluation systems.",
  },
];

function MonitoringEvaluationPage() {
  return (
    <DepartmentPageLayout
      title="Monitoring, Evaluation, Research & Learning Department"
      shortTitle="Monitoring, Evaluation, Research & Learning"
      image={departmentPhoto}
      overview={overview}
      vision="A results-oriented Jubaland where reliable evidence, research and learning continuously improve government performance and development outcomes."
      mission="To strengthen monitoring, evaluation, research and learning systems that provide credible evidence, measure results and support accountable and effective development across Jubaland State."
      values={values}
      services={services}
    />
  );
}

export default MonitoringEvaluationPage;