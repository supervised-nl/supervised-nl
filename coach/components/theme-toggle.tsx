"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsDark(theme !== "light");

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (!localStorage.getItem("theme")) {
        const dark = mq.matches;
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        setIsDark(dark);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isDark === null) return null;

  function toggle() {
    const next = isDark ? "light" : "dark";
    const html = document.documentElement;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.add("theme-transitioning");
      setTimeout(() => html.classList.remove("theme-transitioning"), 400);
    }

    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Schakel naar licht" : "Schakel naar donker"}
      className="flex items-center cursor-pointer bg-transparent border-none p-0 translate-y-[0.05rem] ml-[clamp(0.618rem,1.618vw,1.618rem)] shrink-0"
    >
      <span
        className="relative block rounded-full border transition-colors duration-200"
        style={{
          width: "1.382rem",
          height: "0.764rem",
          borderColor: isDark
            ? "var(--supervised-ink-2)"
            : "var(--supervised-ink-4)",
        }}
      >
        <span
          className="absolute block rounded-full transition-[transform,background-color] duration-[220ms]"
          style={{
            width: "0.382rem",
            height: "0.382rem",
            top: "50%",
            left: "0.1rem",
            background: isDark
              ? "var(--supervised-ink-2)"
              : "var(--supervised-ink-4)",
            transform: isDark
              ? "translateY(-50%) translateX(calc(0.8rem - 2px))"
              : "translateY(-50%)",
          }}
        />
      </span>
    </button>
  );
}
