import Image from 'next/image';

export default function HeroBanner({ name = 'Gia đình nhỏ' }: { name?: string }) {
  return (
    // Full-bleed: -mx cancel padding của main, -mt kéo lên sau Topbar. Không border/bo góc/shadow.
    <section className="relative -mx-4 -mt-[72px] h-64 lg:-mx-6 lg:h-[300px]">
      {/* Lớp nền: ảnh + phủ trái, cả khối tan dần xuống đáy vào màu nền trang */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_62%,transparent_100%)]">
        {/* DAY */}
        <Image
          src="/images/banner_home_day.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-right dark:hidden"
        />
        {/* NIGHT */}
        <Image
          src="/images/banner_home_night.png"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="hidden object-cover object-right dark:block"
        />
        {/* Mờ dần từ trái để chữ đọc rõ, bên phải giữ ảnh nét */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/95 via-white/50 to-transparent dark:from-slate-950/90 dark:via-slate-950/40" />
      </div>

      {/* pb lớn để chữ nằm trên vùng ảnh, chừa chỗ cho thẻ số liệu đè lên đáy */}
      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-16 sm:px-6 lg:pb-20">
        <p className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">Xin chào</p>
        <h1 className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-3xl font-extrabold leading-tight text-transparent sm:text-4xl lg:text-5xl">
          {name}! <span className="text-3xl">👋</span>
        </h1>
        <p className=" mb-3 sm:mb-0 sm:mt-3 max-w-sm text-sm text-slate-700 dark:text-slate-300">
          Cùng quản lý tài chính, xây dựng những kế hoạch lớn cho tương lai 💜
        </p>
      </div>
    </section>
  );
}
