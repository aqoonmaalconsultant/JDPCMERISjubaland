import {
  BarChart3,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileBarChart,
  Globe2,
  Handshake,
  Landmark,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import ministerPhoto from "../assets/Leadership/minister-abdirahman-abdi-ahmed.png";
import deputyMinisterPhoto from "../assets/Leadership/deputy-minister-farah-muktar-daud.png";
import directorGeneralPhoto from "../assets/Leadership/director-general-mohamed-wali.png";

import PrimaryLink from "../components/ui/PrimaryLink";
import SectionHeading from "../components/ui/SectionHeading";
import StatCard from "../components/home/StatCard";
import ServiceCard from "../components/home/ServiceCard";
import ProjectCard from "../components/projects/ProjectCard";

/*
 * Social icons are local SVG components.
 * Do NOT import Facebook or X/Twitter from lucide-react because the
 * installed lucide-react version does not provide those exports.
 */
function FacebookIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 22v-8h2.8l.4-3.1h-3.2V9c0-.9.3-1.5 1.6-1.5h1.7V4.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.3V14h2.8v8h3.4Z" />
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.2 2H21l-6.2 7.1L22 22h-5.7l-4.5-5.9L6.6 22H3.8l6.7-7.7L3.6 2h5.8l4.1 5.4L18.2 2Zm-1 17.7h1.6L8.5 4.2H6.8l10.4 15.5Z" />
    </svg>
  );
}

const statistics = [
  {
    title: "Registered Projects",
    value: "245",
    description: "Projects registered across Jubaland State.",
    icon: Building2,
  },
  {
    title: "Ongoing Projects",
    value: "126",
    description: "Projects currently under implementation.",
    icon: BarChart3,
  },
  {
    title: "Completed Projects",
    value: "78",
    description: "Projects successfully completed.",
    icon: CheckCircle2,
  },
  {
    title: "Total Investment",
    value: "$480M",
    description: "Combined value of the project portfolio.",
    icon: CircleDollarSign,
  },
];

const leadership = [
  {
    name: "Hon. Abdirahman Abdi Ahmed",
    position: "Minister",
    organization:
      "Ministry of Planning, Investment and International Cooperation Jubaland State of Somalia",
    description:
      "Providing strategic and political leadership for development planning, investment promotion and international cooperation across Jubaland State.",
    image: ministerPhoto,
    path: "/leadership/minister",
    email: "mopic@jubalandstate.so",
    phone: "+252 613711161",
    facebook: "https://www.facebook.com/abdirahmanhaji.abdi/",
    x: "",
  },
  {
    name: "Hon. Farah Muktar Daud",
    position: "Deputy Minister",
    organization:
      "Ministry of Planning, Investment and International Cooperation Jubaland State of Somalia",
    description:
      "Supporting ministerial leadership, institutional coordination and implementation of the Ministry’s development mandate.",
    image: deputyMinisterPhoto,
    path: "/leadership/deputy-minister",
    email: "deputy-mopic@jubalandstate.so",
    phone: "+252616705381",
    facebook: "",
    x: "",
  },
  {
    name: "Mr. Mohamed Wali",
    position: "Director General",
    organization:
      "Ministry of Planning, Investment and International Cooperation",
    description:
      "Leading the Ministry’s administration, technical departments and institutional delivery of planning and coordination services.",
    image: directorGeneralPhoto,
    path: "/leadership/director-general",
    email: "dg-mopic@jubalandstate.so",
    phone: "+254 613088886",
    facebook: "",
    x: "",
  },
];

const services = [
  {
    title: "Development Planning",
    description:
      "Coordinating development priorities, strategies and implementation plans across Jubaland State institutions.",
    icon: Target,
  },
  {
    title: "Project Coordination",
    description:
      "Registering and coordinating government and partner-supported projects across sectors and districts.",
    icon: Building2,
  },
  {
    title: "Investment Promotion",
    description:
      "Supporting responsible public and private investment opportunities that contribute to sustainable development.",
    icon: Landmark,
  },
  {
    title: "International Cooperation",
    description:
      "Strengthening cooperation with donors, development partners, international institutions and investors.",
    icon: Globe2,
  },
  {
    title: "Monitoring and Evaluation",
    description:
      "Tracking project progress, financial performance, outputs, outcomes and overall development results.",
    icon: FileBarChart,
  },
  {
    title: "Aid Coordination",
    description:
      "Improving transparency, alignment and coordination of development assistance provided to Jubaland State.",
    icon: Handshake,
  },
];

const featuredProjects = [
  {
    id: "bardera-water-supply",
    title: "Bardera Water Supply Improvement Project",
    description:
      "Improving access to reliable and sustainable water services for communities in Bardera District.",
    ministry: "Ministry of Energy and Water Resources",
    location: "Bardera District",
    budget: "$2.4 million",
    period: "2025–2027",
    status: "Ongoing",
    achievement: 68,
  },
  {
    id: "agriculture-development",
    title: "Jubaland Agricultural Development Programme",
    description:
      "Supporting productive agriculture, food security and improved livelihoods for farming communities.",
    ministry: "Ministry of Agriculture",
    location: "Multiple Districts",
    budget: "$5.8 million",
    period: "2025–2028",
    status: "Ongoing",
    achievement: 45,
  },
  {
    id: "health-facilities",
    title: "Regional Health Facility Improvement Project",
    description:
      "Rehabilitating priority health facilities and improving access to essential healthcare services.",
    ministry: "Ministry of Health",
    location: "Kismayo District",
    budget: "$3.1 million",
    period: "2024–2026",
    status: "Ongoing",
    achievement: 82,
  },
];

