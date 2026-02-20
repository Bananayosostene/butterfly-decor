"use client";

import { useState, useEffect, useRef } from "react";
import { Mouse, MousePointer } from "lucide-react";

export function ColorPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [useMagicCursor, setUseMagicCursor] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCursor = localStorage.getItem("butterfly-cursor");
    
    if (savedCursor !== null) {
      setUseMagicCursor(JSON.parse(savedCursor));
      applyCursorSetting(JSON.parse(savedCursor));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const applyCursorSetting = (magic: boolean) => {
    document.body.className = document.body.className.replace(/cursor-\w+/g, '');
    if (magic) {
      document.body.classList.add('cursor-auto');
    } else {
      document.body.classList.add('cursor-auto');
    }
  };

  const handleCursorChange = (magic: boolean) => {
    setUseMagicCursor(magic);
    applyCursorSetting(magic);
    localStorage.setItem("butterfly-cursor", JSON.stringify(magic));
    window.dispatchEvent(new CustomEvent('cursorToggle', { detail: magic }));
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-card border border-border hover:bg-accent/10 transition-smooth"
        title="Cursor Settings"
      >
        <Mouse className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-12 bg-popover border border-border rounded-lg shadow-2xl p-4 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200" 
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px oklch(from var(--primary) l c h / 0.1)' }}
        >
          <h3 className="text-sm font-medium mb-3">Cursor Style</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleCursorChange(false)}
              className={`flex-1 p-2 rounded-lg border transition-smooth text-xs ${
                !useMagicCursor
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <MousePointer className="w-4 h-4 mx-auto mb-1" />
              Normal
            </button>
            <button
              onClick={() => handleCursorChange(true)}
              className={`flex-1 p-2 rounded-lg border transition-smooth text-xs ${
                useMagicCursor
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Mouse className="w-4 h-4 mx-auto mb-1" />
              Magic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
