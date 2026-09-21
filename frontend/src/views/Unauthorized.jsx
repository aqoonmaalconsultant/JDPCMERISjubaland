import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Unauthorized() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md rounded border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded bg-amber-50 text-amber-700">
          <ShieldAlert size={26} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-500">Your current role does not have permission to open this page.</p>
        <Link className="mt-5 inline-flex rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800" to="/">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
