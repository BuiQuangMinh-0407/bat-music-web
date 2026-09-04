// ─────────────────────────────────────────────────────────────────────────────
// constants/payment.js
// Thông tin thanh toán chính thức của BÙI QUANG MINH — MB Bank & MoMo
// ─────────────────────────────────────────────────────────────────────────────

/** Số giây nghe thử miễn phí trước khi hiện paywall */
export const PREVIEW_SECONDS = 30;

/** Giá mở khoá 1 bài (VNĐ) */
export const UNLOCK_PRICE_VND = 5000;

/**
 * Thông tin thanh toán chính thức
 */
export const PAYMENT_INFO = {
  momo: {
    phone: '0389445060',
    name:  'BÙI QUANG MINH',
    note:  'BAT Music - Mo khoa nhac',
  },
  zalopay: {
    phone: '0389445060',
    name:  'BÙI QUANG MINH',
    note:  'BAT Music - Mo khoa nhac',
  },
  bank: {
    bankId:        'MB',                  // Ngân hàng Quân Đội MB Bank
    bankName:      'MB Bank (Quân Đội)', // Tên ngân hàng hiển thị
    accountNumber: '0389445060',          // Số tài khoản MB Bank
    accountName:   'BUI QUANG MINH',     // Tên chủ tài khoản
    branch:        'Hội sở chính',
    note:          'BAT Music mo khoa nhac',
  },
};
