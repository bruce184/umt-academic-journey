const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

export default function ProductDetails({ product, handleGoToBack }) {
  const imgSrc = `/imgs/p${product.id}.png`;

  return (
    <section className="rounded-xl bg-indigo-200/30 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleGoToBack}
          className="rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
        >
          ← Quay lại
        </button>

        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {product.category}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <div className="aspect-square">
            <img
              src={imgSrc}
              alt={product.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white/70 p-4 ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{product.title}</h2>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            {product.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-bold text-slate-900">
              Price: {money(product.price)}
            </div>

            <div className="text-sm text-slate-600">
              ★ {product.rating?.rate ?? "-"} ({product.rating?.count ?? 0})
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}