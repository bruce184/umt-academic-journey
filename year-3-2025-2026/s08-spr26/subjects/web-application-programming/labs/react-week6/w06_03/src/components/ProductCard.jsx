const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

export default function ProductCard({ product, handleGoToDetails }) {
  const imgSrc = `/imgs/p${product.id}.png`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={product.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {product.title}
        </h4>

        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900">
            {money(product.price)}
          </span>

          <span className="text-xs text-slate-500">
            ★ {product.rating?.rate ?? "-"} ({product.rating?.count ?? 0})
          </span>
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => handleGoToDetails(product.id)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}