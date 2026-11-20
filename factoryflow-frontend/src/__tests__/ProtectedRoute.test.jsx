import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

describe("ProtectedRoute Component", () => {
  test("redirects to /login when user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={["/admin/orders"]}>
        <Routes>
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("redirects to /access-denied when user role is not allowed", () => {
    useAuth.mockReturnValue({
      user: { id: "1", name: "Op", role: "Operator" },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/admin/orders"]}>
        <Routes>
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/access-denied"
            element={<div>Access Denied Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Access Denied Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
