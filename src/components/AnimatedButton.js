import React, { useState } from "react";
import "./AnimatedButton.css";

const AnimatedButton = ({ children, className = "", onClick, ...props }) => {
  const [ripples, setRipples] = useState([]);
  const [pressing, setPressing] = useState(false);

  const handleClick = (e) => {
    setPressing(true);
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setRipples((prev) => [...prev, { id: rippleId, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== rippleId));
    }, 600);

    // Reset pressing state
    setTimeout(() => {
      setPressing(false);
      if (onClick) {
        onClick(e);
      }
    }, 150);
  };

  return (
    <button
      className={`animated-button ${
        pressing ? "button-pressing" : ""
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </button>
  );
};

export default AnimatedButton;
