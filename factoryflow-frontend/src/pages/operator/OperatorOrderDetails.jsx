import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getById, start, finish } from "../../services/orderService";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

const OperatorOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleConfirmStart = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      await start(id);
      setIsStartModalOpen(false);
      await fetchOrder();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to start order");
      setIsStartModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      await finish(id);
      await fetchOrder();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to finish order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return null;

  const isPlanned = order.status === "Planifié" || order.status === "PLANNED";
  const isInProgress =
    order.status === "En cours" || order.status === "IN_PROGRESS";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Order Details #{order._id?.slice(-6)}
          </h1>
          <p className="text-sm text-gray-500">
            Created on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/operator/orders")}
            disabled={submitting}
          >
            Back
          </Button>

          {isPlanned && (
            <Button
              variant="primary"
              onClick={() => {
                setActionError("");
                setIsStartModalOpen(true);
              }}
              disabled={submitting}
            >
              Démarrer
            </Button>
          )}

          {isInProgress && (
            <Button
              variant="primary"
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Terminer"}
            </Button>
          )}
        </div>
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Status
          </span>
          <div className="mt-2">
            <Badge status={order.status} />
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Started At
          </span>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {order.startedAt ? new Date(order.startedAt).toLocaleString() : "-"}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Finished At
          </span>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {order.finishedAt
              ? new Date(order.finishedAt).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Products to Manufacture
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Reference</th>
                <th className="p-4 font-semibold text-gray-700">
                  Product Name
                </th>
                <th className="p-4 font-semibold text-gray-700">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr
                  key={item.product?._id || index}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium text-gray-900">
                    {item.product?.reference || "N/A"}
                  </td>
                  <td className="p-4 text-gray-700">
                    {item.product?.name || "Unknown Product"}
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isStartModalOpen}
        onClose={() => !submitting && setIsStartModalOpen(false)}
        title="Confirm Order Start"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Starting this order will immediately deduct the required raw
            materials from stock. Are you sure you want to proceed?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsStartModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmStart}
              disabled={submitting}
            >
              {submitting ? "Starting..." : "Confirm Start"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OperatorOrderDetails;
