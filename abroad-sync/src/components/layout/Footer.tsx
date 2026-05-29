export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🎓</span>
            <span>AbroadSync — 留学申请综合平台</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} AbroadSync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
