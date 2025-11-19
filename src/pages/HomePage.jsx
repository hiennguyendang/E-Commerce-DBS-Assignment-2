import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import ProductList from "../components/product/ProductList";
import ProductFilter from "../components/product/ProductFilter";
import mockProducts from "../data/mockProducts";

export default function HomePage({ onAddToCart }) {
  const { searchTerm } = useOutletContext();  // 🔍 lấy searchTerm từ AppLayout

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);

  // Lấy data lần đầu
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axiosInstance.get("/products");

        const data = res?.data?.length ? res.data : mockProducts;

        setProducts(data);
        setFiltered(data);

        const cats = [...new Set(data.map((p) => p.category))];
        setCategories(cats);

      } catch {
        setProducts(mockProducts);
        setFiltered(mockProducts);
        setCategories([...new Set(mockProducts.map((p) => p.category))]);
      }
    }

    fetchData();
  }, []);

  // Lọc theo search bar
  useEffect(() => {
    if (!searchTerm) {
      setFiltered(products);
      return;
    }

    const lower = searchTerm.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, products]);

  // Lọc theo bộ lọc bên trái
  const handleFilter = (type, value) => {
    let result = [...products];
    if (type === "category" && value) result = result.filter((p) => p.category === value);
    if (type === "maxPrice" && value) result = result.filter((p) => p.price <= value);
    setFiltered(result);
  };

  return (
    <div className="row g-4">
      <div className="col-lg-3">
        <ProductFilter
          categories={categories.map((c, i) => ({ id: i, name: c }))}
          onFilter={handleFilter}
        />
      </div>

      <div className="col-lg-9">
        <ProductList products={filtered} onAddToCart={onAddToCart} />
      </div>
    </div>
  );
}
