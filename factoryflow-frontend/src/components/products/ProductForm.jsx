import React, { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { getAll as getMaterials } from "../../services/materialService";

const ProductForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
  });
  const [composition, setComposition] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getMaterials();
        setAvailableMaterials(data);
      } catch (err) {
        setError("FAILED TO LOAD MATERIALS");
      }
    };

    fetchMaterials();

    if (initialData) {
      setFormData({
        name: initialData.name || "",
        reference: initialData.reference || "",
      });
      const initialComp = (initialData.composition || []).map((item) => ({
        material:
          typeof item.material === "object"
            ? item.material._id || item.material.id
            : item.material,
        quantity: item.quantity,
      }));
      setComposition(initialComp);
    } else {
      setFormData({ name: "", reference: "" });
      setComposition([]);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddComposition = () => {
    setComposition((prev) => [...prev, { material: "", quantity: "" }]);
  };

  const handleCompositionChange = (index, field, value) => {
    setComposition((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveComposition = (index) => {
    setComposition((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.reference.trim()) {
      setError("REFERENCE IS REQUIRED");
      return;
    }

    if (composition.length === 0) {
      setError("AT LEAST ONE MATERIAL IS REQUIRED IN COMPOSITION");
      return;
    }

    const materialIds = composition.map((c) => c.material);
    const uniqueMaterialIds = new Set(materialIds);

    if (uniqueMaterialIds.size !== materialIds.length) {
      setError("DUPLICATE MATERIALS IN COMPOSITION ARE NOT ALLOWED");
      return;
    }

    for (let item of composition) {
      if (!item.material) {
        setError("PLEASE SELECT A MATERIAL FOR ALL ROWS");
        return;
      }
      if (Number(item.quantity) <= 0) {
        setError("QUANTITY MUST BE STRICTLY GREATER THAN 0");
        return;
      }
    }

    setError("");
    onSubmit({
      ...formData,
      composition: composition.map((c) => ({
        material: c.material,
        quantity: Number(c.quantity),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      <Input
        label="REFERENCE"
        name="reference"
        value={formData.reference}
        onChange={handleChange}
        required
      />
      <Input
        label="NAME"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">COMPOSITION</h4>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddComposition}
          >
            + ADD MATERIAL
          </Button>
        </div>

        {composition.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            NO MATERIALS ADDED YET
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {composition.map((item, index) => (
              <div
                key={index}
                className="flex items-end gap-3 p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex flex-col flex-1">
                  <label className="mb-1 text-xs font-medium text-gray-700">
                    MATERIAL
                  </label>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={item.material}
                    onChange={(e) =>
                      handleCompositionChange(index, "material", e.target.value)
                    }
                    required
                  >
                    <option value="">SELECT A MATERIAL</option>
                    {availableMaterials.map((mat) => {
                      const matId = mat._id || mat.id;
                      const isSelectedElsewhere = composition.some(
                        (c, i) => i !== index && c.material === matId,
                      );
                      return (
                        <option
                          key={matId}
                          value={matId}
                          disabled={isSelectedElsewhere}
                        >
                          {mat.name} ({mat.reference})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex flex-col w-32">
                  <label className="mb-1 text-xs font-medium text-gray-700">
                    QUANTITY
                  </label>
                  <input
                    type="number"
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.quantity}
                    onChange={(e) =>
                      handleCompositionChange(index, "quantity", e.target.value)
                    }
                    min="1"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveComposition(index)}
                  className="px-3 py-2 font-bold text-white bg-red-600 rounded hover:bg-red-700 h-10 flex items-center justify-center"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          CANCEL
        </Button>
        <Button type="submit" variant="primary">
          SAVE
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
