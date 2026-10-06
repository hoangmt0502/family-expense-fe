'use client';

import { Moon, Sun } from 'lucide-react';

function setTheme(t: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', t === 'dark');
  try {
    localStorage.setItem('theme', t);
  } catch {}
}

// Không dùng state: class "dark" trên <html> là nguồn sự thật duy nhất,
// giao diện nút được CSS (dark:) tự đổi → không bị lệch hydration.
export default function ThemeToggle() {
  return (
    <div className="flex w-fit items-center rounded-full bg-white p-1 shadow-inner dark:bg-slate-800">
      <button
        type="button"
        aria-label="Giao diện sáng"
        onClick={() => setTheme('light')}
        className="cursor-pointer grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow dark:bg-none dark:text-slate-400"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Giao diện tối"
        onClick={() => setTheme('dark')}
        className="cursor-pointer grid h-9 w-9 place-items-center rounded-full text-slate-400 dark:bg-gradient-to-br dark:from-violet-500 dark:to-indigo-500 dark:text-white dark:shadow"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
