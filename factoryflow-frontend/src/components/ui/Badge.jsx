import React from "react";

const Badge = ({ status }) => {
  const getStatusColor = (s) => {
    switch (s) {
      case "Planifié":
        return "bg-blue-100 text-blue-800";
      case "En cours":
        return "bg-yellow-100 text-yellow-800";
      case "Terminé":
        return "bg-green-100 text-green-800";
      case "Annulé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
};

export default Badge;
