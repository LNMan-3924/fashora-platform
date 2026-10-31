/**
 * =============================================================================
 * TIỆN ÍCH DÙNG CHUNG: uploadImage (Client-side Image Upload Helper)
 * =============================================================================
 *
 * 1. NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trong kiến trúc Single Page Application (React / Vite), mã nguồn chạy trong trình
 *   duyệt của khách hàng (Client environment) nên KHÔNG THỂ trực tiếp gọi `fs.writeFileSync`.
 * - Tiện ích `uploadImage` đóng vai trò là "Cầu nối" (Client Bridge):
 *   + Bước 1: Nhận file từ sự kiện chọn ảnh `<input type="file" onChange={...} />`.
 *   + Bước 2: Kiểm tra tính hợp lệ ở Client (đúng định dạng ảnh, kích thước <= 10MB)
 *             để tiết kiệm băng thông và phát hiện lỗi ngay lập tức.
 *   + Bước 3: Dùng API `FileReader` của trình duyệt để mã hóa tệp thành chuỗi Base64 Data URL.
 *   + Bước 4: Gửi HTTP POST request chứa chuỗi Base64 cùng thông tin `category` hoặc `folder`
 *             tới endpoint nội bộ `/api/upload-image`.
 *   + Bước 5: Endpoint này được xử lý bởi `vite-plugin-image-upload.js` trên máy chủ Node.js,
 *             ghi dữ liệu xuống ổ đĩa vào thư mục `public/images/...`.
 *   + Bước 6: Nhận lại đường dẫn tĩnh (ví dụ: `/images/products/shirt/shirt-12345.jpg`)
 *             để lưu vào Database `db.json` và render tức thì lên giao diện người dùng.
 *
 * 2. PHẠM VI SỬ DỤNG TRONG TOÀN BỘ DỰ ÁN:
 * - Module Hồ sơ Cá nhân: `ProfilePhoto.jsx` -> Tải ảnh đại diện avatar người dùng (`folder: 'avatars'`).
 * - Module Đăng ký Bán hàng: `BecomeSellerInfo.jsx` -> Tải logo và ảnh bìa shop (`folder: 'shops'`).
 * - Module Quản lý Sản phẩm Seller: `ProductFormModal.jsx` -> Tải ảnh sản phẩm theo danh mục (`category: 'SHIRT'`).
 * - Module Cài đặt Shop: `Settings.jsx` -> Thay đổi ảnh nhận diện thương hiệu (`folder: 'shops'`).
 */

/**
 * Đọc đối tượng File hoặc Blob thành chuỗi Data URL Base64
 * 
 * @param {File|Blob} file - Tệp tin được chọn từ thẻ <input type="file" />
 * @returns {Promise<string>} Promise trả về chuỗi Data URL Base64 (dạng "data:image/jpeg;base64,...")
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    // Khởi tạo đối tượng FileReader tiêu chuẩn của Web API
    const reader = new FileReader()

    // Sự kiện khi đọc tệp thành công: trả về kết quả Base64 chuỗi dài
    reader.onload = (e) => resolve(e.target?.result)

    // Sự kiện khi có lỗi trong quá trình đọc file từ bộ nhớ
    reader.onerror = () => reject(new Error('Unable to read image file data from memory.'))

    // Bắt đầu đọc file dưới dạng Data URL (tự động đính kèm MIME type ở đầu chuỗi)
    reader.readAsDataURL(file)
  })
}

/**
 * Tải ảnh lên máy chủ Node.js cục bộ và lưu vật lý vào thư mục public/ tương ứng
 * 
 * @param {File|Blob} file - Đối tượng tệp hình ảnh nhận được từ input file
 * @param {Object} options - Tùy chọn phân loại vị trí lưu trữ
 * @param {string} [options.category] - Danh mục sản phẩm (SHIRT, PANTS, SET, SHOES, ACCESSORIES, DRESS, JACKET...)
 * @param {string} [options.folder] - Thư mục chỉ định đặc biệt (ví dụ: 'avatars' cho người dùng, 'shops' cho gian hàng)
 * @returns {Promise<{ success: boolean, url: string, fileName: string, category: string, folder: string }>}
 * 
 * @example
 * // 1. Tải ảnh đại diện Avatar người dùng
 * const result = await uploadImage(selectedFile, { folder: 'avatars' })
 * console.log(result.url) // '/images/avatars/avatar-1793105423891-1234.png'
 * 
 * // 2. Tải ảnh sản phẩm Áo sơ mi
 * const result = await uploadImage(selectedFile, { category: 'SHIRT' })
 * console.log(result.url) // '/images/products/shirt/shirt-1793105423891-5678.jpg'
 */
export async function uploadImage(file, { category = '', folder = '' } = {}) {
  // ---------------------------------------------------------------------------
  // BƯỚC 1: Kiểm tra tính tồn tại của tệp tin đầu vào
  // ---------------------------------------------------------------------------
  if (!file) {
    throw new Error('Please select an image file to upload.')
  }

  // ---------------------------------------------------------------------------
  // BƯỚC 2: Kiểm tra định dạng MIME type (Chỉ chấp nhận các tệp ảnh)
  // Ngăn chặn người dùng vô tình hoặc cố ý chọn tệp .pdf, .exe, .docx...
  // ---------------------------------------------------------------------------
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Invalid file format. Please select an image file (JPG, PNG, WEBP, GIF, SVG).')
  }

  // ---------------------------------------------------------------------------
  // BƯỚC 3: Giới hạn dung lượng tối đa (10MB)
  // Tránh việc chuỗi Base64 quá lớn làm tràn bộ nhớ heap của Node.js hoặc chậm mạng
  // ---------------------------------------------------------------------------
  const MAX_SIZE_MB = 10
  if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image size exceeds allowable limit (${MAX_SIZE_MB}MB). Please select a smaller file.`)
  }

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 4: Chuyển đổi tệp thành chuỗi nhị phân Base64 Data URL
    // -------------------------------------------------------------------------
    const fileData = await readFileAsBase64(file)

    // -------------------------------------------------------------------------
    // BƯỚC 5: Gửi HTTP POST request tới Vite Middleware endpoint (/api/upload-image)
    // Server Node.js của Vite sẽ bắt request này và dùng 'fs.writeFileSync' để lưu file vật lý
    // -------------------------------------------------------------------------
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

    // Nếu HTTP status không phải dạng 2xx (ví dụ 400 hoặc 500)
    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}))
      throw new Error(errorJson.error || `Image upload failed with HTTP status ${response.status}`)
    }

    // Đọc kết quả JSON trả về từ máy chủ Node.js
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Server unable to store image.')
    }

    // -------------------------------------------------------------------------
    // BƯỚC 6: Trả về kết quả hoàn tất gồm đường dẫn web tĩnh và tên file
    // -------------------------------------------------------------------------
    return {
      success: true,
      url: data.url,           // Đường dẫn dùng cho thẻ <img src={url} /> và lưu vào db.json
      fileName: data.fileName, // Tên file đã được đánh số định danh duy nhất trên ổ đĩa
      category: data.category,
      folder: data.folder,
    }
  } catch (error) {
    console.error('Error uploading image to Node.js server:', error)
    throw error
  }
}

export default uploadImage
