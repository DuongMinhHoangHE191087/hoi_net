/**
 * Từ điển giao diện chung (Navbar, Footer, Contact) VI/EN.
 *
 * Menu và cột footer lấy từ Supabase (navigation_links, footer_links) bằng
 * tiếng Việt, nên bản tiếng Anh được tra theo `href` / `column_name`. Mục nào
 * chưa có bản dịch sẽ giữ nguyên nhãn gốc từ database.
 */

import type { L, Lang } from './i18n'

/** Nhãn menu điều hướng và liên kết footer, tra theo href */
const LINK_LABELS: Record<string, L> = {
  '/': { vi: 'Trang Chủ', en: 'Home' },
  '/blog': { vi: 'Blog', en: 'Blog' },
  '/about': { vi: 'Về Chúng Tôi', en: 'About Us' },
  '/contact': { vi: 'Liên Hệ', en: 'Contact' },
  '/features': { vi: 'Tính Năng', en: 'Features' },
  '/pricing': { vi: 'Bảng Giá', en: 'Pricing' },
  '/team': { vi: 'Đội Ngũ', en: 'Team' },
  '/donate': { vi: 'Ủng Hộ', en: 'Donate' },
  '/terms': { vi: 'Điều Khoản', en: 'Terms of Service' },
  '/privacy': { vi: 'Bảo Mật', en: 'Privacy Policy' },
  '/request-photo': { vi: 'Phục Chế Ảnh', en: 'Restore a Photo' },
}

/** Tiêu đề cột footer, tra theo column_name */
const FOOTER_COLUMNS: Record<string, L> = {
  products: { vi: 'Sản Phẩm', en: 'Product' },
  company: { vi: 'Công Ty', en: 'Company' },
  legal: { vi: 'Pháp Lý', en: 'Legal' },
}

/**
 * Nhãn liên kết theo ngôn ngữ, tra theo href. Từ điển áp dụng cho cả hai chiều vì nhãn lưu
 * trong DB có thể bằng bất kỳ ngôn ngữ nào (DB hiện có cả "Home", "About us").
 * Không có trong từ điển thì giữ nhãn gốc từ database.
 */
export function translateLink(label: string, href: string, lang: Lang): string {
  return LINK_LABELS[href]?.[lang] ?? label
}

/** Tiêu đề cột footer theo ngôn ngữ, tra theo column_name; không có thì giữ tiêu đề gốc. */
export function translateFooterColumn(title: string, columnName: string, lang: Lang): string {
  return FOOTER_COLUMNS[columnName]?.[lang] ?? title
}

/** Chuỗi giao diện dùng chung */
export const COMMON = {
  login: { vi: 'Đăng Nhập', en: 'Log In' },
  register: { vi: 'Đăng Ký', en: 'Sign Up' },
  logout: { vi: 'Đăng Xuất', en: 'Log Out' },
  profile: { vi: 'Hồ Sơ', en: 'Profile' },
  requests: { vi: 'Yêu Cầu', en: 'My Requests' },
  dashboard: { vi: 'Dashboard', en: 'Dashboard' },
  userFallback: { vi: 'Người dùng', en: 'User' },
  languageLabel: { vi: 'Ngôn ngữ', en: 'Language' },
} satisfies Record<string, L>

export const FOOTER = {
  contactTitle: { vi: 'Liên Hệ', en: 'Contact' },
  description: {
    vi: 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI — mang lại kỷ niệm tươi đẹp.',
    en: 'Restore old photos and compose family portraits with AI — bringing beautiful memories back.',
  },
  madeWith: { vi: 'Made with', en: 'Made with' },
  inVietnam: { vi: 'in Vietnam · All rights reserved.', en: 'in Vietnam · All rights reserved.' },
  copyright: (year: number, lang: Lang) =>
    lang === 'vi'
      ? `© ${year} Công ty TNHH Công nghệ Hồi Nét. Dự án Hồi Nét — phi lợi nhuận.`
      : `© ${year} Hoi Net Technology Company Limited. The Hoi Net project — non-profit.`,
}

