import React, { useState, useEffect } from "react";
import {
  getAll,
  create,
  update,
  addStock,
} from "../../services/materialService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import MaterialForm from "../../components/materials/MaterialForm";
import AddStockForm from "../../components/materials/AddStockForm";
import MovementsTable from "../../components/materials/MovementsTable";

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockMaterial, setStockMaterial] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyMaterial, setHistoryMaterial] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getAll();
      setMaterials(data);
      setError("");
    } catch (err) {
      setError("FAILED TO LOAD MATERIALS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleOpenCreate = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleOpenStock = (material) => {
    setStockMaterial(material);
    setIsStockModalOpen(true);
  };

  const handleOpenHistory = (material) => {
    setHistoryMaterial(material);
    setIsHistoryModalOpen(true);
  };

  const handleSaveMaterial = async (data) => {
    try {
      if (selectedMaterial) {
        await update(selectedMaterial._id || selectedMaterial.id, data);
      } else {
        await create(data);
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      alert("FAILED TO SAVE MATERIAL");
    }
  };

  const handleAddStock = async (quantity) => {
    try {
      await addStock(stockMaterial._id || stockMaterial.id, quantity);
      setIsStockModalOpen(false);
      fetchMaterials();
    } catch (err) {
      alert("FAILED TO ADD STOCK");
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.reference.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold">MATERIALS</h1>
        <Button onClick={handleOpenCreate}>+ NEW MATERIAL</Button>
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
      ) : filteredMaterials.length === 0 ? (
        <EmptyState message="NO MATERIALS FOUND" />
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold">NAME</th>
                <th className="p-4 font-semibold">REFERENCE</th>
                <th className="p-4 font-semibold">STOCK</th>
                <th className="p-4 font-semibold">THRESHOLD</th>
                <th className="p-4 font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => (
                <tr
                  key={material._id || material.id}
                  className={`border-b hover:bg-gray-50 ${material.stock < material.threshold ? "bg-red-50" : ""}`}
                >
                  <td className="p-4">{material.name}</td>
                  <td className="p-4">{material.reference}</td>
                  <td className="p-4">
                    <span
                      className={
                        material.stock < material.threshold
                          ? "text-red-600 font-bold"
                          : ""
                      }
                    >
                      {material.stock}
                    </span>
                    {material.stock < material.threshold && (
                      <span className="ml-2 text-xs text-red-600 border border-red-600 px-1 rounded">
                        LOW
                      </span>
                    )}
                  </td>
                  <td className="p-4">{material.threshold}</td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleOpenEdit(material)}
                      className="text-blue-600 hover:underline"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleOpenStock(material)}
                      className="text-green-600 hover:underline"
                    >
                      STOCK
                    </button>
                    <button
                      onClick={() => handleOpenHistory(material)}
                      className="text-gray-600 hover:underline"
                    >
                      HISTORIQUE
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
        title={selectedMaterial ? "EDIT MATERIAL" : "NEW MATERIAL"}
      >
        <MaterialForm
          initialData={selectedMaterial}
          onSubmit={handleSaveMaterial}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`ADD STOCK - ${stockMaterial?.name}`}
      >
        <AddStockForm
          onSubmit={handleAddStock}
          onCancel={() => setIsStockModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`HISTORY - ${historyMaterial?.name}`}
      >
        <MovementsTable
          materialId={historyMaterial?._id || historyMaterial?.id}
        />
      </Modal>
    </div>
  );
};

export default Materials;
