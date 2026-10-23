/**
 * =============================================================================
 * TIỆN ÍCH DÙNG CHUNG: uploadImage (Client-side Image Upload Helper)
 * =============================================================================
 *
 * MỤC ĐÍCH & CÁCH HOẠT ĐỘNG:
 * 1. Trình duyệt (Browser) chạy trong môi trường sandbox biệt lập nên KHÔNG THỂ
 *    trực tiếp `import fs from 'fs'` để ghi file xuống ổ cứng của máy tính.
 * 2. Do đó, hàm này đóng vai trò cầu nối (Bridge):
 *    - Bước 1: Tiếp nhận tệp `File` hoặc `Blob` được chọn từ `<input type="file" />`.
 *    - Bước 2: Kiểm tra dung lượng (tối đa 10MB) và định dạng hợp lệ (ảnh).
 *    - Bước 3: Đọc tệp thành chuỗi nhị phân mã hóa Base64 bằng API `FileReader`.
 *    - Bước 4: Gửi HTTP POST request chứa chuỗi Base64 cùng thông tin danh mục
 *      (`category`) hoặc thư mục đích (`folder`) tới endpoint '/api/upload-image'.
 *    - Bước 5: Endpoint này được xử lý bởi `vite-plugin-image-upload.js` chạy trên
 *      nền tảng Node.js, nơi có toàn quyền gọi `fs.mkdirSync` và `fs.writeFileSync`
 *      để lưu ảnh thực tế vào thư mục `public/`.
 *    - Bước 6: Nhận lại đường dẫn web tĩnh (ví dụ: `/images/products/shirt/shirt-123456.jpg`
 *      hoặc `/images/avatars/avatar-123456.png`) để lưu vào Database JSON-Server
 *      và render trực tiếp lên giao diện người dùng.
 *
 * TÁI SỬ DỤNG:
 * - Dùng được cho cả Module Quản lý Sản phẩm (Seller Products) -> Lưu vào thư mục con theo Category.
 * - Dùng được cho Module Hồ sơ Cá nhân (Profile Avatar) -> Lưu vào thư mục `public/images/avatars`.
 */

/**
 * Đọc File hoặc Blob thành chuỗi Data URL Base64
 * @param {File|Blob} file 
 * @returns {Promise<string>}
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result)
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu tệp hình ảnh'))
    reader.readAsDataURL(file)
  })
}

/**
 * Tải ảnh lên máy chủ cục bộ và lưu vào thư mục public/ tương ứng
 * 
 * @param {File|Blob} file - Đối tượng tệp hình ảnh nhận được từ input file
 * @param {Object} options - Tùy chọn phân loại thư mục lưu trữ
 * @param {string} [options.category] - Danh mục sản phẩm (SHIRT, PANTS, SET, SHOES, ACCESSORIES, DRESS, JACKET...)
 * @param {string} [options.folder] - Thư mục chỉ định đặc biệt (ví dụ: 'avatars' cho ảnh đại diện người dùng)
 * @returns {Promise<{ success: boolean, url: string, fileName: string }>}
 */
export async function uploadImage(file, { category = '', folder = '' } = {}) {
  // 1. Kiểm tra tính hợp lệ của đối tượng file đầu vào
  if (!file) {
    throw new Error('Vui lòng chọn tệp hình ảnh để tải lên.')
  }

  // 2. Kiểm tra MIME type: Chỉ chấp nhận các định dạng tệp hình ảnh
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Định dạng tệp không hợp lệ. Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, GIF, SVG).')
  }

  // 3. Giới hạn dung lượng tối đa (10MB) để tránh làm nghẽn bộ nhớ đệm
  const MAX_SIZE_MB = 10
  if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Kích thước ảnh vượt quá dung lượng cho phép (${MAX_SIZE_MB}MB). Vui lòng chọn ảnh nhẹ hơn.`)
  }

  try {
    // 4. Chuyển đổi tệp thành chuỗi Base64
    const fileData = await readFileAsBase64(file)

    // 5. Gửi dữ liệu tới Vite Middleware endpoint (/api/upload-image)
    // Server Node.js của Vite sẽ bắt request này và dùng 'fs.writeFileSync' để lưu file vật lý
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData,
        fileName: file.name || 'uploaded-image',
        category,
        folder,
      }),
    })

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}))
      throw new Error(errorJson.error || `Tải ảnh thất bại với mã lỗi HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Máy chủ Node.js không thể lưu trữ hình ảnh.')
    }

    // Trả về kết quả gồm đường dẫn web tĩnh (url) và tên file
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      category: data.category,
      folder: data.folder,
    }
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên máy chủ Node.js:', error)
    throw error
  }
}

export default uploadImage

