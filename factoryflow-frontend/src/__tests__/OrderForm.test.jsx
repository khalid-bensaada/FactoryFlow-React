import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrderForm from "../pages/admin/OrderForm";
import { getAll as getProducts } from "../services/productService";
import { getOperators } from "../services/userService";
import { create as createOrder } from "../services/orderService";

jest.mock("../services/productService");
jest.mock("../services/userService");
jest.mock("../services/orderService");

const mockProducts = [
  {
    _id: "prodA",
    reference: "REF-A",
    name: "Product A",
    composition: [
      {
        material: { _id: "matX", name: "Material X", reference: "X" },
        quantityPerUnit: 2,
      },
    ],
  },
  {
    _id: "prodB",
    reference: "REF-B",
    name: "Product B",
    composition: [
      {
        material: { _id: "matX", name: "Material X", reference: "X" },
        quantityPerUnit: 3,
      },
      {
        material: { _id: "matY", name: "Material Y", reference: "Y" },
        quantityPerUnit: 1,
      },
    ],
  },
];

const mockOperators = [
  { _id: "op1", name: "John Doe", email: "john@factory.com" },
];

describe("OrderForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getProducts.mockResolvedValue(mockProducts);
    getOperators.mockResolvedValue(mockOperators);
  });

  test("calculates aggregated needs (35 and 5) and prevents duplicate products", async () => {
    render(
      <MemoryRouter>
        <OrderForm />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("New Manufacturing Order")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", {
      name: /Ajouter un produit/i,
    });
    fireEvent.click(addButton);

    const selects = screen.getAllByRole("combobox");
    const productSelect1 = selects[1];
    const productSelect2 = selects[2];
    const quantityInputs = screen.getAllByRole("spinbutton");

    fireEvent.change(productSelect1, { target: { value: "prodA" } });
    fireEvent.change(quantityInputs[0], { target: { value: "10" } });

    const duplicateOptionInSecondSelect = Array.from(
      productSelect2.options,
    ).find((opt) => opt.value === "prodA");
    expect(duplicateOptionInSecondSelect).toBeDisabled();

    fireEvent.change(productSelect2, { target: { value: "prodB" } });
    fireEvent.change(quantityInputs[1], { target: { value: "5" } });

    expect(await screen.findByText("35")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });
});
