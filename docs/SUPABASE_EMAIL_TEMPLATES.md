# 📧 Supabase Email Templates - Hồi Nét

> **Hướng dẫn toàn diện** để cấu hình email templates chuyên nghiệp cho hệ thống Hồi Nét trên Supabase.

## 🎨 Thông Tin Branding

| Thuộc tính | Giá trị |
|------------|---------|
| **Tên thương hiệu** | Hồi Nét |
| **Slogan** | Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI |
| **Primary Color** | `#ec4899` (Pink) |
| **Secondary Color** | `#f59e0b` (Amber) |
| **Gradient** | `linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)` |
| **Background** | `#FFF5E6` (Warm Cream) |
| **Logo URL** | `https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png` |
| **Support Email** | support@hoinet.com |
| **Website** | https://hoinet.com |

---

## 📝 Cách Sử Dụng

### Bước 1: Truy cập Supabase Dashboard
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Authentication** → **Email Templates**

### Bước 2: Copy Template
1. Chọn loại email cần chỉnh sửa
2. Copy nội dung HTML template bên dưới
3. Paste vào ô "Message" trong Supabase
4. Điều chỉnh Subject nếu cần
5. Click **Save**

### Bước 3: Test Email
1. Vào **Authentication** → **Users**
2. Click **Invite user** để test email mời
3. Hoặc đăng ký tài khoản mới để test confirmation email

---

## 📬 Email Templates

### 1. Confirm Signup (Xác nhận đăng ký)

**Subject:**
```
✨ Chào mừng đến với Hồi Nét - Xác nhận email của bạn
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận email - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header with Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Khôi phục ảnh cũ bằng AI</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🎉 Chào mừng bạn!</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color: #ec4899;">Hồi Nét</strong>! Chúng tôi rất vui được đồng hành cùng bạn trong hành trình khôi phục những kỷ niệm quý giá.
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                Vui lòng nhấn nút bên dưới để xác nhận email và kích hoạt tài khoản:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4); transition: all 0.3s ease;">
                      ✨ Xác Nhận Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fallback Link -->
              <p style="color: #8a8a9a; font-size: 13px; line-height: 1.6; margin: 20px 0; text-align: center;">
                Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #ec4899; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <!-- Features Preview -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 24px; margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 16px 0; text-align: center;">🚀 Tính năng chờ bạn khám phá:</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #ec4899; font-size: 18px;">📸</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Khôi phục ảnh cũ bằng AI tiên tiến</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #f59e0b; font-size: 18px;">👨‍👩‍👧‍👦</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Ghép ảnh gia đình chuyên nghiệp</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #ec4899; font-size: 18px;">✨</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Làm nét và tăng chất lượng ảnh</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #f59e0b; font-size: 18px;">🎨</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Tô màu ảnh đen trắng</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px 0;">
                Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2. Invite User (Mời người dùng)

**Subject:**
```
🎁 Bạn được mời tham gia Hồi Nét - Nền tảng khôi phục ảnh AI
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lời mời tham gia - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header with Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Khôi phục ảnh cũ bằng AI</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🎁 Bạn được mời!</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Bạn đã được mời tham gia <strong style="color: #ec4899;">Hồi Nét</strong> - nền tảng khôi phục ảnh cũ và ghép ảnh gia đình bằng công nghệ AI tiên tiến nhất.
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                Nhấn nút bên dưới để chấp nhận lời mời và thiết lập mật khẩu cho tài khoản của bạn:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);">
                      🎉 Chấp Nhận Lời Mời
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fallback Link -->
              <p style="color: #8a8a9a; font-size: 13px; line-height: 1.6; margin: 20px 0; text-align: center;">
                Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #ec4899; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 24px; margin: 30px 0;">
                <tr>
                  <td>
                    <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 16px 0; text-align: center;">✨ Lợi ích khi tham gia:</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 16px;">✓</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Trải nghiệm AI khôi phục ảnh hàng đầu</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 16px;">✓</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Lưu trữ và quản lý ảnh an toàn</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 16px;">✓</span>
                          <span style="color: #4a4a6a; font-size: 14px; margin-left: 8px;">Hỗ trợ 24/7 từ đội ngũ chuyên gia</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px 0;">
                Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3. Magic Link (Đăng nhập không cần mật khẩu)

