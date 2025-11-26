"use client";

import React, { ReactNode, ElementType } from "react";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";

type AlertIcon = ReactNode | ElementType;

type MaybeReactComponent = {
      render?: () => ReactNode;
      $$typeof?: symbol;
    };

interface AlertProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  icon?: AlertIcon;
  onClose?: () => void;
  className?: string;
}

const Alert = ({
  message,
  type = "info",
  icon,
  onClose,
  className = "",
}: AlertProps) => {
  const Icon = icon as ElementType | undefined;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon as React.ReactElement;

    if (typeof icon === "function") {
      const C = Icon as ElementType;
      return <C size={20} />;
    }

    const maybeObj = icon as MaybeReactComponent;
    if (maybeObj && (maybeObj.render || maybeObj.$$typeof)) {
      try {
        return React.createElement(maybeObj as ElementType, { size: 20 });
      } catch (e) {
        return null;
      }
    }

    return icon as ReactNode;
  };

  const bgClass =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-indigo-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
      className={`pointer-events-auto w-full ${bgClass} text-white p-3 rounded-lg shadow flex items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      {renderIcon()}
      <div className="flex-1 text-sm">{message}</div>
      <button
        aria-label="Close alert"
        onClick={() => onClose?.()}
        className="ml-2 text-white/90 hover:text-white"
      >
        <IconX size={18} />
      </button>
    </motion.div>
  );
};

export default Alert;