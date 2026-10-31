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

/**
 * Chuẩn hóa chuỗi tìm kiếm hỗ trợ song ngữ (xóa dấu tiếng Việt, chữ thường, bỏ khoảng trắng dư thừa)
 * 
 * @param {string} text - Chuỗi cần chuẩn hóa
 * @returns {string} Chuỗi không dấu, chữ thường
 */
export function normalizeSearchText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Kiểm tra xem sản phẩm có khớp với từ khóa tìm kiếm song ngữ không.
 * Hỗ trợ tìm kiếm theo:
 * - Tên tiếng Anh & Tên tiếng Việt (bỏ dấu)
 * - Tên xưởng may / shop
 * - Danh mục tiếng Anh & Danh mục tiếng Việt
 * - Các từ đồng nghĩa thông dụng: boot/bốt, túi/bag, kính/sunglasses, đồ da/leather, jean/denim
 * 
 * @param {Object} product - Sản phẩm cần kiểm tra
 * @param {string} query - Từ khóa tìm kiếm người dùng nhập
 * @returns {boolean}
 */
export function matchesProductSearch(product, query) {
  if (!product || !query) return false;
  const q = normalizeSearchText(query);
  if (!q) return false;

  const nameEn = normalizeSearchText(product.name);
  const nameVi = normalizeSearchText(getLocalizedProductName(product, 'vi'));
  const shopName = normalizeSearchText(product.shopName);
  const categoryEn = normalizeSearchText(product.category);

  const viCatMap = {
    set: 'set do',
    shirt: 'ao',
    pants: 'quan',
    shoes: 'giay',
    accessories: 'phu kien',
  };
  const categoryVi = viCatMap[categoryEn] || '';

  // 1. Khớp trực tiếp tên tiếng Anh hoặc tiếng Việt
  if (nameEn.includes(q) || nameVi.includes(q)) return true;

  // 2. Khớp tên shop
  if (shopName.includes(q)) return true;

  // 3. Khớp danh mục tiếng Anh hoặc tiếng Việt
  if (categoryEn.includes(q) || categoryVi.includes(q)) return true;

  // 4. Khớp từ đồng nghĩa thông dụng (Synonyms)
  if ((q.includes('boot') || q.includes('bot')) && (nameEn.includes('boot') || nameVi.includes('bot'))) return true;
  if ((q.includes('kinh') || q.includes('sunglass') || q.includes('glasses')) && (nameEn.includes('sunglass') || nameVi.includes('kinh'))) return true;
  if ((q.includes('da') || q.includes('leather')) && (nameEn.includes('leather') || nameVi.includes('da'))) return true;
  if ((q.includes('tui') || q.includes('bag') || q.includes('balo') || q.includes('backpack')) && (nameEn.includes('bag') || nameEn.includes('backpack') || nameVi.includes('tui') || nameVi.includes('balo'))) return true;
  if ((q.includes('jean') || q.includes('denim')) && (nameEn.includes('jean') || nameEn.includes('denim') || nameVi.includes('jean') || nameVi.includes('denim'))) return true;

  return false;
}


