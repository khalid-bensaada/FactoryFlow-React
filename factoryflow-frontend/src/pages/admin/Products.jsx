import React, { useState, useEffect } from "react";
import { getAll, create, update } from "../../services/productService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import ProductForm from "../../components/products/ProductForm";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getAll();
      setProducts(data);
      setError("");
    } catch (err) {
      setError("FAILED TO LOAD PRODUCTS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data) => {
    try {
      if (selectedProduct) {
        await update(selectedProduct._id || selectedProduct.id, data);
      } else {
        await create(data);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("FAILED TO SAVE PRODUCT");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold">PRODUCTS</h1>
        <Button onClick={handleOpenCreate}>+ NEW PRODUCT</Button>
      </div>

      <div className="w-full md:w-1/3">
        <Input
          placeholder="SEARCH BY NAME OR REFERENCE..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState message="NO PRODUCTS FOUND" />
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold">REFERENCE</th>
                <th className="p-4 font-semibold">NAME</th>
                <th className="p-4 font-semibold">MATERIALS COUNT</th>
                <th className="p-4 font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id || product.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">{product.reference}</td>
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-gray-700 bg-gray-200 rounded-full">
                      {product.composition?.length || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      EDIT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? "EDIT PRODUCT" : "NEW PRODUCT"}
      >
        <ProductForm
          initialData={selectedProduct}
          onSubmit={handleSaveProduct}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Products;
