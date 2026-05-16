import ProductCard from "./ProductCard.jsx";

export default function ProductList({ title, products, handleGoToDetails }) {
  return (
    <section className="rounded-xl bg-indigo-200/30 p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div className="text-xs text-slate-600">{products.length} sản phẩm</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            handleGoToDetails={handleGoToDetails}
          />
        ))}
      </div>
    </section>
  );
}