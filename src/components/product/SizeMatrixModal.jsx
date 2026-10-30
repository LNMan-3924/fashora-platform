import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function SizeMatrixModal({ isOpen, onClose, categoryType = 'shirt' }) {
  const { t } = useTranslation()
  const [sizeGenderTab, setSizeGenderTab] = useState('MEN')

  if (!isOpen) return null

  // Cấu hình dữ liệu chi tiết cho từng Category, phân tách rõ MEN và WOMEN
  const sizeConfigs = {
    // 1. SET ĐỒ (ÁO + QUẦN / CHÂN VÁY)
    set: {
      title: t('sizeMatrix.set.title', 'COORDINATED SET SIZE MATRIX'),
      subtitle: t('sizeMatrix.set.subtitle', 'Dimensions measured in centimeters (CM)'),
      columns: [
        t('sizeMatrix.columns.size', 'SIZE'),
        t('sizeMatrix.columns.chest', 'CHEST'),
        t('sizeMatrix.columns.waist', 'WAIST'),
        t('sizeMatrix.columns.hips', 'HIPS'),
        t('sizeMatrix.columns.height', 'HEIGHT'),
      ],
      data: {
        MEN: [
          ['S', '96 - 100', '74 - 78', '94 - 96', '165 - 172 cm'],
          ['M', '100 - 104', '78 - 82', '98 - 100', '170 - 177 cm'],
          ['L', '104 - 108', '82 - 86', '102 - 104', '175 - 182 cm'],
          ['FREESIZE', '100 - 110', '76 - 86', '96 - 106', '168 - 180 cm'],
        ],
        WOMEN: [
          ['XS', '80 - 84', '62 - 66', '86 - 88', '152 - 158 cm'],
          ['S', '84 - 88', '66 - 70', '90 - 92', '156 - 164 cm'],
          ['M', '88 - 92', '70 - 74', '94 - 96', '162 - 168 cm'],
          ['FREESIZE', '84 - 94', '64 - 76', '88 - 98', '155 - 168 cm'],
        ],
      },
      note: {
        MEN: t('sizeMatrix.notes.setMen', 'Male Model is 185cm wearing size L.'),
        WOMEN: t('sizeMatrix.notes.setWomen', 'Female Model is 174cm wearing size S.'),
      },
    },

    // 2. ÁO (SHIRT / JACKET / TOP)
    shirt: {
      title: t('sizeMatrix.shirt.title', 'SHIRT & JACKET SIZE MATRIX'),
      subtitle: t('sizeMatrix.shirt.subtitle', 'Dimensions measured in centimeters (CM)'),
      columns: [
        t('sizeMatrix.columns.size', 'SIZE'),
        t('sizeMatrix.columns.chest', 'CHEST'),
        t('sizeMatrix.columns.shoulder', 'SHOULDER'),
        t('sizeMatrix.columns.length', 'LENGTH'),
      ],
      data: {
        MEN: [
          ['S', '98 - 102', '45 - 46', '68'],
          ['M', '102 - 106', '47 - 48', '70'],
          ['L', '106 - 110', '49 - 50', '72'],
          ['XL', '110 - 116', '51 - 52', '74'],
          ['FREESIZE', '106 - 114', 'Adjustable', '70 - 72'],
        ],
        WOMEN: [
          ['XS', '80 - 84', '38', '54'],
          ['S', '84 - 88', '40', '56'],
          ['M', '88 - 92', '42', '58'],
          ['L', '92 - 96', '44', '60'],
          ['FREESIZE', '86 - 94', 'Adjustable', '56 - 58'],
        ],
      },
      note: {
        MEN: t('sizeMatrix.notes.setMen', 'Male Model is 185cm wearing size L.'),
        WOMEN: t('sizeMatrix.notes.setWomen', 'Female Model is 174cm wearing size S.'),
      },
    },

    // 3. QUẦN & CHÂN VÁY (PANTS / TROUSERS)
    pants: {
      title: t('sizeMatrix.pants.title', 'TROUSERS & BOTTOMS MATRIX'),
      subtitle: t('sizeMatrix.pants.subtitle', 'Dimensions measured in centimeters (CM)'),
      columns: [
        t('sizeMatrix.columns.size', 'SIZE'),
        t('sizeMatrix.columns.waist', 'WAIST'),
        t('sizeMatrix.columns.hips', 'HIPS'),
        t('sizeMatrix.columns.length', 'LENGTH'),
      ],
      data: {
        MEN: [
          ['29 / S', '74 - 76', '94', '102'],
          ['30 / M', '78 - 80', '98', '104'],
          ['32 / L', '82 - 84', '102', '106'],
          ['34 / XL', '86 - 88', '106', '108'],
          ['FREESIZE', '74 - 86', '106', '104'],
        ],
        WOMEN: [
          ['XS', '60 - 64', '86 - 88', '98'],
          ['S', '65 - 68', '90 - 92', '100'],
          ['M', '69 - 72', '94 - 96', '102'],
          ['L', '73 - 76', '98 - 100', '104'],
          ['FREESIZE', '62 - 74', '96', '100'],
        ],
      },
      note: {
        MEN: t('sizeMatrix.notes.pantsMen', 'Male Model is 185cm wearing size 32.'),
        WOMEN: t('sizeMatrix.notes.pantsWomen', 'Female Model is 174cm wearing size 27 / S.'),
      },
    },

    // 4. GIÀY & BOOTS (SHOES / FOOTWEAR)
    shoes: {
      title: t('sizeMatrix.shoes.title', 'FOOTWEAR SIZE MATRIX'),
      subtitle: t('sizeMatrix.shoes.subtitle', 'Standard sizing & Foot length (CM)'),
      columns: ['EU', 'US', 'UK', t('sizeMatrix.columns.footLength', 'FOOT LENGTH')],
      data: {
        MEN: [
          ['40', '7.0', '6.5', '25.0 cm'],
          ['41', '8.0', '7.5', '26.0 cm'],
          ['42', '8.5', '8.0', '26.5 cm'],
          ['43', '9.5', '9.0', '27.5 cm'],
          ['44', '10.0', '9.5', '28.0 cm'],
        ],
        WOMEN: [
          ['36', '5.5', '3.5', '22.5 cm'],
          ['37', '6.5', '4.5', '23.5 cm'],
          ['38', '7.5', '5.5', '24.0 cm'],
          ['39', '8.5', '6.5', '25.0 cm'],
          ['40', '9.0', '7.0', '25.5 cm'],
        ],
      },
      note: {
        MEN: t('sizeMatrix.notes.shoes', 'True to atelier size. Recommend +0.5 size for wide feet.'),
        WOMEN: t('sizeMatrix.notes.shoes', 'True to atelier size. Recommend +0.5 size for wide feet.'),
      },
    },
  }

  const currentConfig = sizeConfigs[categoryType] || sizeConfigs.shirt
  const currentRows = currentConfig.data[sizeGenderTab] || []
  const currentNote = currentConfig.note[sizeGenderTab]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-neutral-200 w-full max-w-lg p-6 relative shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-[#111111]">
              {currentConfig.title}
            </h3>
            <p className="text-[10px] font-mono text-neutral-400 uppercase mt-0.5">
              {currentConfig.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black font-mono text-base p-1 leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs chọn NAM / NỮ */}
        <div className="flex border-b border-neutral-200 mt-4">
          <button
            type="button"
            onClick={() => setSizeGenderTab('MEN')}
            className={`flex-1 py-2 font-mono text-xs tracking-widest uppercase transition-colors ${
              sizeGenderTab === 'MEN'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('sizeMatrix.men', 'MEN')}
          </button>
          <button
            type="button"
            onClick={() => setSizeGenderTab('WOMEN')}
            className={`flex-1 py-2 font-mono text-xs tracking-widest uppercase transition-colors ${
              sizeGenderTab === 'WOMEN'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('sizeMatrix.women', 'WOMEN')}
          </button>
        </div>

        {/* Nội dung bảng Size Matrix */}
        <div className="mt-4 overflow-x-auto max-h-[55vh]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 text-[10px] tracking-wider uppercase">
                {currentConfig.columns.map((col, idx) => (
                  <th key={idx} className="py-2.5 px-3 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {currentRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={row[0].includes('FREE') ? 'bg-neutral-50/70 font-semibold' : ''}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-2.5 px-3 ${cIdx === 0 ? 'font-bold text-black' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Modal */}
        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-sans text-neutral-500">
          <span>{currentNote}</span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs underline text-black uppercase hover:opacity-70"
          >
            {t('sizeMatrix.close', 'CLOSE')}
          </button>
        </div>
      </div>
    </div>
  )
}