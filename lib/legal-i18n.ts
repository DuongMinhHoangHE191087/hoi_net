/**
 * Bản tiếng Anh của trang Điều khoản sử dụng và Chính sách bảo mật.
 * Bản tiếng Việt nằm trực tiếp trong app/terms/page.tsx và app/privacy/page.tsx;
 * thứ tự các mục ở đây phải khớp với mảng `sections` của từng trang.
 *
 * Lưu ý: đây là bản dịch tiện đọc cho người dùng quốc tế; khi có tranh chấp
 * bản tiếng Việt là bản gốc. Nên có luật sư rà soát trước khi dùng cho mục đích pháp lý.
 */

export const LEGAL_COMMON = {
  back: { vi: 'Quay lại trang chủ', en: 'Back to home' },
  updated: { vi: 'Cập nhật lần cuối: Tháng 1, 2026', en: 'Last updated: January 2026' },
  originalNote: {
    vi: '',
    en: 'In case of any discrepancy, the Vietnamese version prevails.',
  },
}

export const TERMS_EN = {
  title: 'Terms of Service',
  introLead: 'Welcome to',
  introBody:
    'Please read these terms of service carefully before using our service. By using the service, you agree to these terms.',
  sections: [
    {
      title: '1. Conditions of Use',
      content: [
        'By accessing and using the Hoi Net service, you agree to comply with these terms.',
        'You must be at least 13 years old to use the service.',
        'You are responsible for keeping your account information secure.',
        'Using the service for any unlawful purpose is strictly prohibited.',
      ],
    },
    {
      title: '2. Our Services',
      content: [
        'Hoi Net provides old-photo restoration powered by AI.',
        'We also provide professional family photo composition.',
        'Results depend on the quality of the original photo.',
        'We reserve the right to decline to process inappropriate content.',
      ],
    },
    {
      title: '3. Intellectual Property',
      content: [
        'You retain full ownership of your original photos.',
        'You may use processed photos for personal purposes.',
        'Copying or distributing the Hoi Net interface and source code is strictly prohibited.',
        'The Hoi Net logo and brand are owned by us.',
      ],
    },
    {
      title: '4. Limitation of Liability',
      content: [
        'The service is provided “as is” without warranty.',
        'We are not liable for indirect damages.',
        'Our maximum liability is limited to the amount you have paid.',
        'You should back up your original photos before using the service.',
      ],
    },
    {
      title: '5. Changes to the Terms',
      content: [
        'We may update these terms at any time.',
        'Changes take effect as soon as they are published.',
        'Continued use of the service means you accept the changes.',
        'Please check this page regularly for updates.',
      ],
    },
  ],
  questionsTitle: 'Have a question?',
  questionsText: 'Contact us if you need clarification about these terms of service.',
  related: 'Privacy Policy →',
}

export const PRIVACY_EN = {
  title: 'Privacy Policy',
  introLead: 'At',
  introBody:
    'we are committed to protecting your privacy. This policy explains how we collect, use and protect your personal information when you use our photo restoration service.',
  sections: [
    {
      title: '1. Information We Collect',
      content: [
        'Your email and name when you register an account.',
        'Photos you upload in order to use the service.',
        'Payment information when you purchase a plan.',
        'Usage data and access logs.',
      ],
    },
    {
      title: '2. How We Use Information',
      content: [
        'To provide and improve the photo restoration service.',
        'To send notifications about orders and service updates.',
        'To support customers when they ask for help.',
        'To analyse and improve the user experience.',
      ],
    },
    {
      title: '3. Data Security',
      content: [
        'Data in transit is encrypted with SSL/TLS.',
        'Data is stored securely on a protected cloud system.',
        'Internal access is limited on a need-to-know basis.',
        'Periodic security reviews.',
      ],
    },
    {
      title: '4. Information Sharing',
      content: [
        'We do not sell personal information to third parties.',
        'We only share with payment-processing partners when necessary.',
        'We may share information when required by law.',
        'Anonymised data may be used for research.',
      ],
    },
    {
      title: '5. Cookies & Tracking',
      content: [
        'We use cookies to keep you signed in.',
        'Analytics cookies help us improve the service.',
        'You can disable cookies in your browser.',
        'Some features may be affected if cookies are disabled.',
      ],
    },
    {
      title: '6. Your Rights',
      content: [
        'Request to see the personal data we store about you.',
        'Request correction of inaccurate information.',
        'Request deletion of your account and related data.',
        'Withdraw your consent at any time.',
      ],
    },
  ],
  retentionTitle: 'Data Retention',
  retention: [
    '• Uploaded photos: deleted after 30 days if no processing is requested',
    '• Processed photos: kept for 90 days so you can download them',
    '• Account information: kept until you ask us to delete it',
    '• Access logs: deleted after 12 months',
  ],
  contactTitle: 'Privacy Contact',
  contactText: 'If you have questions or wish to exercise your rights, please get in touch.',
  controller: 'Data controller:',
  related: '← Terms of Service',
}
