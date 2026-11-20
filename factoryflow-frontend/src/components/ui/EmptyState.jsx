import React from "react";

const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
