import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const AddStockForm = ({ onSubmit, onCancel }) => {
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (qty <= 0) {
      setError("QUANTITY MUST BE STRICTLY GREATER THAN 0");
      return;
    }
    setError("");
    onSubmit(qty);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Input
        type="number"
        label="QUANTITY TO ADD"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        min="1"
        required
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          CANCEL
        </Button>
        <Button type="submit" variant="primary">
          ADD
        </Button>
      </div>
    </form>
  );
};

export default AddStockForm;
