import {
  CheckCircle2,
  Eye,
  Flag,
  ShieldCheck,
} from "lucide-react";

function DepartmentPageLayout({
  title,
  shortTitle,
  overview,
  image,
  vision,
  mission,
  values,
  services,
}) {
  return (
    <main className="bg-slate-50">
      <section className="bg-emerald-950 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
            Departments
          </p>

          <h1 className="mt-3 max-w-4xl text-3xl font-bold sm:text-4xl">
            {title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
          <div className="min-h-[380px] bg-slate-100">
            <img
              src={image}
              alt={title}
              className="h-full min-h-[380px] w-full object-cover"
            />
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
              Department Overview
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {shortTitle}
            </h2>

            <div className="mt-6 space-y-4">
              {overview.map((paragraph) => (
                <p
                  key={paragraph}
                  className="leading-8 text-slate-600"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Eye size={24} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Vision
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              {vision}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Flag size={24} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Mission
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              {mission}
            </p>
          </article>
        </div>
      </section>

      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Our Values
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Principles guiding the department
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck size={22} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {value.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Services
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Core functions and services
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={22} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {service.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default DepartmentPageLayout;