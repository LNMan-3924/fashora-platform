import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import process from 'node:process'

/**
 * =============================================================================
 * VITE PLUGIN: imageUploadPlugin (Xử lý lưu trữ hình ảnh qua Node.js File System)
 * =============================================================================
 *
 * 1. BỐI CẢNH & NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trình duyệt (Browser / Client-side) chạy trong một "hộp cát" (Sandbox) an toàn,
 *   nên tuyệt đối KHÔNG THỂ sử dụng module `fs` của Node.js để lưu tệp tin xuống ổ cứng.
 * - Vite Dev Server bản chất là một máy chủ Node.js chạy ngầm bên dưới dự án.
 * - Plugin này tạo ra một "Cổng dịch vụ nội bộ" (Middleware endpoint) tại `/api/upload-image`.
 * - Khi Client gửi dữ liệu ảnh (chuỗi Base64 Data URL) tới endpoint này:
 *   + Node.js tiếp nhận stream dữ liệu và giải mã Base64 thành nhị phân (Buffer).
 *   + Xác định thư mục đích theo danh mục (Category) hoặc mục đích (Avatar, Shop, Product).
 *   + Sử dụng `fs.mkdirSync({ recursive: true })` để tự động tạo cây thư mục nếu chưa có.
 *   + Dùng `fs.writeFileSync()` ghi file ảnh thật 100% vào thư mục `public/images/...`.
 *   + Trả về đường dẫn tĩnh `/images/...` để lưu vào `db.json` và render trực tiếp trên thẻ `<img>`.
 *
 * 2. CÁC ĐỊNH DẠNG HỖ TRỢ:
 * - JPEG/JPG (.jpg)
 * - PNG (.png)
 * - WEBP (.webp)
 * - GIF (.gif)
 * - SVG (.svg)
 */

/**
 * Hàm phân giải đường dẫn lưu trữ trên đĩa cứng và đường dẫn web tĩnh
 *
 * @param {string} category - Danh mục sản phẩm (SHIRT, PANTS, SET, SHOES, ACCESSORIES, DRESS, JACKET...)
 * @param {string} folder - Tên thư mục chỉ định đặc biệt (ví dụ: 'avatars', 'shops')
 * @returns {{ diskPath: string, webPath: string, prefix: string }}
 * - diskPath: Đường dẫn tuyệt đối trên ổ đĩa vật lý (dùng cho Node.js `fs` ghi file)
 * - webPath: Đường dẫn tương đối từ gốc web server (dùng cho trình duyệt gọi hiển thị ảnh)
 * - prefix: Tiền tố đặt tên file (ví dụ: 'avatar', 'shop-logo', 'shirt')
 */
function resolveDestination(category, folder) {
  // ---------------------------------------------------------------------------
  // TRƯỜNG HỢP 1: Tải ảnh Logo hoặc Banner của Gian Hàng (Atelier Shop)
  // Lưu vào: public/images/shops/
  // URL truy cập web: /images/shops/<tên-file>
  // ---------------------------------------------------------------------------
  if (folder === 'shops' || folder === 'logos' || String(category || '').toLowerCase() === 'shop') {
    return {
      diskPath: path.resolve(process.cwd(), 'public/images/shops'),
      webPath: '/images/shops',
      prefix: 'shop-logo',
    }
  }

  // ---------------------------------------------------------------------------
  // TRƯỜNG HỢP 2: Tải ảnh đại diện người dùng (User Profile Avatar)
  // Lưu vào: public/images/avatars/
  // URL truy cập web: /images/avatars/<tên-file>
  // ---------------------------------------------------------------------------
  if (folder === 'avatars' || String(category || '').toLowerCase() === 'avatar') {
    return {
      diskPath: path.resolve(process.cwd(), 'public/images/avatars'),
      webPath: '/images/avatars',
      prefix: 'avatar',
    }
  }

  // ---------------------------------------------------------------------------
  // TRƯỜNG HỢP 3: Tải ảnh Sản phẩm (Products) theo từng Danh mục
  // Phân loại lưu vào: public/images/products/<subFolder>/
  // URL truy cập web: /images/products/<subFolder>/<tên-file>
  // ---------------------------------------------------------------------------
  const rawCat = String(category || 'others').toLowerCase().trim()

  // Chuẩn hóa tên danh mục thành tên thư mục con an toàn trên ổ đĩa
  let subFolder = 'others'
  if (rawCat.includes('shirt')) subFolder = 'shirt'
  else if (rawCat.includes('pant')) subFolder = 'pants'
  else if (rawCat.includes('set')) subFolder = 'set'
  else if (rawCat.includes('shoe')) subFolder = 'shoes'
  else if (rawCat.includes('access')) subFolder = 'accessories'
  else if (rawCat.includes('dress')) subFolder = 'dress'
  else if (rawCat.includes('jacket')) subFolder = 'jacket'
  else if (rawCat) subFolder = rawCat.replace(/[^a-z0-9_-]/g, '') // Lọc bỏ ký tự đặc biệt nếu có

  return {
    diskPath: path.resolve(process.cwd(), `public/images/products/${subFolder}`),
    webPath: `/images/products/${subFolder}`,
    prefix: subFolder,
  }
}

/**
 * Plugin chính cung cấp Middleware cho Vite Server
 * Được đăng ký trong file cấu hình `vite.config.js`.
 */
