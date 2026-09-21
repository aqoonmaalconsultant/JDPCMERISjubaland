function ServiceCard({ title, description, icon: Icon }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-800 transition group-hover:bg-emerald-800 group-hover:text-white">
        <Icon size={27} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>

      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </article>
  );
}

export default ServiceCard;