**Subject:**
```
🔐 Link đăng nhập của bạn - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng nhập - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header with Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Khôi phục ảnh cũ bằng AI</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🔐 Đăng nhập nhanh</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Bạn đã yêu cầu đăng nhập vào <strong style="color: #ec4899;">Hồi Nét</strong>. Nhấn nút bên dưới để đăng nhập ngay mà không cần nhập mật khẩu:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);">
                      🚀 Đăng Nhập Ngay
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fallback Link -->
              <p style="color: #8a8a9a; font-size: 13px; line-height: 1.6; margin: 20px 0; text-align: center;">
                Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #ec4899; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <tr>
                  <td>
                    <p style="color: #92400E; font-size: 14px; margin: 0;">
                      <strong>⚠️ Lưu ý bảo mật:</strong><br>
                      Link này chỉ có hiệu lực trong 1 giờ và chỉ sử dụng được một lần. Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px 0;">
                Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 4. Reset Password (Đặt lại mật khẩu)

**Subject:**
```
🔑 Đặt lại mật khẩu - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header with Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Khôi phục ảnh cũ bằng AI</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🔑 Đặt lại mật khẩu</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn. Nhấn nút bên dưới để tạo mật khẩu mới:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);">
                      🔐 Đặt Lại Mật Khẩu
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fallback Link -->
              <p style="color: #8a8a9a; font-size: 13px; line-height: 1.6; margin: 20px 0; text-align: center;">
                Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #ec4899; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>🛡️ Bảo mật tài khoản:</strong><br>
                      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn an toàn. Link này sẽ hết hạn sau 1 giờ.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Tips -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h4 style="color: #1a1a2e; font-size: 14px; margin: 0 0 12px 0;">💡 Mẹo tạo mật khẩu mạnh:</h4>
                    <ul style="color: #4a4a6a; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>Ít nhất 8 ký tự</li>
                      <li>Kết hợp chữ hoa, chữ thường, số</li>
                      <li>Thêm ký tự đặc biệt (@, #, $...)</li>
                      <li>Không sử dụng thông tin cá nhân</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px 0;">
                Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 5. Change Email Address (Thay đổi email)

**Subject:**
```
📧 Xác nhận thay đổi email - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận email mới - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header with Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Khôi phục ảnh cũ bằng AI</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">📧 Xác nhận email mới</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Bạn đã yêu cầu thay đổi địa chỉ email cho tài khoản <strong style="color: #ec4899;">Hồi Nét</strong>. Để hoàn tất quá trình, vui lòng xác nhận địa chỉ email mới bằng cách nhấn nút bên dưới:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);">
                      ✅ Xác Nhận Email Mới
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fallback Link -->
              <p style="color: #8a8a9a; font-size: 13px; line-height: 1.6; margin: 20px 0; text-align: center;">
                Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #ec4899; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #DBEAFE; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <tr>
                  <td>
                    <p style="color: #1E40AF; font-size: 14px; margin: 0;">
                      <strong>ℹ️ Lưu ý:</strong><br>
                      Sau khi xác nhận, email mới sẽ được sử dụng để đăng nhập và nhận thông báo từ Hồi Nét. Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ ngay với đội hỗ trợ.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px 0;">
                Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 6. Reauthentication (OTP) (Xác thực lại)

**Subject:**
```
🔒 Mã xác thực của bạn - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã xác thực - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header with Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Khôi phục ảnh cũ bằng AI</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🔒 Mã xác thực</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                Đây là mã xác thực của bạn để thực hiện thao tác bảo mật trên tài khoản <strong style="color: #ec4899;">Hồi Nét</strong>:
              </p>
              
              <!-- OTP Code Display -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(245,158,11,0.1) 100%); border: 2px dashed #ec4899; border-radius: 16px; padding: 24px 48px;">
                      <p style="margin: 0 0 8px 0; color: #8a8a9a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mã xác thực của bạn</p>
                      <p style="margin: 0; color: #1a1a2e; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">{{ .Token }}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timer Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <tr>
                  <td>
                    <p style="color: #92400E; font-size: 14px; margin: 0;">
                      <strong>⏱️ Thời gian hiệu lực:</strong><br>
                      Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>🛡️ Cảnh báo bảo mật:</strong><br>
                      Nếu bạn không yêu cầu mã này, có thể ai đó đang cố truy cập vào tài khoản của bạn. Vui lòng đổi mật khẩu ngay và liên hệ đội hỗ trợ.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px 0;">
                Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🔔 Auth Hook Notification Templates

Các email thông báo bảo mật (cấu hình trong **Authentication** → **Hooks** → **Send Email**)

### 7. Password Changed (Mật khẩu đã thay đổi)

