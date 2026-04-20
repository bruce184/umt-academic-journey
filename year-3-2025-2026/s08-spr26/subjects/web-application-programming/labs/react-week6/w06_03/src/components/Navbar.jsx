export default function Navbar({ handleGoToHome }) {
  return (
    <header className="rounded-xl bg-sky-200/40 px-4 py-3">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handleGoToHome}
          className="text-lg font-semibold text-slate-900 hover:underline"
          type="button"
        >
          Home
        </button>

        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <a
            className="text-slate-700 hover:text-slate-900 hover:underline"
            href="#about"
          >
            About
          </a>
          <a
            className="text-slate-700 hover:text-slate-900 hover:underline"
            href="#services"
          >
            Services
          </a>
          <a
            className="text-slate-700 hover:text-slate-900 hover:underline"
            href="#contact"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}