const principles = [
  {
    title: "Accountability",
    description:
      "Promoting responsible planning, transparent reporting and measurable development results.",
    icon: ShieldCheck,
  },
  {
    title: "Partnership",
    description:
      "Building strong cooperation between government institutions, communities and development partners.",
    icon: Users,
  },
  {
    title: "Evidence-based planning",
    description:
      "Using reliable data and analysis to guide government priorities and investment decisions.",
    icon: BarChart3,
  },
];

function SocialButton({ href, icon: Icon, label }) {
  if (!href) {
    return (
      <span
        title={`${label} profile not yet linked`}
        aria-label={`${label} profile not yet linked`}
        className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 transition duration-200 hover:scale-110 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-500"
      >
        <Icon size={17} />
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition duration-200 hover:-translate-y-1 hover:scale-110 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
    >
      <Icon size={17} />
    </a>
  );
}

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-emerald-950">
        <div className="absolute inset-0">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-amber-300/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-900/70 px-4 py-2 text-sm font-semibold text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Jubaland State of Somalia
            </p>

            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Planning and coordinating a stronger future for Jubaland
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/80">
              The Ministry of Planning, Investment and International
              Cooperation coordinates development priorities, investments,
              partnerships and project performance across Jubaland State.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink to="/projects" variant="gold">
                Explore Jubaland Projects
              </PrimaryLink>

              <PrimaryLink to="/about" variant="light">
                About the Ministry
              </PrimaryLink>
            </div>
          </div>

          {/* JAIMS CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            <div className="rounded-2xl bg-white p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                    JAIMS
                  </p>

                  <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-900">
                    Jubaland Aid Information Management System
                  </h2>
                </div>

                <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-800">
                  <MapPinned size={29} />
                </div>
              </div>

              <p className="mt-5 leading-7 text-slate-600">
                A centralized information management system for registering,
                coordinating, monitoring and reporting development projects,
                organizations, partners and aid activities across Jubaland
                State.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-3xl font-bold text-slate-900">9</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Districts covered
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-3xl font-bold text-slate-900">24+</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Partner institutions
                  </p>
                </div>
              </div>

              <PrimaryLink
                to="/jaims"
                variant="primary"
                className="mt-7 w-full"
              >
                Open JAIMS
              </PrimaryLink>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:grid-cols-2 lg:grid-cols-4">
          {statistics.map((statistic) => (
            <StatCard key={statistic.title} {...statistic} />
          ))}
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Ministry leadership"
            title="Leadership committed to Jubaland’s development"
            description="The Ministry’s leadership provides strategic direction, institutional oversight and technical coordination for planning, investment and international cooperation."
            align="center"
          />

          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {leadership.map((leader) => (
              <article
                key={leader.name}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-80 overflow-hidden bg-slate-100">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                    {leader.position}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {leader.name}
                  </h3>

                  <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    {leader.organization}
                  </p>

                  <p className="mt-4 flex-1 leading-7 text-slate-600">
                    {leader.description}
                  </p>

                  {/* CONTACT DETAILS */}
                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <div className="space-y-2">
                      <a
                        href={`mailto:${leader.email}`}
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
                      >
                        <Mail
                          size={17}
                          className="shrink-0 text-emerald-700"
                        />

                        <span className="break-all">{leader.email}</span>
                      </a>

                      <a
                        href={`tel:${leader.phone.replace(/\s+/g, "")}`}
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
                      >
                        <Phone
                          size={17}
                          className="shrink-0 text-emerald-700"
                        />

                        <span>{leader.phone}</span>
                      </a>
                    </div>

                    {/* SOCIAL MEDIA */}
                    <div className="mt-4 flex items-center gap-2">
                      <SocialButton
                        href={leader.facebook}
                        icon={FacebookIcon}
                        label={`${leader.name} Facebook`}
                      />

                      <SocialButton
                        href={leader.x}
                        icon={XIcon}
                        label={`${leader.name} X / Twitter`}
                      />
                    </div>
                  </div>

                  <PrimaryLink
                    to={leader.path}
                    variant="secondary"
                    className="mt-5"
                  >
                    View Profile
                  </PrimaryLink>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <PrimaryLink to="/leadership/minister" variant="primary">
              Meet Ministry Leadership
            </PrimaryLink>
          </div>
        </div>
      </section>

      {/* MINISTRY MANDATE */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Ministry mandate"
          title="Coordinating accountable and sustainable development"
          description="The Ministry works with government institutions, districts, communities, donors and implementing partners to improve planning, coordination and measurable development results."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="bg-slate-100 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Featured projects"
              title="Development initiatives across Jubaland"
              description="Explore selected projects, their locations, budgets, implementation periods and overall achievement."
            />

            <PrimaryLink
              to="/projects"
              variant="secondary"
              className="shrink-0"
            >
              View All Projects
            </PrimaryLink>
          </div>

          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our approach"
            title="Principles guiding our work"
            description="Our planning and coordination responsibilities are guided by transparency, cooperation and evidence-based decision-making."
            align="center"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center"
                >
                  <div className="mx-auto inline-flex rounded-full bg-emerald-100 p-4 text-emerald-800">
                    <Icon size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {principle.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <SectionHeading
            eyebrow="Government and development partners"
            title="Working together for sustainable development"
            description="The Ministry promotes effective coordination among government institutions, districts, donors, implementing partners, investors and communities."
            light
          />

          <PrimaryLink
            to="/contact"
            variant="gold"
            className="shrink-0"
          >
            Contact the Ministry
          </PrimaryLink>
        </div>
      </section>
    </>
  );
}

export default HomePage;