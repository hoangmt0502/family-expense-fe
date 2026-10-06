import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:p-12 overflow-x-hidden font-sans select-none bg-slate-950">
      
      {/* 1. BACKGROUND DYNAMIC DÙNG CHUNG */}
      <div className="absolute inset-0 z-0">
        {/* Mobile / Tablet Background (< 1024px) */}
        <div className="block lg:hidden absolute inset-0">
          <Image
            src="/images/bg_login_responsive.png"
            alt="Background Auth Responsive"
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Desktop Background (>= 1024px) */}
        <div className="hidden lg:block absolute inset-0">
          <Image
            src="/images/bg_login.png"
            alt="Background Auth Desktop"
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="object-cover object-left"
          />
          {/* Mask Backdrop Blur lề phải */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-slate-950/30"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, transparent 45%, black 70%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, transparent 45%, black 70%)',
            }}
          />
        </div>
      </div>

      {/* 2. MAIN CONTAINER GRID DÙNG CHUNG */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto">
        {/* Cột trái: Khoảng trống khoe ảnh nền trên Desktop */}
        <div className="lg:col-span-6 hidden lg:block pointer-events-none" />

        {/* Cột phải: Khung Glassmorphism chứa nội dung Form */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md bg-slate-900/40 lg:bg-slate-900/60 backdrop-blur-xl lg:backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 text-white transition-all">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
