import React, { useState, useRef, useEffect } from "react";
import { ReactComponent as ArrowDownIcon } from '@/components/icon/supervisory/arrow_down.svg'

export type Option<T> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type Props<T extends string | number> = {
  value: T;
  options: Option<T>[];
  onChange: (val: T) => void;

  leftIcon?: React.ReactNode;
  className?: string;
};

export function SelectData<T extends string | number>({
  value,
  options,
  onChange,
  leftIcon,
  className = "",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        className="
          w-[150px]
          h-10 px-3 rounded-lg
          bg-[#0D0D10]
          border border-[#2A2A2F]
          text-white/90 text-sm
          flex items-center justify-between
          hover:bg-[#1A1A1D]
        "
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          {leftIcon && <span className="w-4 h-4">{leftIcon}</span>}
          <span>{selected?.label ?? "请选择"}</span>
        </div>

        <ArrowDownIcon
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
            absolute left-0 mt-2 w-full
            rounded-xl
            bg-[#0D0D10]
            border border-[#2A2A2F]
            py-2
            shadow-xl z-99
          "
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={String(opt.value)}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
                className={`
                  px-4 py-2 text-sm cursor-pointer select-none
                  ${
                    opt.disabled
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-white/90 hover:bg-[#2B2B32]"
                  }
                  ${isSelected ? "bg-[#2B2B32]" : ""}
                `}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
