import React, { useState, useRef, useEffect, useCallback } from "react";
import "./CopyableAddress.css";

const CopyableAddress = ({
  address,
  truncate = true,
  className = "",
  label,
  minChars = 10,
}) => {
  const [pressing, setPressing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayAddress, setDisplayAddress] = useState(address);
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const timeoutRefs = useRef({ pressing: null, copied: null });

  const calculateTruncation = useCallback(() => {
    if (!truncate || !address || !containerRef.current || !measureRef.current) {
      setDisplayAddress(address);
      return;
    }

    const container = containerRef.current;
    const parent = container.parentElement;

    if (!parent) {
      setDisplayAddress(address);
      return;
    }

    const parentStyles = window.getComputedStyle(parent);
    const parentWidth = parent.clientWidth;
    const parentPaddingLeft = parseFloat(parentStyles.paddingLeft) || 0;
    const parentPaddingRight = parseFloat(parentStyles.paddingRight) || 0;

    let siblingsWidth = 0;
    Array.from(parent.children).forEach((child) => {
      if (
        child !== container &&
        !child.classList.contains("copyable-address")
      ) {
        siblingsWidth += child.offsetWidth;
      }
    });

    const availableParentWidth =
      parentWidth - parentPaddingLeft - parentPaddingRight - siblingsWidth - 8;

    const labelEl = container.querySelector(".copyable-address-label");
    const iconEl = container.querySelector(".copyable-address-icon");
    const labelWidth = labelEl ? labelEl.offsetWidth + 4 : 0;
    const iconWidth = iconEl ? iconEl.offsetWidth + 6 : 0;

    const containerStyles = window.getComputedStyle(container);
    const containerPadding =
      (parseFloat(containerStyles.paddingLeft) || 0) +
      (parseFloat(containerStyles.paddingRight) || 0);
    const containerBorder =
      (parseFloat(containerStyles.borderLeftWidth) || 0) +
      (parseFloat(containerStyles.borderRightWidth) || 0);
    const containerGap = (parseFloat(containerStyles.gap) || 4) * 2;

    const fixedWidth =
      labelWidth +
      iconWidth +
      containerPadding +
      containerBorder +
      containerGap;
    const availableTextWidth = availableParentWidth - fixedWidth;

    if (availableTextWidth <= 0) {
      const half = Math.floor(minChars / 2);
      setDisplayAddress(address.slice(0, half) + "..." + address.slice(-half));
      return;
    }

    measureRef.current.textContent = "0x00000000";
    const sampleWidth = measureRef.current.offsetWidth;
    const charWidth = sampleWidth / 10;
    const ellipsisWidth = charWidth * 3;

    const maxChars = Math.floor(
      (availableTextWidth - ellipsisWidth) / charWidth
    );

    if (maxChars >= address.length) {
      setDisplayAddress(address);
    } else if (maxChars < minChars) {
      const half = Math.floor(minChars / 2);
      setDisplayAddress(address.slice(0, half) + "..." + address.slice(-half));
    } else {
      const startChars = Math.ceil(maxChars * 0.6);
      const endChars = maxChars - startChars;
      setDisplayAddress(
        address.slice(0, Math.max(startChars, 4)) +
          "..." +
          address.slice(-Math.max(endChars, 2))
      );
    }
  }, [address, truncate, minChars]);

  // Setup resize observer and initial calculation
  useEffect(() => {
    if (!containerRef.current) return;

    const timeoutId = setTimeout(calculateTruncation, 0);

    const resizeObserver = new ResizeObserver(calculateTruncation);

    if (containerRef.current.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    if (containerRef.current.parentElement?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement.parentElement);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [calculateTruncation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const refs = timeoutRefs.current;
    return () => {
      if (refs.pressing) clearTimeout(refs.pressing);
      if (refs.copied) clearTimeout(refs.copied);
    };
  }, []);

  const handleCopy = useCallback(
    async (e) => {
      e.stopPropagation();
      try {
        setPressing(true);
        await navigator.clipboard.writeText(address);
        setCopied(true);

        // Clear existing timeouts
        if (timeoutRefs.current.pressing) {
          clearTimeout(timeoutRefs.current.pressing);
        }
        if (timeoutRefs.current.copied) {
          clearTimeout(timeoutRefs.current.copied);
        }

        timeoutRefs.current.pressing = setTimeout(() => {
          setPressing(false);
        }, 150);
        timeoutRefs.current.copied = setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setPressing(false);
      }
    },
    [address]
  );

  if (!address) return null;

  return (
    <div
      ref={containerRef}
      className={`copyable-address ${
        pressing ? "button-pressing" : ""
      } ${className} ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      title={`Click to copy: ${address}`}
    >
      {label && <span className="copyable-address-label">{label}</span>}
      <span className="copyable-address-text">{displayAddress}</span>
      <span className="copyable-address-icon">{copied ? "✓" : "📋"}</span>
      {copied && <span className="copyable-address-tooltip">Copied!</span>}
      <span
        ref={measureRef}
        className="copyable-address-measure"
        aria-hidden="true"
      />
    </div>
  );
};

export default CopyableAddress;
