import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Materials from "../pages/admin/Materials";
import { getAll as getMaterials } from "../services/materialService";

jest.mock("../services/materialService");

describe("Materials Component", () => {
  test("displays EmptyState when materials list is empty", async () => {
    getMaterials.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <Materials />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/no materials|aucune matière|empty/i),
      ).toBeInTheDocument();
    });
  });
});
