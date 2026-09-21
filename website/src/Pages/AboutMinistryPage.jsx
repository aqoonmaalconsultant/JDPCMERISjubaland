import {
  Building2,
  Eye,
  Flag,
  Target,
} from "lucide-react";

function AboutMinistryPage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-emerald-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
            About
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            The Ministry
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-100">
            Ministry of Planning, Investment and International Cooperation
            of Jubaland State of Somalia.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Building2 className="text-emerald-700" />

              <h2 className="text-2xl font-bold text-slate-900">
                Ministry Profile
              </h2>
            </div>

            <p className="mt-5 leading-8 text-slate-600">
              The Ministry of Planning, Investment and International
              Cooperation is responsible for coordinating development
              planning, investment, international cooperation and development
              initiatives across Jubaland State.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              The Ministry works with government institutions, districts,
              development partners, implementing organizations, investors and
              communities to improve coordination and support sustainable
              development.
            </p>
          </div>

          <div className="space-y-5">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Eye className="text-emerald-700" />

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Vision
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                A well-planned, coordinated and prosperous Jubaland driven by
                sustainable development and effective partnerships.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Flag className="text-emerald-700" />

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Mission
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                To provide effective planning, coordination, investment
                promotion and international cooperation that supports
                sustainable development across Jubaland State.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Target className="text-emerald-700" />

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Mandate
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Coordinate development priorities, projects, investments,
                partnerships, monitoring and development cooperation across
                Jubaland.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutMinistryPage;