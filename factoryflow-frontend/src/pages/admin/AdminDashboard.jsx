import React, { useState, useEffect, useMemo } from "react";
import { getAll as getProducts } from "../../services/productService";
import { getAll as getMaterials } from "../../services/materialService";
import { getOrders } from "../../services/orderService";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Badge from "../../components/ui/Badge";

const AdminDashboard = () => {
  const [data, setData] = useState({ products: [], materials: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsData, materialsData, ordersData] = await Promise.all([
          getProducts(),
          getMaterials(),
          getOrders(),
        ]);

        setData({
          products: productsData,
          materials: materialsData,
          orders: ordersData,
        });
      } catch (err) {
        setError("FAILED TO LOAD DASHBOARD DATA");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const orderStats = useMemo(() => {
    return data.orders.reduce((acc, order) => {
      const status = order.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [data.orders]);

  const lowStockMaterials = useMemo(() => {
    return data.materials.filter((m) => m.stock < m.threshold);
  }, [data.materials]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">DASHBOARD</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">TOTAL PRODUCTS</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.products.length}
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">TOTAL MATERIALS</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.materials.length}
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">TOTAL ORDERS</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.orders.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            ORDERS BY STATUS
          </h2>
          {Object.keys(orderStats).length === 0 ? (
            <p className="text-gray-500">NO ORDERS YET</p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(orderStats).map(([status, count]) => (
                <li
                  key={status}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <Badge status={status} />
                  <span className="font-bold text-gray-700">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-red-600">
            LOW STOCK ALERTS
          </h2>
          {lowStockMaterials.length === 0 ? (
            <p className="text-gray-500">
              ALL MATERIALS ARE SUFFICIENTLY STOCKED
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStockMaterials.map((material) => (
                <li
                  key={material._id || material.id}
                  className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50 rounded"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {material.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      REF: {material.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {material.stock} / {material.threshold}
                    </p>
                    <p className="text-xs font-medium text-red-500 uppercase">
                      BELOW THRESHOLD
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
