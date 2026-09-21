import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

function NewsCard({ article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-emerald-900 to-emerald-700">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-amber-300/10" />

        <span className="relative text-5xl font-black tracking-tight text-white/90">
          {article.shortCode}
        </span>

        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
          {article.category}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={16} />
          <span>{article.date}</span>
        </div>

        <h3 className="mt-3 text-xl font-bold leading-7 text-slate-900 transition group-hover:text-emerald-800">
          {article.title}
        </h3>

        <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
          {article.summary}
        </p>

        <Link
          to={`/news/${article.id}`}
          className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-800 transition hover:text-emerald-950"
        >
          Read full article
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}

export default NewsCard;