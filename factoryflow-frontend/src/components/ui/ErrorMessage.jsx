import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
