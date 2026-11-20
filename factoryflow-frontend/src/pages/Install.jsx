import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkInstallationStatus,
  setupSystem,
} from "../services/installService";

const Install = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await checkInstallationStatus();

        if (response.isInstalled) {
          navigate("/login", { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError("FAILED TO CHECK STATUS");
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setupSystem(formData);

      navigate("/login", { replace: true });
    } catch (err) {
      setError("INSTALLATION FAILED. PLEASE TRY AGAIN.");
    }
  };

  if (loading)
    return <div className="flex justify-center mt-20 text-xl">LOADING...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center">SYSTEM SETUP</h2>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Admin Name"
            required
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            required
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="p-2 border rounded"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            INSTALL
          </button>
        </form>
      </div>
    </div>
  );
};

export default Install;