**Subject:**
```
🔐 Mật khẩu tài khoản của bạn đã được thay đổi - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mật khẩu đã thay đổi - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 28px;">
                  ✓
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🔐 Mật khẩu đã được thay đổi</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Mật khẩu tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn đã được thay đổi thành công.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 20px; margin: 24px 0;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8a8a9a; font-size: 13px;">Thời gian:</span>
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500; float: right;">{{ .Time }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.05);">
                          <span style="color: #8a8a9a; font-size: 13px;">Email:</span>
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500; float: right;">{{ .Email }}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>⚠️ Không phải bạn thực hiện?</strong><br>
                      Nếu bạn không thay đổi mật khẩu, tài khoản của bạn có thể đã bị xâm nhập. Vui lòng:<br>
                      1. <a href="https://hoinet.com/auth/reset-password" style="color: #991B1B;">Đặt lại mật khẩu ngay</a><br>
                      2. Liên hệ support@hoinet.com để được hỗ trợ
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 8. Email Address Changed (Email đã thay đổi)

**Subject:**
```
📧 Email tài khoản của bạn đã được thay đổi - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email đã thay đổi - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 28px; color: white;">
                  📧
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">📧 Email đã được thay đổi</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Địa chỉ email của tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> đã được thay đổi thành công. Từ bây giờ, bạn sẽ sử dụng email mới để đăng nhập.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 20px; margin: 24px 0;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8a8a9a; font-size: 13px;">Thời gian thay đổi:</span>
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500; float: right;">{{ .Time }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.05);">
                          <span style="color: #8a8a9a; font-size: 13px;">Email cũ:</span>
                          <span style="color: #ef4444; font-size: 14px; float: right; text-decoration: line-through;">{{ .OldEmail }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.05);">
                          <span style="color: #8a8a9a; font-size: 13px;">Email mới:</span>
                          <span style="color: #10b981; font-size: 14px; font-weight: 600; float: right;">{{ .NewEmail }}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>⚠️ Không phải bạn thực hiện?</strong><br>
                      Nếu bạn không thay đổi email, tài khoản của bạn có thể đã bị xâm nhập. Vui lòng liên hệ ngay <a href="mailto:support@hoinet.com" style="color: #991B1B; font-weight: bold;">support@hoinet.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 9. Phone Number Changed (Số điện thoại đã thay đổi)

**Subject:**
```
📱 Số điện thoại tài khoản đã được cập nhật - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Số điện thoại đã thay đổi - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 28px; color: white;">
                  📱
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">📱 Số điện thoại đã cập nhật</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Số điện thoại liên kết với tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn đã được cập nhật thành công.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 20px; margin: 24px 0;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8a8a9a; font-size: 13px;">Thời gian:</span>
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500; float: right;">{{ .Time }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.05);">
                          <span style="color: #8a8a9a; font-size: 13px;">Số điện thoại mới:</span>
                          <span style="color: #10b981; font-size: 14px; font-weight: 600; float: right;">{{ .Phone }}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay <a href="mailto:support@hoinet.com" style="color: #991B1B; font-weight: bold;">support@hoinet.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 10. Identity Linked (Liên kết tài khoản)

**Subject:**
```
🔗 Tài khoản mới đã được liên kết - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liên kết tài khoản - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 28px; color: white;">
                  🔗
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🔗 Tài khoản đã được liên kết</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Một phương thức đăng nhập mới đã được liên kết với tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn. Từ bây giờ, bạn có thể sử dụng phương thức này để đăng nhập nhanh hơn.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.1) 100%); border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid rgba(16,185,129,0.2);">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8a8a9a; font-size: 13px;">Nhà cung cấp:</span>
                          <span style="color: #10b981; font-size: 14px; font-weight: 600; float: right;">{{ .Provider }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.05);">
                          <span style="color: #8a8a9a; font-size: 13px;">Thời gian liên kết:</span>
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500; float: right;">{{ .Time }}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #DBEAFE; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <tr>
                  <td>
                    <p style="color: #1E40AF; font-size: 14px; margin: 0;">
                      <strong>ℹ️ Lợi ích:</strong><br>
                      • Đăng nhập nhanh chóng chỉ với 1 click<br>
                      • Không cần nhớ mật khẩu<br>
                      • Bảo mật cao hơn với xác thực 2 lớp
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Nếu bạn không thực hiện liên kết này, vui lòng đổi mật khẩu ngay và liên hệ <a href="mailto:support@hoinet.com" style="color: #991B1B; font-weight: bold;">support@hoinet.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 11. Identity Unlinked (Huỷ liên kết tài khoản)

