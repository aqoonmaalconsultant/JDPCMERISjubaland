import {
  BriefcaseBusiness,
  Mail,
  Phone,
} from "lucide-react";

import deputyMinisterPhoto from "../assets/Leadership/deputy-minister-farah-muktar-daud.png";

const deputyMinister = {
  name: "Hon. Farah Muktar Daud",
  title:
    "Deputy Minister",
  institution: "Ministry of Planning, Investment and International Cooperation Jubaland State of Somalia",
  email: "deputy-mopic@jubalandstate.so",
  phone: "+252616705381",
};

function FacebookIcon({ size = 20 }) {
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

function XIcon({ size = 20 }) {
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

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-emerald-800">
          {value}
        </p>
      </div>
    </a>
  );
}

function DisabledSocial({
  icon: Icon,
  label,
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Official profile
        </p>
      </div>
    </div>
  );
}

function DeputyMinisterPage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-emerald-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
            Ministry Leadership
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Deputy Minister
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-slate-100">
              <img
                src={deputyMinisterPhoto}
                alt={deputyMinister.name}
                className="h-full min-h-[520px] w-full object-cover object-top"
              />
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Deputy Minister
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                {deputyMinister.name}
              </h2>

              <p className="mt-4 text-lg font-semibold leading-8 text-slate-700">
                {deputyMinister.title}
              </p>

              <p className="mt-1 text-slate-500">
                {deputyMinister.institution}
              </p>

              <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-8">
                <BriefcaseBusiness
                  className="mt-1 shrink-0 text-emerald-700"
                  size={23}
                />

                <p className="leading-8 text-slate-600">
                  The Deputy Minister supports the Ministry's
                  political leadership, institutional coordination and
                  implementation of development planning, investment
                  and international cooperation responsibilities.
                </p>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-bold text-slate-900">
                  Contact Information
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <ContactLink
                    icon={Mail}
                    label="Email"
                    value={deputyMinister.email}
                    href={`mailto:${deputyMinister.email}`}
                  />

                  <ContactLink
                    icon={Phone}
                    label="Phone"
                    value={deputyMinister.phone}
                    href={`tel:${deputyMinister.phone}`}
                  />

                  <DisabledSocial
                    icon={FacebookIcon}
                    label="Facebook"
                  />

                  <DisabledSocial
                    icon={XIcon}
                    label="X / Twitter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DeputyMinisterPage;