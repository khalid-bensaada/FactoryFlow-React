import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {

  const [isOpen, setIsOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `block p-3 rounded-lg transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-gray-100">

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">ADMIN PANEL</h2>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={navLinkClass}
            onClick={() => setIsOpen(false)}
          >
            DASHBOARD
          </NavLink>
          <NavLink
            to="/admin/materials"
            className={navLinkClass}
            onClick={() => setIsOpen(false)}
          >
            MATERIALS
          </NavLink>
          <NavLink
            to="/admin/products"
            className={navLinkClass}
            onClick={() => setIsOpen(false)}
          >
            PRODUCTS
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={navLinkClass}
            onClick={() => setIsOpen(false)}
          >
            ORDERS
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full p-2 font-bold text-center text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <header className="flex items-center justify-between p-4 bg-white shadow-sm md:hidden">
          <h1 className="text-xl font-bold text-gray-800">ADMIN</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="text-2xl text-gray-800 focus:outline-none"
          >
            ☰
          </button>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
