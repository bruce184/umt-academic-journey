import { useState } from "react";
import data from "./assets/data.json";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import "./styles/utilities.css";

function App() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const set = new Set(data.map((p) => p.category));
  const categories = Array.from(set).sort((a, b) => a.localeCompare(b));

  const filteredProducts = !activeCategory
    ? data
    : data.filter((p) => p.category === activeCategory);

  const selectedProduct =
    selectedProductId == null
      ? null
      : data.find((p) => p.id === selectedProductId) || null;

  const goHome = () => {
    setActiveCategory(null);
    setSelectedProductId(null);
  };

  const pickCategory = (cat) => {
    setActiveCategory(cat);
    setSelectedProductId(null);
  };

  const goToDetails = (id) => {
    setSelectedProductId(id);
  };

  const backToList = () => {
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-3 py-3">
        <Navbar handleGoToHome={goHome} />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <aside className="sm:col-span-3">
            <Sidebar
              categories={categories}
              activeCategory={activeCategory}
              handlePickCategory={pickCategory}
            />
          </aside>

          <main className="sm:col-span-9">
            {selectedProduct ? (
              <ProductDetails
                product={selectedProduct}
                handleGoToBack={backToList}
              />
            ) : (
              <ProductList
                title={activeCategory ? `Category: ${activeCategory}` : "Tất cả sản phẩm"}
                products={filteredProducts}
                handleGoToDetails={goToDetails}
              />
            )}
          </main>
        </div>

        <footer className="mt-3 rounded-xl bg-slate-200/60 px-4 py-4 text-center text-sm text-slate-700">
          Footer content goes here
        </footer>
      </div>
    </div>
  );
}

export default App;