**Subject:**
```
🔓 Tài khoản đã được huỷ liên kết - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Huỷ liên kết tài khoản - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 28px; color: white;">
                  🔓
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🔓 Đã huỷ liên kết tài khoản</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Một phương thức đăng nhập đã được huỷ liên kết khỏi tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn. Bạn sẽ không thể sử dụng phương thức này để đăng nhập nữa.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.1) 100%); border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid rgba(245,158,11,0.2);">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #8a8a9a; font-size: 13px;">Nhà cung cấp đã huỷ:</span>
                          <span style="color: #f59e0b; font-size: 14px; font-weight: 600; float: right;">{{ .Provider }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.05);">
                          <span style="color: #8a8a9a; font-size: 13px;">Thời gian:</span>
                          <span style="color: #1a1a2e; font-size: 14px; font-weight: 500; float: right;">{{ .Time }}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <tr>
                  <td>
                    <p style="color: #92400E; font-size: 14px; margin: 0;">
                      <strong>⚠️ Lưu ý:</strong><br>
                      Đảm bảo bạn vẫn còn ít nhất một phương thức đăng nhập khác (email + mật khẩu, hoặc tài khoản liên kết khác) để tránh bị khóa khỏi tài khoản.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>🚨 Không phải bạn?</strong><br>
                      Nếu bạn không thực hiện thao tác này, tài khoản của bạn có thể đã bị xâm nhập. Hãy đổi mật khẩu ngay và liên hệ <a href="mailto:support@hoinet.com" style="color: #991B1B; font-weight: bold;">support@hoinet.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 12. MFA Method Added (Thêm xác thực 2 lớp)

**Subject:**
```
🛡️ Xác thực 2 lớp đã được kích hoạt - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực 2 lớp đã kích hoạt - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); width: 80px; height: 80px; border-radius: 50%; line-height: 80px; font-size: 36px; color: white;">
                  🛡️
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">🎉 Xác thực 2 lớp đã kích hoạt!</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Tuyệt vời! Xác thực 2 lớp (MFA) đã được thêm vào tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn. Tài khoản của bạn giờ đây an toàn hơn bao giờ hết!
              </p>
              
              <!-- Success Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.1) 100%); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(16,185,129,0.3);">
                <tr>
                  <td align="center">
                    <p style="color: #10b981; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">✅ Bảo mật tăng cường!</p>
                    <p style="color: #4a4a6a; font-size: 14px; margin: 0;">Phương thức: <strong>{{ .MFAType }}</strong></p>
                    <p style="color: #8a8a9a; font-size: 13px; margin: 8px 0 0 0;">Kích hoạt lúc: {{ .Time }}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(245,158,11,0.08) 100%); border-radius: 16px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h4 style="color: #1a1a2e; font-size: 14px; margin: 0 0 12px 0;">🔐 Lợi ích của xác thực 2 lớp:</h4>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #10b981; font-size: 14px;">✓</span>
                          <span style="color: #4a4a6a; font-size: 13px; margin-left: 8px;">Chặn 99.9% các cuộc tấn công tài khoản</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #10b981; font-size: 14px;">✓</span>
                          <span style="color: #4a4a6a; font-size: 13px; margin-left: 8px;">Bảo vệ ngay cả khi mật khẩu bị lộ</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #10b981; font-size: 14px;">✓</span>
                          <span style="color: #4a4a6a; font-size: 13px; margin-left: 8px;">Nhận thông báo khi có đăng nhập lạ</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Nếu bạn không kích hoạt xác thực 2 lớp, vui lòng đổi mật khẩu ngay và liên hệ <a href="mailto:support@hoinet.com" style="color: #991B1B; font-weight: bold;">support@hoinet.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 13. MFA Method Removed (Xoá xác thực 2 lớp)

**Subject:**
```
⚠️ Xác thực 2 lớp đã bị xoá khỏi tài khoản - Hồi Nét
```

