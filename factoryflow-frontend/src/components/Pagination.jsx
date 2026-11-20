import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-6 text-sm">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
      >
        Previous
      </button>

      <span className="px-4 py-1 font-medium">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
