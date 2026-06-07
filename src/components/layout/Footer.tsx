"use client";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] py-8 px-5 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0a0a0a] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">R</span>
          </div>
          <span className="text-[13px] text-[#0a0a0a]/35 font-medium tracking-tight">Ruang Kamu</span>
        </div>
        <p className="text-[12px] text-[#0a0a0a]/25 italic">
          &ldquo;Understand your mind, one day at a time.&rdquo;
        </p>
        <p className="text-[12px] text-[#0a0a0a]/25">
          Made with ♥ by Muhammad Dinan Ghifari
        </p>
      </div>
    </footer>
  );
}

export default Footer;
