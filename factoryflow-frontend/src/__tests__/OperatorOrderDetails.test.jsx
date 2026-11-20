import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import OperatorOrderDetails from "../pages/operator/OperatorOrderDetails";
import { getById, start } from "../services/orderService";

jest.mock("../services/orderService");

const mockPlannedOrder = {
  _id: "order123456",
  status: "PLANNED",
  createdAt: "2026-05-01T10:00:00.000Z",
  items: [
    {
      product: { _id: "prod1", reference: "P-01", name: "Steel Frame" },
      quantity: 10,
    },
  ],
};

describe("OperatorOrderDetails Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getById.mockResolvedValue(mockPlannedOrder);
  });

  test("shows backend stock error message and keeps status badge unchanged when start fails", async () => {
    start.mockRejectedValueOnce({
      response: {
        data: { message: "Insufficient stock: MAT-X (needs 35, available 10)" },
      },
    });

    render(
      <MemoryRouter initialEntries={["/operator/orders/order123456"]}>
        <Routes>
          <Route
            path="/operator/orders/:id"
            element={<OperatorOrderDetails />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("PLANNED")).toBeInTheDocument();

    const startButton = screen.getByRole("button", { name: /Démarrer/i });
    fireEvent.click(startButton);

    const confirmButton = await screen.findByRole("button", {
      name: /Confirm Start/i,
    });
    fireEvent.click(confirmButton);

    expect(
      await screen.findByText(
        "Insufficient stock: MAT-X (needs 35, available 10)",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("PLANNED")).toBeInTheDocument();
    expect(screen.queryByText("IN_PROGRESS")).not.toBeInTheDocument();
  });
});
