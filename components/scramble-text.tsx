"use client";

import { useState, useRef } from "react";

const CHARS = "!<>-_\\\\/[]{}—=+*^?#_";

interface Props {
  text: string;
  className?: string;
  scrambleSpeed?: number;
}

export function ScrambleText({ text, className = "", scrambleSpeed = 40 }: Props) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    
    clearInterval(intervalRef.current as NodeJS.Timeout);
    
    intervalRef.current = setInterval(() => {
      setDisplayText((prev) => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });
      
      if (iteration >= text.length) {
        clearInterval(intervalRef.current as NodeJS.Timeout);
        setIsScrambling(false);
        setDisplayText(text); // Force exact match at end
      }
      
      iteration += 1 / 3; // 1 char every 3 ticks
    }, scrambleSpeed);
  };

  return (
    <span 
      className={`inline-block cursor-crosshair hover:text-primary transition-colors ${className}`}
      onMouseEnter={startScramble}
    >
      {displayText}
    </span>
  );
}
