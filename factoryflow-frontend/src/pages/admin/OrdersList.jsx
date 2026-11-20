import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAll } from "../../services/orderService";
import Pagination from "../../components/Pagination";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    PLANNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const defaultStyle = "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || defaultStyle}`}
    >
      {status}
    </span>
  );
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    status: "",
    product: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.product && { product: filters.product }),
        ...(filters.dateFrom && { from: filters.dateFrom }),
        ...(filters.dateTo && { to: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await getAll(params);

      setOrders(response.items || []);
      setTotalPages(
        response.totalPages || Math.ceil((response.total || 0) / 10),
      );
    } catch (err) {
      setError(err.message || "An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manufacturing Orders (Admin)
        </h1>
        <Link
          to="/admin/orders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Add New Order
        </Link>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search (Reference...)"
          value={filters.search}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="PLANNED">PLANNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <input
          type="text"
          name="product"
          placeholder="Product ID"
          value={filters.product}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded shadow text-gray-500">
          No results match your search.
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 font-medium text-gray-600">
                  Reference
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Products (Summary)
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Operator
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Created At
                </th>
                <th className="px-6 py-3 font-medium text-gray-600 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{order._id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {renderProductsSummary(order.items)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    {order.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      Details
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

export default OrdersList;
