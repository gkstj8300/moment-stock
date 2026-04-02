export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#f0f0f0] bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-bold text-gray-900">
              <span className="text-[#fa2454]">m</span>oment-stock
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              실시간 재고 동기화
              <br />
              타임 세일 플랫폼
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">고객센터</p>
            <p className="mt-2 text-lg font-bold text-gray-900">1234-5678</p>
            <p className="mt-1 text-xs text-gray-500">
              평일 10:00 ~ 18:00 (주말·공휴일 휴무)
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">이용안내</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
                이용약관
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[#f0f0f0] pt-6">
          <p className="text-xs text-gray-400">
            © 2026 moment-stock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
