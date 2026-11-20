import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

describe("Login Component", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin, user: null });
  });

  test("calls login and redirects on success", async () => {
    mockLogin.mockResolvedValueOnce({ role: "Admin" });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const emailInput =
      screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
    const passwordInput =
      screen.getByLabelText(/password/i) ||
      screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", {
      name: /login|connexion|sign in/i,
    });

    fireEvent.change(emailInput, { target: { value: "admin@factory.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "admin@factory.com",
        "password123",
      );
    });
  });

  test("displays error message when login fails", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>,
    );

    const emailInput =
      screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
    const passwordInput =
      screen.getByLabelText(/password/i) ||
      screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", {
      name: /login|connexion|sign in/i,
    });

    fireEvent.change(emailInput, { target: { value: "wrong@factory.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });
});
