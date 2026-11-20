import React, { useState, useEffect } from "react";
import { getMovements } from "../../services/materialService";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";
import ErrorMessage from "../ui/ErrorMessage";

const MovementsTable = ({ materialId }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = await getMovements(materialId);
        setMovements(data);
      } catch (err) {
        setError("FAILED TO LOAD MOVEMENTS");
      } finally {
        setLoading(false);
      }
    };
    if (materialId) fetchMovements();
  }, [materialId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (movements.length === 0)
    return <EmptyState message="NO MOVEMENTS FOUND" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left bg-white border border-gray-200">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3">DATE</th>
            <th className="p-3">TYPE</th>
            <th className="p-3">QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((mov) => (
            <tr key={mov._id || mov.id} className="border-b">
              <td className="p-3">
                {new Date(mov.date || mov.createdAt).toLocaleDateString()}
              </td>
              <td className="p-3">{mov.type}</td>
              <td className="p-3">{mov.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovementsTable;
