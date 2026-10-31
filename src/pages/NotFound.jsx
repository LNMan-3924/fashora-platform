import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-white selection:text-black">
      {/* 1. Header tối giản */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-neutral-800 pb-6">
        <Link to="/home" className="text-xl sm:text-2xl font-black tracking-[0.35em] uppercase text-white">
          FASHORA
        </Link>
        <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
          EDITORIAL ARCHIVE • ERROR 404
        </span>
      </header>

      {/* 2. Nội dung trung tâm */}
      <main className="w-full max-w-3xl mx-auto py-16 text-center my-auto flex flex-col items-center">
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-neutral-400 border border-neutral-800 px-3.5 py-1.5 mb-6">
          MISSING SPECIFICATION
        </span>

        <h1 className="text-7xl sm:text-9xl font-extrabold tracking-tighter text-white/90 font-mono mb-4 select-none">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.15em] text-white mb-4">
          {t('notFound.title', 'PAGE NOT FOUND')}
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-10 font-light leading-relaxed tracking-wide">
          {t(
            'notFound.desc',
            'The editorial piece, atelier collection, or page you are looking for has been archived, moved, or does not exist.'
          )}
        </p>

        {/* Các nút điều hướng */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('notFound.goBack', 'GO BACK')}</span>
          </button>

          <Link
            to="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono uppercase tracking-widest transition-colors shadow-lg"
          >
            <span>{t('notFound.backHome', 'RETURN TO HOME')}</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>{t('notFound.explore', 'BROWSE CATALOG')}</span>
          </Link>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
        <span>FASHORA RUNWAY & ATELIERS</span>
        <span>ALL RIGHTS RESERVED © 2026</span>
      </footer>
    </div>
  )
}