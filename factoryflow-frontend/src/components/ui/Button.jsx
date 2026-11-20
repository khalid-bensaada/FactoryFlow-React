import React from "react";

const Button = ({
  variant = "primary",
  disabled,
  onClick,
  children,
  ...props
}) => {
  const baseStyle =
    "px-4 py-2 font-medium rounded transition-colors duration-200 focus:outline-none";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
