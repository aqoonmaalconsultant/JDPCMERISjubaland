import DepartmentPageLayout from "../Components/Departments/DepartmentPageLayout";

import departmentPhoto from "../assets/Investment-department.png";

const overview = [
  "The Investment Promotion Department is responsible for promoting Jubaland State as an attractive destination for domestic and international investment and supporting the development of a competitive and enabling investment environment.",

  "The department identifies investment opportunities, facilitates engagement with investors, supports investment promotion initiatives, provides information on priority sectors and works with government institutions and the private sector to encourage responsible and sustainable investment across Jubaland State.",
];

const values = [
  {
    title: "Transparency",
    description:
      "We promote clear, accessible and transparent investment information and processes.",
  },
  {
    title: "Partnership",
    description:
      "We strengthen cooperation between government, investors, businesses and development partners.",
  },
  {
    title: "Sustainability",
    description:
      "We promote investments that contribute to sustainable economic and social development.",
  },
];

const services = [
  {
    title: "Investment Promotion",
    description:
      "Promote Jubaland investment opportunities to domestic, regional and international investors.",
  },
  {
    title: "Investor Facilitation",
    description:
      "Provide information, coordination and institutional support to prospective and existing investors.",
  },
  {
    title: "Investment Opportunities",
    description:
      "Identify and profile priority investment opportunities across key economic sectors.",
  },
  {
    title: "Private Sector Engagement",
    description:
      "Strengthen engagement between government institutions, businesses and investors.",
  },
  {
    title: "Investment Information",
    description:
      "Provide relevant information on sectors, opportunities, policies and the investment environment.",
  },
  {
    title: "Investment Partnerships",
    description:
      "Support strategic partnerships that contribute to economic growth, employment and development.",
  },
];

export default function InvestmentPromotionPage() {
  return (
    <DepartmentPageLayout
      title="Investment Promotion Department"
      shortTitle="Investment Promotion"
      image={departmentPhoto}
      overview={overview}
      vision="A competitive and attractive Jubaland investment environment that supports sustainable economic growth, employment and private sector development."
      mission="To promote investment opportunities, facilitate investors and strengthen partnerships that contribute to inclusive and sustainable economic development in Jubaland State."
      values={values}
      services={services}
    />
  );
}