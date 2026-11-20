import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, getHistory } from "../../services/orderService";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Pagination from "../../components/Pagination";

const OperatorOrders = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      const response =
        activeTab === "active"
          ? await getMyOrders(params)
          : await getHistory(params);

      const items = response.items || [];
      const filteredItems =
        activeTab === "active"
          ? items.filter(
              (o) =>
                o.status !== "DONE" &&
                o.status !== "Terminé" &&
                o.status !== "CANCELLED" &&
                o.status !== "Annulé",
            )
          : items;

      setOrders(filteredItems);
      setTotalPages(
        response.totalPages || Math.ceil((response.total || 0) / 10),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const renderProductsSummary = (items) => {
    if (!items || items.length === 0) return "No products";
    const summary = items
      .map((item) => `${item.product?.name || "Unnamed"} (x${item.quantity})`)
      .join(", ");
    return summary.length > 50 ? summary.substring(0, 50) + "..." : summary;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          My Manufacturing Orders
        </h1>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            En cours / Planifié
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("history")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Terminés
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders found in this section" />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Reference</th>
                <th className="p-4 font-semibold text-gray-700">Products</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700">Date</th>
                <th className="p-4 font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium text-gray-900">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {renderProductsSummary(order.items)}
                  </td>
                  <td className="p-4">
                    <Badge status={order.status} />
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(
                      activeTab === "history" && order.finishedAt
                        ? order.finishedAt
                        : order.createdAt,
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      to={`/operator/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
};

export default OperatorOrders;
