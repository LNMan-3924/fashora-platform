/**
 * ============================================================================
 * ORDER CONSTANTS & COMPATIBILITY LAYER
 * Tương thích ngược: Re-export toàn bộ hằng số và hàm tiện ích từ
 * thư mục tập trung src/constants/commerce.js
 * Giúp các component order có thể import trực tiếp từ file này hoặc từ @constants
 * mà không bị trùng lặp mã nguồn (Single Source of Truth).
 * ============================================================================
 */

export * from '../../constants/commerce'