export default function imageUploadPlugin() {
  /**
   * Thiết lập Middleware bắt các HTTP Request gửi tới Vite Dev/Preview Server
   * @param {import('vite').ViteDevServer} server
   */
  const setupMiddleware = (server) => {
    // Đăng ký Middleware tại tiền tố URL: '/api/upload-image'
    server.middlewares.use('/api/upload-image', (req, res, next) => {
      // 1. Chỉ chấp nhận phương thức HTTP POST (tải dữ liệu lên)
      // Nếu là GET, PUT, DELETE... thì chuyển tiếp cho middleware tiếp theo xử lý
      if (req.method !== 'POST') {
        return next()
      }

      // 2. Thu thập dữ liệu stream gửi từ Client qua giao thức HTTP
      let rawBody = ''
      req.on('data', (chunk) => {
        rawBody += chunk // Nối từng gói dữ liệu nhị phân nhận được
      })

      // 3. Khi toàn bộ gói dữ liệu đã được truyền xong (sự kiện 'end')
      req.on('end', () => {
        try {
          // Phân tích chuỗi JSON nhận được
          const payload = JSON.parse(rawBody || '{}')
          const { fileData, fileName, category, folder } = payload

          // Kiểm tra tính hợp lệ: fileData là bắt buộc (chứa chuỗi Base64 Data URL)
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

          // -------------------------------------------------------------------
          // BƯỚC 1: Phân tách chuỗi Base64 Data URL và xác định phần mở rộng (.ext)
          // Định dạng chuẩn của Data URL: "data:<mime-type>;base64,<payload-base64>"
          // Ví dụ: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
          // -------------------------------------------------------------------
          const base64Match = fileData.match(/^data:([^;]+);base64,(.+)$/)
          let buffer
          let extension = 'jpg'

          if (base64Match && base64Match.length === 3) {
            // Trường hợp 1: Có header Data URL chuẩn
            const mimeType = base64Match[1].toLowerCase() // VD: 'image/png'
            const base64String = base64Match[2]

            // Chuyển chuỗi Base64 thành Buffer nhị phân của Node.js
            buffer = Buffer.from(base64String, 'base64')

            // Suy ra đuôi mở rộng file dựa trên MIME type
            if (mimeType.includes('png')) extension = 'png'
            else if (mimeType.includes('webp')) extension = 'webp'
            else if (mimeType.includes('gif')) extension = 'gif'
            else if (mimeType.includes('svg')) extension = 'svg'
            else extension = 'jpg'
          } else {
            // Trường hợp 2: Client chỉ gửi chuỗi Base64 thô không kèm tiền tố Data URL
            buffer = Buffer.from(fileData, 'base64')
            if (fileName && fileName.includes('.')) {
              extension = fileName.split('.').pop().toLowerCase()
            }
          }

          // -------------------------------------------------------------------
          // BƯỚC 2: Phân giải đường dẫn thư mục đích trên đĩa cứng
          // -------------------------------------------------------------------
          const { diskPath, webPath, prefix } = resolveDestination(category, folder)

          // -------------------------------------------------------------------
          // BƯỚC 3: Tự động tạo thư mục trên ổ đĩa nếu chưa tồn tại
          // Tham số { recursive: true } giúp tạo đệ quy toàn bộ cây thư mục cha
          // Ví dụ: nếu chưa có public/images/products/shirt thì Node sẽ tự động tạo đủ
          // -------------------------------------------------------------------
          if (!fs.existsSync(diskPath)) {
            fs.mkdirSync(diskPath, { recursive: true })
          }

          // -------------------------------------------------------------------
          // BƯỚC 4: Tạo tên file độc nhất (Unique File Name)
          // Cấu trúc: <prefix>-<timestamp>-<random-4-chữ-số>.<extension>
          // Ví dụ: "shirt-1793105423891-4921.jpg"
          // Mục đích: Đảm bảo không bao giờ bị trùng tên hoặc ghi đè ảnh cũ khi nhiều
          // người dùng cùng tải ảnh lên đồng thời.
          // -------------------------------------------------------------------
          const uniqueSuffix = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
          const safeName = `${prefix}-${uniqueSuffix}.${extension}`
          const fullDiskFilePath = path.join(diskPath, safeName)

          // -------------------------------------------------------------------
          // BƯỚC 5: Ghi file nhị phân trực tiếp xuống ổ cứng bằng fs.writeFileSync
          // Đây là hành động ghi vật lý thực sự vào thư mục public của dự án
          // -------------------------------------------------------------------
          fs.writeFileSync(fullDiskFilePath, buffer)

          // -------------------------------------------------------------------
          // BƯỚC 6: Tạo đường dẫn web tĩnh (Public URL)
          // Vì file nằm trong thư mục 'public/', Vite sẽ tự động phục vụ file này ở gốc web
          // Ví dụ: /images/products/shirt/shirt-1793105423891-4921.jpg
          // -------------------------------------------------------------------
          const publicWebUrl = `${webPath}/${safeName}`

          // -------------------------------------------------------------------
          // BƯỚC 7: Phản hồi kết quả thành công HTTP 200 về cho trình duyệt
          // -------------------------------------------------------------------
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
          // Bắt các lỗi ngoại lệ (JSON không hợp lệ, đầy ổ đĩa, lỗi phân quyền fs...)
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

    // 1. Kích hoạt Middleware khi chạy server phát triển: 'npm run dev'
    configureServer(server) {
      setupMiddleware(server)
    },

    // 2. Kích hoạt Middleware khi xem trước bản build: 'npm run preview'
    configurePreviewServer(server) {
      setupMiddleware(server)
    },
  }
}
