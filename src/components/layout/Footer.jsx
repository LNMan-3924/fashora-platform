import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">
        {/* 4 CỘT THÔNG TIN CHÍNH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 text-xs">
          
          {/* CỘT 1: CAN WE HELP YOU? */}
          <div className="space-y-4">
            <h3 className="font-bold tracking-[0.16em] uppercase text-white">
              CAN WE HELP YOU?
            </h3>
            <ul className="space-y-3.5 text-neutral-400">
              <li>
                <a 
                  href="mailto:infoFashora@gmail.com" 
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="font-medium">Email: infoFashora@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-white shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <div>
                    <div className="flex items-center gap-2">
                      <a href="tel:0783734808" className="font-semibold text-white hover:underline">
                        +84 783 734 808
                      </a>
                      <span className="text-[10px] text-amber-500 font-medium">Online</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Opening hours 8:30 AM - 10 PM</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* CỘT 2: POLICY */}
          <div className="space-y-4">
            <h3 className="font-bold tracking-[0.16em] uppercase text-white">
              POLICY
            </h3>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <Link to="/shopping-guide" className="hover:text-white transition-colors">
                  SHOPPING GUIDE
                </Link>
              </li>
              <li>
                <Link to="/exchange-policy" className="hover:text-white transition-colors">
                  EXCHANGE POLICY
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  PRIVACY POLICY
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="hover:text-white transition-colors">
                  TERMS OF USE
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CATEGORY */}
          <div className="space-y-4">
            <h3 className="font-bold tracking-[0.16em] uppercase text-white">
              CATEGORY
            </h3>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <Link to="/shop?category=set" className="hover:text-white transition-colors">
                  SET
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shirt" className="hover:text-white transition-colors">
                  SHIRT
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pants" className="hover:text-white transition-colors">
                  PANTS
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shoes" className="hover:text-white transition-colors">
                  SHOES
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="hover:text-white transition-colors">
                  ACCESSORIES
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: FOLLOW US */}
          <div className="space-y-4">
            <h3 className="font-bold tracking-[0.16em] uppercase text-white">
              FOLLOW US
            </h3>
            <div className="flex items-center gap-4 text-white">
              {/* Facebook */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="TikTok"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.86-4.49v-7.11a8.16 8.16 0 0 0 4.91 1.63v-3.49z" />
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* HÀNG DƯỚI CÙNG: NGÔN NGỮ & BẢN QUYỀN */}
        <div className="border-t border-neutral-900 pt-8 flex items-center justify-center gap-6 text-[11px] text-neutral-400">
          {/* Bản quyền */}
          <p className="tracking-widest">
            COPYRIGHT © 2026 FASHORA PLATFORM. ALL RIGHT RESERVED
          </p>
        </div>

      </div>
    </footer>
  )
}