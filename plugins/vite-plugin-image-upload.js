import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import process from 'node:process'

/**
 * =============================================================================
 * VITE PLUGIN: imageUploadPlugin (Xử lý lưu trữ hình ảnh qua Node.js File System)
 * =============================================================================
 *
 * Mục đích & Chức năng:
 * - Plugin này chạy trực tiếp trên môi trường Node.js của Vite Dev Server.
 * - Lắng nghe các yêu cầu POST tới endpoint nội bộ: '/api/upload-image'.
 * - Sử dụng module 'node:fs' và 'node:path' để ghi tệp hình ảnh vào thư mục 'public/'.
 * - Tự động phân loại thư mục lưu trữ dựa theo tham số 'category' hoặc 'folder':
 *   + Nếu là sản phẩm: Lưu vào 'public/images/products/<category>'
 *     (ví dụ: public/images/products/shirt, public/images/products/pants, ...)
 *   + Nếu là profile: Lưu vào 'public/images/avatars/'
 * - Tự động kiểm tra và tạo mới thư mục nếu chưa tồn tại bằng fs.mkdirSync({ recursive: true }).
 * - Tạo tên file duy nhất kết hợp tiền tố và dấu thời gian timestamp để tránh trùng lặp.
 * - Trả về đường dẫn tĩnh hợp lệ (URL) để trình duyệt hiển thị và lưu vào database.
 */

/**
 * Hàm phân giải đường dẫn lưu trữ trên đĩa cứng và đường dẫn web tĩnh
 * @param {string} category - Danh mục sản phẩm (SHIRT, PANTS, SET, SHOES, ACCESSORIES, DRESS, JACKET...)
 * @param {string} folder - Tên thư mục tùy chỉnh (ví dụ: 'avatars' cho profile)
 * @returns {{ diskPath: string, webPath: string, prefix: string }}
 */
function resolveDestination(category, folder) {
  // 1. Trường hợp tải ảnh đại diện Profile
  if (folder === 'avatars' || String(category || '').toLowerCase() === 'avatar') {
    return {
      diskPath: path.resolve(process.cwd(), 'public/images/avatars'),
      webPath: '/images/avatars',
      prefix: 'avatar',
    }
  }

  // 2. Trường hợp tải ảnh sản phẩm theo danh mục (Category)
  const rawCat = String(category || 'others').toLowerCase().trim()

  // Chuẩn hóa tên danh mục thành tên thư mục tương ứng trong public/images/products/
  let subFolder = 'others'
  if (rawCat.includes('shirt')) subFolder = 'shirt'
  else if (rawCat.includes('pant')) subFolder = 'pants'
  else if (rawCat.includes('set')) subFolder = 'set'
  else if (rawCat.includes('shoe')) subFolder = 'shoes'
  else if (rawCat.includes('access')) subFolder = 'accessories'
  else if (rawCat.includes('dress')) subFolder = 'dress'
  else if (rawCat.includes('jacket')) subFolder = 'jacket'
  else if (rawCat) subFolder = rawCat.replace(/[^a-z0-9_-]/g, '')

  return {
    diskPath: path.resolve(process.cwd(), `public/images/products/${subFolder}`),
    webPath: `/images/products/${subFolder}`,
    prefix: subFolder,
  }
}

/**
 * Plugin chính cung cấp Middleware cho Vite Dev Server
 */
export default function imageUploadPlugin() {
  const setupMiddleware = (server) => {
    server.middlewares.use('/api/upload-image', (req, res, next) => {
      // Chỉ nhận phương thức HTTP POST
      if (req.method !== 'POST') {
        return next()
      }

      let rawBody = ''
      req.on('data', (chunk) => {
        rawBody += chunk
      })

      req.on('end', () => {
        try {
          const payload = JSON.parse(rawBody || '{}')
          const { fileData, fileName, category, folder } = payload

          // Kiểm tra tính hợp lệ của dữ liệu đầu vào
          if (!fileData) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(
              JSON.stringify({
                success: false,
                error: 'Dữ liệu ảnh không hợp lệ hoặc bị trống (fileData is required)',
              })
            )
          }

          // 1. Phân tách chuỗi Base64 và xác định định dạng tệp (MIME type / extension)
          const base64Match = fileData.match(/^data:([^;]+);base64,(.+)$/)
          let buffer
          let extension = 'jpg'

          if (base64Match && base64Match.length === 3) {
            const mimeType = base64Match[1].toLowerCase()
            buffer = Buffer.from(base64Match[2], 'base64')

            if (mimeType.includes('png')) extension = 'png'
            else if (mimeType.includes('webp')) extension = 'webp'
            else if (mimeType.includes('gif')) extension = 'gif'
            else if (mimeType.includes('svg')) extension = 'svg'
            else extension = 'jpg'
          } else {
            // Trường hợp gửi chuỗi base64 thuần túy không có data-uri header
            buffer = Buffer.from(fileData, 'base64')
            if (fileName && fileName.includes('.')) {
              extension = fileName.split('.').pop().toLowerCase()
            }
          }

          // 2. Xác định thư mục đích theo category và folder
          const { diskPath, webPath, prefix } = resolveDestination(category, folder)

          // 3. Sử dụng fs.existsSync và fs.mkdirSync để tạo thư mục nếu chưa có
          if (!fs.existsSync(diskPath)) {
            // recursive: true giúp tạo cả cây thư mục cha nếu chưa tồn tại
            fs.mkdirSync(diskPath, { recursive: true })
          }

          // 4. Tạo tên tệp độc nhất bằng timestamp và random id để không bao giờ bị trùng khi tải nhiều ảnh đồng thời
          const uniqueSuffix = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
          const safeName = `${prefix}-${uniqueSuffix}.${extension}`
          const fullDiskFilePath = path.join(diskPath, safeName)

          // 5. Sử dụng fs.writeFileSync để ghi dữ liệu nhị phân của ảnh xuống ổ đĩa
          fs.writeFileSync(fullDiskFilePath, buffer)

          // 6. Đường dẫn web tĩnh mà client có thể truy cập ngay lập tức
          const publicWebUrl = `${webPath}/${safeName}`

          // 7. Trả về phản hồi thành công dạng JSON cho trình duyệt
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          return res.end(
            JSON.stringify({
              success: true,
              url: publicWebUrl,
              fileName: safeName,
              category: category || null,
              folder: webPath,
            })
          )
        } catch (error) {
          console.error('imageUploadPlugin Error (Node.js fs):', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          return res.end(
            JSON.stringify({
              success: false,
              error: error.message || 'Lỗi xử lý lưu ảnh trên máy chủ Node.js',
            })
          )
        }
      })
    })
  }

  return {
    name: 'vite-plugin-image-upload',
    // Kích hoạt middleware khi chạy 'vite' (dev server)
    configureServer(server) {
      setupMiddleware(server)
    },
    // Kích hoạt middleware khi chạy 'vite preview'
    configurePreviewServer(server) {
      setupMiddleware(server)
    },
  }
}

