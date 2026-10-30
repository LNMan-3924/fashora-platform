import { PRODUCTS_VI } from '../locales/productsVi.js';

/**
 * Hàm lấy thông tin sản phẩm đã được bản địa hóa theo ngôn ngữ đang chọn.
 * - Nếu ngôn ngữ là 'vi': Trả về dữ liệu Tiếng Việt (tên, mô tả, chất liệu, thông số, xuất xứ, bảo quản, màu sắc, huy hiệu).
 * - Nếu ngôn ngữ khác (mặc định 'en'): Trả về dữ liệu gốc Tiếng Anh.
 * 
 * @param {Object} product - Đối tượng sản phẩm gốc từ API / db.json
 * @param {string} lang - Mã ngôn ngữ hiện tại ('en' | 'vi')
 * @returns {Object} Đối tượng sản phẩm với các trường đã được chuyển ngữ tương ứng
 */
export function getLocalizedProduct(product, lang = 'en') {
  if (!product) return product;

  // Nếu không phải tiếng Việt, giữ nguyên sản phẩm gốc tiếng Anh
  if (!lang || !lang.toLowerCase().startsWith('vi')) {
    return product;
  }

  const viData = PRODUCTS_VI[product.id];
  if (!viData) {
    return product;
  }

  return {
    ...product,
    name: viData.name || product.name,
    badge: viData.badge || getLocalizedBadge(product.badge, lang),
    colors: viData.colors || product.colors,
    sizes: viData.sizes || product.sizes,
    description: viData.description || product.description,
    careInstructions: viData.careInstructions || product.careInstructions,
    details: {
      ...product.details,
      material: viData.details?.material || product.details?.material,
      specifications: viData.details?.specifications || product.details?.specifications,
      origin: viData.details?.origin || product.details?.origin,
    },
  };
}

/**
 * Lấy tên sản phẩm theo ngôn ngữ hiện hành.
 * 
 * @param {Object|string} productOrId - Đối tượng sản phẩm hoặc mã ID (ví dụ: 'prd_acc_01')
 * @param {string} lang - Mã ngôn ngữ hiện hành
 * @param {string} [fallbackName] - Tên dự phòng nếu không tìm thấy
 * @returns {string}
 */
export function getLocalizedProductName(productOrId, lang = 'en', fallbackName = '') {
  const id = typeof productOrId === 'string' ? productOrId : productOrId?.id;
  const originalName = typeof productOrId === 'object' ? productOrId?.name : '';

  if (!lang || !lang.toLowerCase().startsWith('vi')) {
    return fallbackName || originalName || id || '';
  }

  if (id && PRODUCTS_VI[id]?.name) {
    return PRODUCTS_VI[id].name;
  }

  return fallbackName || originalName || id || '';
}

/**
 * Chuyển ngữ huy hiệu trạng thái sản phẩm
 * 
 * @param {string} badge - Huy hiệu gốc ('NEW' | 'SALE' | 'HOT' | 'SOLDOUT')
 * @param {string} lang - Mã ngôn ngữ ('en' | 'vi')
 * @returns {string}
 */
export function getLocalizedBadge(badge, lang = 'en') {
  if (!badge) return badge;
  if (!lang || !lang.toLowerCase().startsWith('vi')) return badge;

  const b = String(badge).trim().toUpperCase();
  if (b === 'NEW') return 'MỚI';
  if (b === 'SALE') return 'GIẢM GIÁ';
  if (b === 'HOT') return 'NỔI BẬT';
  if (b === 'SOLDOUT' || b === 'SOLD OUT') return 'HẾT HÀNG';

  return badge;
}
