'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  /** Nhãn ngắn hiển thị trên nút (vd "T10") khi nhãn đầy đủ là "Tháng 10" */
  shortLabel?: string;
  hint?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  /** Tiêu đề bottom-sheet trên mobile */
  title?: string;
  leftIcon?: ReactNode;
  variant?: 'filter' | 'field';
  className?: string;
  disabled?: boolean;
}

type Pos = { left: number; width: number; maxHeight: number; top?: number; bottom?: number };

const VARIANT = {
  filter:
    'gap-1.5 rounded-xl border-slate-200/80 bg-slate-50 px-2.5 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800/80',
  field:
    'gap-2 rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold dark:border-slate-800 dark:bg-slate-800/50',
};

/**
 * Dropdown tự vẽ thay cho <select> native:
 * - Desktop/tablet: popover gắn vào <body> (portal, position: fixed) → không bị modal/overflow cắt,
 *   tự lật lên trên nếu thiếu chỗ phía dưới.
 * - Mobile (<640px): bottom-sheet, mục lớn dễ chạm.
 */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  title,
  leftIcon,
  variant = 'filter',
  className = '',
  disabled,
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  const selected = options.find((o) => o.value === value);

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(Math.max(r.width, 180), vw - 16);
    const left = Math.min(Math.max(8, r.left), vw - width - 8);
    const below = vh - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 220 && above > below;
    setPos({
      left,
      width,
      maxHeight: Math.max(120, Math.min(300, up ? above : below)),
      ...(up ? { bottom: vh - r.top + 6 } : { top: r.bottom + 6 }),
    });
  }, []);

  const openMenu = () => {
    setSheet(window.matchMedia('(max-width: 639px)').matches);
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onMove = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return; // cuộn bên trong menu thì bỏ qua
      place();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    selectedRef.current?.scrollIntoView({ block: 'nearest' });
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, place]);

  const list = options.map((o) => {
    const active = o.value === value;
    return (
      <button
        key={o.value}
        ref={active ? selectedRef : undefined}
        type="button"
        role="option"
        aria-selected={active}
        onClick={() => {
          onChange(o.value);
          setOpen(false);
        }}
        className={`flex w-full items-center gap-2 rounded-xl px-3 text-left font-bold transition-colors ${
          sheet ? 'py-3 text-sm' : 'py-2 text-xs'
        } ${
          active
            ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{o.label}</span>
        {o.hint && (
          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {o.hint}
          </span>
        )}
        {active && <Check className="h-4 w-4 shrink-0" />}
      </button>
    );
  });

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={openMenu}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full min-w-0 items-center border text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-800 ${
          VARIANT[variant]
        } ${open ? '!border-purple-400 ring-2 ring-purple-500/20' : ''} ${className}`}
      >
        {leftIcon && <span className="shrink-0 text-purple-600 dark:text-purple-400">{leftIcon}</span>}
        <span className={`min-w-0 flex-1 truncate text-left ${selected ? '' : 'text-slate-400'}`}>
          {selected ? (selected.shortLabel ?? selected.label) : placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[150]" onClick={() => setOpen(false)}>
            {sheet ? (
              <>
                <div className="animate-fadeIn absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />
                <div
                  ref={menuRef}
                  role="listbox"
                  onClick={(e) => e.stopPropagation()}
                  className="animate-in slide-in-from-bottom absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 dark:bg-slate-900"
                >
                  <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  {title && (
                    <p className="mb-2 px-1 text-sm font-extrabold text-slate-900 dark:text-white">{title}</p>
                  )}
                  <div className="space-y-1">{list}</div>
                </div>
              </>
            ) : (
              pos && (
                <div
                  ref={menuRef}
                  role="listbox"
                  onClick={(e) => e.stopPropagation()}
                  style={{ left: pos.left, width: pos.width, maxHeight: pos.maxHeight, top: pos.top, bottom: pos.bottom }}
                  className="animate-in fade-in zoom-in-95 absolute space-y-0.5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl duration-150 dark:border-slate-700 dark:bg-slate-900"
                >
                  {list}
                </div>
              )
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