**Message (HTML):**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực 2 lớp đã xoá - Hồi Nét</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); border-radius: 24px 24px 0 0; padding: 40px 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png" alt="Hồi Nét Logo" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Hồi Nét</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Thông báo bảo mật</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 40px 30px; border-left: 1px solid rgba(255,255,255,0.8); border-right: 1px solid rgba(255,255,255,0.8);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); width: 80px; height: 80px; border-radius: 50%; line-height: 80px; font-size: 36px; color: white;">
                  ⚠️
                </div>
              </div>
              
              <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; text-align: center;">⚠️ Xác thực 2 lớp đã bị xoá</h2>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xin chào,
              </p>
              
              <p style="color: #4a4a6a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Xác thực 2 lớp (MFA) đã bị xoá khỏi tài khoản <strong style="color: #ec4899;">Hồi Nét</strong> của bạn. Tài khoản của bạn hiện chỉ được bảo vệ bằng mật khẩu.
              </p>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(248,113,113,0.1) 100%); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(239,68,68,0.3);">
                <tr>
                  <td align="center">
                    <p style="color: #ef4444; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">🔓 Bảo mật giảm!</p>
                    <p style="color: #4a4a6a; font-size: 14px; margin: 0;">Phương thức đã xoá: <strong>{{ .MFAType }}</strong></p>
                    <p style="color: #8a8a9a; font-size: 13px; margin: 8px 0 0 0;">Thời gian: {{ .Time }}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Recommendation -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <tr>
                  <td>
                    <p style="color: #92400E; font-size: 14px; margin: 0;">
                      <strong>💡 Khuyến nghị:</strong><br>
                      Chúng tôi khuyên bạn nên bật lại xác thực 2 lớp để bảo vệ tài khoản tốt hơn. Truy cập <a href="https://hoinet.com/settings/security" style="color: #92400E; font-weight: bold;">Cài đặt bảo mật</a> để thiết lập.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Critical Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FEE2E2; border-radius: 12px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <tr>
                  <td>
                    <p style="color: #991B1B; font-size: 14px; margin: 0;">
                      <strong>🚨 CẢNH BÁO QUAN TRỌNG:</strong><br>
                      Nếu bạn không thực hiện thao tác này, tài khoản của bạn có thể đã bị xâm nhập nghiêm trọng!<br><br>
                      <strong>Hành động ngay:</strong><br>
                      1. Đổi mật khẩu ngay lập tức<br>
                      2. Bật lại xác thực 2 lớp<br>
                      3. Liên hệ <a href="mailto:support@hoinet.com" style="color: #991B1B; font-weight: bold;">support@hoinet.com</a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Re-enable Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://hoinet.com/settings/security" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);">
                      🛡️ Bật Lại Xác Thực 2 Lớp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 0 0 24px 24px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0;">
                © 2026 Hồi Nét. Made with ❤️ All rights reserved.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:support@hoinet.com" style="color: #ec4899; text-decoration: none; font-size: 13px;">Hỗ trợ</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 Template Variables Reference

Các biến có thể sử dụng trong email templates:

| Biến | Mô tả | Sử dụng trong |
|------|-------|---------------|
| `{{ .ConfirmationURL }}` | Link xác nhận/thực hiện action | Confirm, Invite, Magic Link, Reset, Change Email |
| `{{ .Token }}` | Mã OTP | Reauthentication |
| `{{ .TokenHash }}` | Hash của token | Tùy chọn |
| `{{ .SiteURL }}` | URL trang web | Tất cả |
| `{{ .Email }}` | Email người dùng | Tất cả |
| `{{ .NewEmail }}` | Email mới | Change Email |
| `{{ .OldEmail }}` | Email cũ | Email Changed |
| `{{ .Time }}` | Thời gian thực hiện | Notifications |
| `{{ .Provider }}` | Tên nhà cung cấp OAuth | Identity Linked/Unlinked |
| `{{ .Phone }}` | Số điện thoại | Phone Changed |
| `{{ .MFAType }}` | Loại MFA (TOTP, SMS...) | MFA Added/Removed |

---

## 🎨 Design Principles

### Color Palette
```css
/* Primary Pink */
--primary: #ec4899;
--primary-hover: #db2777;

/* Secondary Amber */
--secondary: #f59e0b;
--secondary-hover: #d97706;

/* Gradient */
--gradient: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);

/* Background */
--bg-warm: linear-gradient(135deg, #FFF5E6 0%, #FFEBD6 50%, #FFE4D4 100%);

/* Text */
--text-primary: #1a1a2e;
--text-secondary: #4a4a6a;
--text-muted: #8a8a9a;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: 700 weight
- **Body**: 400 weight
- **Line Height**: 1.7

### Border Radius
- **Cards**: 24px
- **Buttons**: 50px (pill shape)
- **Alerts**: 12px
- **Feature boxes**: 16px

---

## ✅ Testing Checklist

- [ ] Test email hiển thị đúng trên Gmail
- [ ] Test email hiển thị đúng trên Outlook
- [ ] Test email hiển thị đúng trên Apple Mail
- [ ] Test responsive trên mobile
- [ ] Kiểm tra tất cả links hoạt động
- [ ] Kiểm tra logo hiển thị
- [ ] Kiểm tra gradient colors
- [ ] Kiểm tra dark mode (nếu email client hỗ trợ)

---

## 📞 Support

Nếu cần hỗ trợ:
- **Email**: support@hoinet.com
- **Website**: https://hoinet.com
- **Documentation**: https://docs.hoinet.com

---

*Tài liệu này được tạo cho dự án Hồi Nét - Nền tảng khôi phục ảnh AI*
