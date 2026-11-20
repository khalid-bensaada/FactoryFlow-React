import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAll as getProducts } from "../../services/productService";
import { getOperators } from "../../services/userService";
import { create as createOrder } from "../../services/orderService";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

const OrderForm = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([{ product: "", quantity: "" }]);
  const [operator, setOperator] = useState("");
  const [errors, setErrors] = useState("");

  const [products, setProducts] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsData, operatorsData] = await Promise.all([
          getProducts(),
          getOperators(),
        ]);
        setProducts(
          Array.isArray(productsData) ? productsData : productsData.items || [],
        );
        setOperators(
          Array.isArray(operatorsData)
            ? operatorsData
            : operatorsData.items || [],
        );
      } catch (err) {
        setErrors("Failed to load products or operators");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product: "", quantity: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalNeeds = useMemo(() => {
    const needs = {};

    items.forEach((item) => {
      const qty = Number(item.quantity);
      if (!item.product || qty <= 0) return;

      const productDoc = products.find((p) => (p._id || p.id) === item.product);
      if (!productDoc || !productDoc.composition) return;

      productDoc.composition.forEach((comp) => {
        const matObj = comp.material;
        const matId =
          typeof matObj === "object" ? matObj._id || matObj.id : matObj;
        const matName = typeof matObj === "object" ? matObj.name : "Material";
        const matRef = typeof matObj === "object" ? matObj.reference : "";
        const unitQty = comp.quantityPerUnit ?? comp.quantity ?? 0;

        if (!needs[matId]) {
          needs[matId] = {
            id: matId,
            name: matName,
            reference: matRef,
            total: 0,
          };
        }

        needs[matId].total += unitQty * qty;
      });
    });

    return Object.values(needs).map((n) => ({
      ...n,
      total: Math.round(n.total * 1e6) / 1e6,
    }));
  }, [items, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrors("At least one product is required");
      return;
    }

    const productIds = items.map((i) => i.product);
    if (productIds.some((id) => !id)) {
      setErrors("Please select a product for all rows");
      return;
    }

    if (new Set(productIds).size !== productIds.length) {
      setErrors("Duplicate products are not allowed");
      return;
    }

    if (items.some((i) => Number(i.quantity) <= 0)) {
      setErrors("All quantities must be strictly greater than 0");
      return;
    }

    if (!operator) {
      setErrors("Please assign an operator");
      return;
    }

    setErrors("");
    setSubmitting(true);

    try {
      await createOrder({
        assignedTo: operator,
        items: items.map((i) => ({
          product: i.product,
          quantity: Number(i.quantity),
        })),
      });
      navigate("/admin/orders");
    } catch (err) {
      setErrors(err.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          New Manufacturing Order
        </h1>
        <Button variant="secondary" onClick={() => navigate("/admin/orders")}>
          Cancel
        </Button>
      </div>

      {errors && <ErrorMessage message={errors} />}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
      >
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Assigned Operator
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="">Select an operator</option>
            {operators.map((op) => {
              const opId = op._id || op.id;
              return (
                <option key={opId} value={opId}>
                  {op.name} ({op.email})
                </option>
              );
            })}
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Products</h2>
            <Button type="button" variant="secondary" onClick={handleAddItem}>
              + Ajouter un produit
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No products added</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <label className="block mb-1 text-xs font-medium text-gray-700">
                      Product
                    </label>
                    <select
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((prod) => {
                        const prodId = prod._id || prod.id;
                        const isSelectedElsewhere = items.some(
                          (other, i) => i !== index && other.product === prodId,
                        );
                        return (
                          <option
                            key={prodId}
                            value={prodId}
                            disabled={isSelectedElsewhere}
                          >
                            {prod.reference} - {prod.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="block mb-1 text-xs font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Besoins totaux
          </h2>
          {totalNeeds.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Select products and enter valid quantities to calculate total
              material needs.
            </p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700">
                      Material
                    </th>
                    <th className="p-3 font-semibold text-gray-700">
                      Total Required
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {totalNeeds.map((need) => (
                    <tr key={need.id} className="border-b last:border-b-0">
                      <td className="p-3 font-medium text-gray-800">
                        {need.name} {need.reference && `(${need.reference})`}
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        {need.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/orders")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
