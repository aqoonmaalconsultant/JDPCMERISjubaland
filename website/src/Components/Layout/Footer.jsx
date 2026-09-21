import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Link } from "react-router-dom";

const staffLoginUrl =
  "http://127.0.0.1:5173/login";

function Footer() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <section>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">
              JP
            </div>

            <div>
              <h2 className="font-bold text-white">
                MoPIIC Jubaland
              </h2>

              <p className="text-xs text-slate-400">
                Jubaland State of Somalia
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-400">
            Coordinating development planning,
            investment, international cooperation
            and project performance across
            Jubaland State.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
            <Link
              to="/about"
              className="hover:text-white"
            >
              About the Ministry
            </Link>

            <Link
              to="/departments"
              className="hover:text-white"
            >
              Departments
            </Link>

            <Link
              to="/projects"
              className="hover:text-white"
            >
              Jubaland Projects
            </Link>

            <Link
              to="/publications"
              className="hover:text-white"
            >
              Publications
            </Link>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Useful Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
            <Link
              to="/news"
              className="hover:text-white"
            >
              News and Events
            </Link>

            <Link
              to="/contact"
              className="hover:text-white"
            >
              Contact
            </Link>

            <a
              href={staffLoginUrl}
              className="hover:text-white"
            >
              Staff Login
            </a>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Contact Information
          </h3>

          <div className="mt-5 space-y-4 text-sm text-slate-400">
            <div className="flex gap-3">
              <MapPin
                className="shrink-0"
                size={18}
              />

              <span>
                Kismayo, Jubaland State of Somalia
              </span>
            </div>

            <div className="flex gap-3">
              <Phone
                className="shrink-0"
                size={18}
              />

              <span>
                Official ministry telephone
              </span>
            </div>

            <div className="flex gap-3">
              <Mail
                className="shrink-0"
                size={18}
              />

              <span>
                Official ministry email
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <p>
            © {currentYear} Ministry of Planning,
            Investment and International Cooperation.
          </p>

          <p>
            Jubaland State of Somalia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;