import { Plus, CheckCircle2, Circle, Info } from 'lucide-react'
import { Badge } from '../common'

/**
 * Component ShippingAddresses: Danh sách các địa chỉ giao hàng đã lưu của khách hàng
 *
 * Tính năng:
 * - Hiển thị huy hiệu đếm số lượng địa chỉ (SAVED).
 * - Cho phép chọn địa chỉ mặc định (Primary / Default Shipping Address).
 * - Hiển thị mã địa chỉ (#ADDR-...), số điện thoại, ghi chú giao hàng (nếu có).
 * - Các nút thao tác nhanh: EDIT (sửa), DELETE (xóa) và ADD NEW ADDRESS (thêm mới).
 * - Bố cục responsive: 1 cột trên Mobile, 2 cột trên Tablet và Desktop.
 *
 * Props:
 * - addresses: Mảng danh sách các địa chỉ đã lưu
 * - onAddNew: Callback mở modal thêm địa chỉ mới
 * - onEdit: Callback mở modal sửa địa chỉ
 * - onDelete: Callback yêu cầu xóa địa chỉ
 * - onSetDefault: Callback đặt địa chỉ làm mặc định
 */
export default function ShippingAddresses({
  addresses = [],
  onAddNew,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  return (
    <section className="mt-12 md:mt-16 mb-12 md:mb-16 border-t border-[#E5E5E5] pt-10">
      {/* 1. Header mục địa chỉ giao hàng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-[#111111]">
              SHIPPING ADDRESSES
            </h2>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#F0F0F0] text-[#666666] rounded-[2px]">
              {addresses.length} SAVED
            </span>
          </div>
          <p className="text-xs text-[#666666] tracking-wide mt-1">
            Manage your delivery destinations and set your primary default shipping address.
          </p>
        </div>

        {/* Nút Thêm địa chỉ mới */}
        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-1.5 border border-black px-4 py-2 text-xs uppercase tracking-wider font-semibold text-black hover:bg-black hover:text-white transition-colors rounded-[2px] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW ADDRESS</span>
        </button>
      </div>

      {/* 2. Lưới hiển thị các thẻ địa chỉ */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => {
            const isDefault = Boolean(addr.isDefault)

            return (
              <div
                key={addr.id}
                className={`bg-white border rounded-[2px] p-5 flex flex-col justify-between transition-all ${
                  isDefault
                    ? 'border-black shadow-sm'
                    : 'border-[#E5E5E5] hover:border-[#CCCCCC]'
                }`}
              >
                <div>
                  {/* Top Bar của Card: Badges & Nút chọn Default */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDefault && (
                        <Badge variant="solid" size="sm" className="bg-black text-white">
                          DEFAULT ADDRESS
                        </Badge>
                      )}
                      {addr.isVerified && (
                        <span className="border border-[#E5E5E5] text-[#666666] text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] font-mono">
                          VERIFIED
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#888888] tracking-widest">
                        #{addr.id}
                      </span>
                    </div>

                    {/* Điều khiển chọn địa chỉ mặc định */}
                    {isDefault ? (
                      <span className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 py-1 px-2 text-black bg-[#F0F0F0] rounded-[2px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Primary</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSetDefault?.(addr.id)}
                        className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 py-1 px-2 text-[#888888] hover:text-black hover:bg-[#F8F8F8] transition-colors rounded-[2px] cursor-pointer"
                      >
                        <Circle className="w-3.5 h-3.5" />
                        <span>Set as Default</span>
                      </button>
                    )}
                  </div>

                  {/* Chi tiết người nhận & số điện thoại (nếu có) */}
                  {(addr.name || addr.phone) && (
                    <div className="mb-2">
                      {addr.name && (
                        <h3 className="font-semibold text-sm text-black tracking-wide">
                          {addr.name}
                        </h3>
                      )}
                      {addr.phone && (
                        <p className="text-xs text-[#666666] font-mono mt-0.5">
                          {addr.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Chi tiết địa chỉ 4 cấp */}
                  <div className="text-xs text-[#444444] leading-relaxed space-y-0.5">
                    <p className="font-medium text-black">{addr.address || addr.street}</p>
                    <p>
                      {[addr.ward, addr.district].filter(Boolean).join(', ')}
                    </p>
                    <p>{addr.city}</p>
                  </div>

                  {/* Ghi chú giao hàng (nếu có) */}
                  {addr.note && (
                    <div className="mt-3 pt-3 border-t border-[#F0F0F0] text-[11px] text-[#666666] flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                      <span className="italic">{addr.note}</span>
                    </div>
                  )}
                </div>

                {/* Footer Card: Các nút sửa & xóa */}
                <div className="mt-5 pt-3 border-t border-[#F0F0F0] flex items-center justify-end gap-4 text-xs font-semibold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => onEdit?.(addr)}
                    className="text-black hover:opacity-60 transition-opacity cursor-pointer"
                  >
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(addr.id)}
                    className="text-[#888888] hover:text-red-600 transition-colors cursor-pointer"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Trạng thái danh sách rỗng */
        <div className="col-span-full p-8 text-center border border-dashed border-[#E5E5E5] text-xs text-[#888888] uppercase tracking-wider">
          No addresses saved. Click "Add New Address" to create one.
        </div>
      )}
    </section>
  )
}

