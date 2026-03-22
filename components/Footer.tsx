export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-midnight-950 text-slate-400 pt-5 pb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-4 text-center md:flex md:justify-between md:text-left text-sm text-gray-500">
          <p>© {currentYear} SkillBridge. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4 flex justify-center">
            <span className="flex items-center gap-1">
              Made with <span className="text-red-500">♥</span> by FreebirdCoder
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