export const CONTACT_INFO = {
  office: { vi: 'Trụ sở', en: 'Headquarters' },
  phone: { vi: 'Điện thoại', en: 'Phone' },
  hours: { vi: 'Giờ làm việc', en: 'Working hours' },
  mailboxes: { vi: 'Các hộp thư', en: 'Mailboxes' },
  support: { vi: 'Hỗ trợ', en: 'Support' },
  press: { vi: 'Báo chí & hợp tác', en: 'Press & partnerships' },
  careers: { vi: 'Tuyển dụng', en: 'Careers' },
} satisfies Record<string, L>

/** Chuỗi trang Liên hệ */
export const CONTACT_PAGE = {
  title: { vi: 'Liên Hệ Với Chúng Tôi', en: 'Contact Us' },
  subtitle: {
    vi: 'Gửi phản hồi, câu hỏi hoặc yêu cầu phục hồi ảnh. Chúng tôi sẽ phản hồi sớm nhất! ✨',
    en: 'Send feedback, questions or photo restoration requests. We will get back to you as soon as possible! ✨',
  },
  checking: { vi: 'Đang kiểm tra...', en: 'Checking...' },
  member: { vi: 'Thành viên', en: 'Member' },
  guest: { vi: 'Khách', en: 'Guest' },
  memberLimit: { vi: '3 yêu cầu/ngày', en: '3 requests/day' },
  guestLimit: { vi: '1 yêu cầu/ngày', en: '1 request/day' },
  loginForMore: { vi: 'Đăng nhập để gửi thêm', en: 'Log in to send more' },
  liveChat: { vi: 'Trò chuyện trực tiếp', en: 'Live conversation' },
  feedback: { vi: 'Phản Hồi', en: 'Feedback' },
  sendFeedback: { vi: 'Gửi phản hồi trực tiếp', en: 'Send feedback directly' },
  sent: { vi: 'Yêu cầu đã được gửi!', en: 'Your request has been sent!' },
  waitingAdmin: { vi: 'Đang đợi Admin xử lý', en: 'Waiting for an admin to process it' },
  received: {
    vi: 'Yêu cầu của bạn đã được tiếp nhận. Admin sẽ xem xét và phản hồi trong thời gian sớm nhất (thường trong 24 giờ).',
    en: 'We have received your request. An admin will review it and reply as soon as possible (usually within 24 hours).',
  },
  emailNotice: { vi: 'Bạn sẽ nhận email thông báo khi có kết quả', en: 'You will receive an email when the result is ready' },
  viewMyRequests: { vi: 'Xem Yêu Cầu Của Tôi', en: 'View My Requests' },
  sendAnother: { vi: 'Gửi Yêu Cầu Khác', en: 'Send Another Request' },
  formTitle: { vi: 'Gửi Yêu Cầu Của Bạn', en: 'Send Your Request' },
  spacingNotice: {
    vi: 'Để đảm bảo chất lượng dịch vụ, mỗi lần gửi cách nhau 2 phút',
    en: 'To keep service quality high, submissions must be 2 minutes apart',
  },
  yourName: { vi: 'Tên của bạn *', en: 'Your name *' },
  namePlaceholder: { vi: 'Nguyễn Văn A', en: 'Jane Doe' },
  phone: { vi: 'Số điện thoại', en: 'Phone number' },
  describe: { vi: 'Mô tả yêu cầu *', en: 'Describe your request *' },
  describePlaceholder: { vi: 'Mô tả chi tiết yêu cầu của bạn...', en: 'Describe your request in detail...' },
  uploadLabel: { vi: 'Tải ảnh lên (tùy chọn)', en: 'Upload photos (optional)' },
  dragDrop: { vi: 'Kéo thả ảnh vào đây hoặc click để chọn', en: 'Drag and drop photos here or click to choose' },
  supported: { vi: 'Hỗ trợ: JPG, PNG, WEBP (Tối đa 10MB/file)', en: 'Supported: JPG, PNG, WEBP (max 10MB per file)' },
  uploading: { vi: 'Đang tải lên...', en: 'Uploading...' },
  rate: { vi: 'Đánh giá trải nghiệm (tùy chọn)', en: 'Rate your experience (optional)' },
  sending: { vi: 'Đang gửi...', en: 'Sending...' },
  submit: { vi: 'Gửi Yêu Cầu', en: 'Submit Request' },
  spamProtected: { vi: 'Yêu cầu được bảo vệ chống spam', en: 'Requests are protected against spam' },
  error: { vi: 'Có lỗi xảy ra, vui lòng thử lại', en: 'Something went wrong, please try again' },
} satisfies Record<string, L>
