import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-950">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-amber-300/10" />

        <Building2
          size={58}
          className="relative text-emerald-100 transition duration-300 group-hover:scale-110"
        />

        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
          {project.status}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={17} />
          <span>{project.location}</span>
        </div>

        <h3 className="mt-3 text-xl font-bold leading-7 text-slate-900">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
          {project.description}
        </p>

        <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-slate-500">
              <Building2 size={16} />
              Ministry
            </dt>

            <dd className="max-w-[60%] text-right font-medium text-slate-800">
              {project.ministry}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-slate-500">
              <CircleDollarSign size={16} />
              Budget
            </dt>

            <dd className="font-medium text-slate-800">{project.budget}</dd>
          </div>

          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-slate-500">
              <CalendarDays size={16} />
              Period
            </dt>

            <dd className="font-medium text-slate-800">{project.period}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              Overall achievement
            </span>

            <span className="font-bold text-emerald-800">
              {project.achievement}%
            </span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-700 transition-all duration-700"
              style={{ width: `${project.achievement}%` }}
            />
          </div>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-800 transition hover:text-emerald-950"
        >
          View project details
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}

export default ProjectCard;