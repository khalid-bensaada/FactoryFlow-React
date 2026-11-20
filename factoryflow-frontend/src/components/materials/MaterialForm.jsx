import React, { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const MaterialForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    stock: 0,
    threshold: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: "", reference: "", stock: 0, threshold: 0 });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reference.trim()) {
      setError("REFERENCE IS REQUIRED");
      return;
    }
    if (Number(formData.stock) < 0 || Number(formData.threshold) < 0) {
      setError("STOCK AND THRESHOLD MUST BE >= 0");
      return;
    }
    setError("");
    onSubmit({
      ...formData,
      stock: Number(formData.stock),
      threshold: Number(formData.threshold),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Input
        label="NAME"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        label="REFERENCE"
        name="reference"
        value={formData.reference}
        onChange={handleChange}
        required
      />
      <Input
        type="number"
        label="STOCK"
        name="stock"
        value={formData.stock}
        onChange={handleChange}
        min="0"
        required
      />
      <Input
        type="number"
        label="THRESHOLD"
        name="threshold"
        value={formData.threshold}
        onChange={handleChange}
        min="0"
        required
      />
      <div className="flex justify-end gap-2 mt-4">
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

export default MaterialForm;
