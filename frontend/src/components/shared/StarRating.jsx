import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
export default function StarRating({ value, onChange, disabled = false, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };
  const active = hovered || value;

  const getColor = (star) => {
    if (star <= active) {
      if (active <= 2) return "text-rose-400";
      if (active <= 3) return "text-brand";
      if (active <= 4) return "text-gold";
      return "text-jade";
    }
    return "text-ink-200";
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`
            ${sizes[size]} transition-all duration-100
            ${getColor(star)}
            ${!disabled ? "hover:scale-125 cursor-pointer" : "cursor-not-allowed opacity-60"}
          `}
          title={`${star} star${star > 1 ? "s" : ""}`}
        >
          {star <= active ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs font-semibold text-ink-400">
          {["", "Poor", "Fair", "Good", "Great", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}
