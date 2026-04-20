export default function Sidebar({
  categories,
  activeCategory,
  handlePickCategory,
}) {
  return (
    <div className="rounded-xl bg-amber-200/40 p-4 h-full">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Categories</h3>

      <ul className="space-y-2">
        {categories.map((cat) => {
          const active = cat === activeCategory;

          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => handlePickCategory(cat)}
                className={[
                  "block w-full text-left text-sm",
                  "text-blue-600 hover:underline",
                  active ? "font-semibold underline" : "",
                ].join(" ")}
              >
                {cat}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}