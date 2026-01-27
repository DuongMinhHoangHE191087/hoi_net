# 📧 Email Templates cho Supabase - Hồi Nét

> **Thiết kế chuyên nghiệp** - Tương thích mọi email client (Gmail, Outlook, Apple Mail...)

---

## Thông tin thương hiệu

| | |
|---|---|
| **Tên dự án** | Hồi Nét |
| **Slogan** | Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI |
| **Email** | duongminhhoanginwork@gmail.com |
| **Hotline: ** | 039 449 7949 |
| **Trưởng dự án: ** | Dương Minh Hoàng |
| **Giảng Viên Hướng Dẫn: ** | Nguyễn Thị Phượng |

---

## 📋 Hướng dẫn cấu hình

1. Đăng nhập **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Vào **Authentication** → **Email Templates**
3. Chọn template type và paste HTML tương ứng
4. Cập nhật **Subject** theo hướng dẫn

---

## 1️⃣ Confirm Signup (Xác nhận đăng ký)

**Subject:** `Xác nhận email của bạn - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác nhận Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Chào mừng bạn!</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Cảm ơn bạn đã đăng ký tài khoản <strong>Hồi Nét</strong>. Vui lòng xác nhận email để bắt đầu khôi phục những kỷ niệm đẹp.
              </p>
              
              <!-- Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #6366f1; border-radius: 8px;">
                          <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">Xác nhận Email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa; text-align: center;">
                Link hết hạn sau 24 giờ. Nếu bạn không đăng ký, vui lòng bỏ qua email này.
              </p>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Alt Link -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">Hoặc copy link:</p>
                    <p style="margin: 0; font-size: 11px; color: #6366f1; word-break: break-all; text-align: center;">{{ .ConfirmationURL }}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Cần hỗ trợ? <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email</td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 2️⃣ Reset Password (Khôi phục mật khẩu)

**Subject:** `Đặt lại mật khẩu - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đặt lại mật khẩu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Đặt lại mật khẩu</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Click nút bên dưới để tạo mật khẩu mới.
              </p>
              
              <!-- Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #f59e0b; border-radius: 8px;">
                          <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">Đặt mật khẩu mới</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>Bảo mật:</strong> Link hết hạn sau 1 giờ. Không chia sẻ với ai.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Alt Link -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">Hoặc copy link:</p>
                    <p style="margin: 0; font-size: 11px; color: #f59e0b; word-break: break-all; text-align: center;">{{ .ConfirmationURL }}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Không yêu cầu đặt lại? Bỏ qua email này.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email</td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 3️⃣ Magic Link (Đăng nhập nhanh)

**Subject:** `Link đăng nhập của bạn - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đăng nhập</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Đăng nhập nhanh</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Click nút bên dưới để đăng nhập vào Hồi Nét mà không cần mật khẩu.
              </p>
              
              <!-- Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #10b981; border-radius: 8px;">
                          <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">Đăng nhập ngay</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa; text-align: center;">
                Link chỉ dùng được 1 lần và hết hạn sau 1 giờ.
              </p>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email</td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 4️⃣ Invite User (Mời người dùng)

**Subject:** `Bạn được mời tham gia Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lời mời</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Bạn được mời!</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Bạn đã được mời tham gia <strong>Hồi Nét</strong> - nền tảng khôi phục ảnh cũ và ghép ảnh gia đình bằng AI.
              </p>
              
              <!-- Benefits -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6366f1;">Quyền lợi:</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">✓ Khôi phục ảnh cũ bằng AI</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">✓ Ghép ảnh gia đình chuyên nghiệp</p>
                    <p style="margin: 0; font-size: 13px; color: #52525b;">✓ Lưu trữ an toàn, bảo mật</p>
                  </td>
                </tr>
              </table>
              
              <!-- Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #8b5cf6; border-radius: 8px;">
                          <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">Chấp nhận lời mời</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 5️⃣ Email Change (Thay đổi email)

**Subject:** `Xác nhận email mới - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thay đổi Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Xác nhận email mới</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Bạn đã yêu cầu thay đổi địa chỉ email. Click nút bên dưới để xác nhận.
              </p>
              
              <!-- Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #06b6d4; border-radius: 8px;">
                          <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">Xác nhận Email mới</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ hỗ trợ ngay.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #06b6d4; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email</td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 6️⃣ Reauthentication / OTP (Mã xác thực)

**Subject:** `Mã xác thực của bạn - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mã xác thực</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Mã xác thực</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Sử dụng mã bên dưới để xác thực tài khoản của bạn:
              </p>
              
              <!-- OTP Code -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 16px 0 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border: 2px dashed #8b5cf6; border-radius: 12px;">
                      <tr>
                        <td style="padding: 20px 40px;">
                          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #6366f1; letter-spacing: 8px; font-family: 'Courier New', monospace;">{{ .Token }}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      <strong>Lưu ý:</strong> Mã này hết hạn sau 5 phút. Không chia sẻ với bất kỳ ai.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

# 🔔 Auth Hook Notification Templates

> Các email thông báo bảo mật - Cấu hình trong **Authentication** → **Hooks** → **Send Email**

---

## 7️⃣ Password Changed (Mật khẩu đã thay đổi)

**Subject:** `Mật khẩu của bạn đã được thay đổi - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mật khẩu đã thay đổi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Success Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; border-radius: 50%; width: 64px; height: 64px;">
                      <tr>
                        <td align="center" style="font-size: 28px; color: #16a34a;">✓</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Mật khẩu đã thay đổi</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Mật khẩu tài khoản <strong>Hồi Nét</strong> của bạn đã được thay đổi thành công.
              </p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table border="0" cellpadding="4" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Email:</td>
                        <td style="font-size: 13px; color: #18181b; text-align: right;">{{ .Email }}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Thời gian:</td>
                        <td style="font-size: 13px; color: #18181b; text-align: right;">{{ .Time }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Nếu bạn không thay đổi mật khẩu, hãy đặt lại ngay và liên hệ hỗ trợ.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                This email was sent to {{ .Email }} to notify you of an update that was made to your Hồi Nét Account.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 8️⃣ Email Address Changed (Email đã thay đổi)

**Subject:** `Email tài khoản của bạn đã được thay đổi - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email đã thay đổi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 50%; width: 64px; height: 64px;">
                      <tr>
                        <td align="center" style="font-size: 28px; color: #2563eb;">📧</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Email đã thay đổi</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Địa chỉ email của tài khoản <strong>Hồi Nét</strong> đã được thay đổi.
              </p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table border="0" cellpadding="4" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Email cũ:</td>
                        <td style="font-size: 13px; color: #ef4444; text-align: right; text-decoration: line-through;">{{ .OldEmail }}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Email mới:</td>
                        <td style="font-size: 13px; color: #16a34a; font-weight: 600; text-align: right;">{{ .NewEmail }}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Thời gian:</td>
                        <td style="font-size: 13px; color: #18181b; text-align: right;">{{ .Time }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Liên hệ ngay: duongminhhoanginwork@gmail.com
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 9️⃣ Phone Number Changed (Số điện thoại đã thay đổi)

**Subject:** `Số điện thoại tài khoản đã được cập nhật - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Số điện thoại đã thay đổi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #ede9fe; border-radius: 50%; width: 64px; height: 64px;">
                      <tr>
                        <td align="center" style="font-size: 28px; color: #7c3aed;">📱</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Số điện thoại đã cập nhật</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Số điện thoại liên kết với tài khoản <strong>Hồi Nét</strong> đã được thay đổi.
              </p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table border="0" cellpadding="4" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Số điện thoại mới:</td>
                        <td style="font-size: 13px; color: #16a34a; font-weight: 600; text-align: right;">{{ .Phone }}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Thời gian:</td>
                        <td style="font-size: 13px; color: #18181b; text-align: right;">{{ .Time }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Liên hệ ngay: duongminhhoanginwork@gmail.com
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 🔟 Identity Linked (Liên kết tài khoản)

**Subject:** `Tài khoản mới đã được liên kết - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tài khoản đã liên kết</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; border-radius: 50%; width: 64px; height: 64px;">
                      <tr>
                        <td align="center" style="font-size: 28px; color: #16a34a;">🔗</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Tài khoản đã liên kết</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Một phương thức đăng nhập mới đã được liên kết với tài khoản <strong>Hồi Nét</strong> của bạn.
              </p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #dcfce7; border-radius: 8px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 16px;">
                    <table border="0" cellpadding="4" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Nhà cung cấp:</td>
                        <td style="font-size: 13px; color: #16a34a; font-weight: 600; text-align: right;">{{ .Provider }}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Thời gian:</td>
                        <td style="font-size: 13px; color: #18181b; text-align: right;">{{ .Time }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Benefits -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6366f1;">Lợi ích:</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">✓ Đăng nhập nhanh 1 click</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">✓ Không cần nhớ mật khẩu</p>
                    <p style="margin: 0; font-size: 13px; color: #52525b;">✓ Bảo mật cao hơn</p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Đổi mật khẩu ngay và liên hệ hỗ trợ.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 1️⃣1️⃣ Identity Unlinked (Huỷ liên kết tài khoản)

**Subject:** `Tài khoản đã được huỷ liên kết - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tài khoản đã huỷ liên kết</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 50%; width: 64px; height: 64px;">
                      <tr>
                        <td align="center" style="font-size: 28px; color: #d97706;">🔓</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">Huỷ liên kết tài khoản</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Một phương thức đăng nhập đã được huỷ liên kết khỏi tài khoản <strong>Hồi Nét</strong> của bạn.
              </p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 24px; border: 1px solid #fde68a;">
                <tr>
                  <td style="padding: 16px;">
                    <table border="0" cellpadding="4" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Nhà cung cấp đã huỷ:</td>
                        <td style="font-size: 13px; color: #d97706; font-weight: 600; text-align: right;">{{ .Provider }}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Thời gian:</td>
                        <td style="font-size: 13px; color: #18181b; text-align: right;">{{ .Time }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Notice -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      <strong>⚠️ Lưu ý:</strong> Đảm bảo bạn vẫn còn ít nhất một phương thức đăng nhập khác.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>🚨 Không phải bạn?</strong><br>
                      Đổi mật khẩu ngay và liên hệ hỗ trợ.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 1️⃣2️⃣ MFA Method Added (Thêm xác thực 2 lớp)

**Subject:** `Xác thực 2 lớp đã được kích hoạt - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MFA đã kích hoạt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Success Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; border-radius: 50%; width: 80px; height: 80px;">
                      <tr>
                        <td align="center" style="font-size: 36px; color: #16a34a;">🛡️</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">🎉 Xác thực 2 lớp đã kích hoạt!</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Tuyệt vời! Tài khoản <strong>Hồi Nét</strong> của bạn giờ đây an toàn hơn bao giờ hết!
              </p>
              
              <!-- Success Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #dcfce7; border-radius: 8px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 16px; color: #16a34a; font-weight: 600;">✅ Bảo mật tăng cường!</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">Phương thức: <strong>{{ .MFAType }}</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #71717a;">Kích hoạt lúc: {{ .Time }}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Benefits -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6366f1;">🔐 Lợi ích:</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">✓ Chặn 99.9% tấn công tài khoản</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">✓ Bảo vệ ngay cả khi mật khẩu bị lộ</p>
                    <p style="margin: 0; font-size: 13px; color: #52525b;">✓ Nhận thông báo khi có đăng nhập lạ</p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>⚠️ Không phải bạn?</strong><br>
                      Đổi mật khẩu ngay và liên hệ hỗ trợ.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## 1️⃣3️⃣ MFA Method Removed (Xoá xác thực 2 lớp)

**Subject:** `Xác thực 2 lớp đã bị xoá - Hồi Nét`

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MFA đã bị xoá</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://jfnexrrdygcxgizzpyxc.supabase.co/storage/v1/object/public/gmail/HoiNetLogo.png" alt="Hồi Nét Logo" style="width: 56px; height: 56px; border-radius: 14px;">
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 22px; font-weight: 700; color: #18181b;">Hồi Nét</p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Thông báo bảo mật</p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="border-top: 1px solid #e4e4e7;"></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Warning Icon -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 50%; width: 80px; height: 80px;">
                      <tr>
                        <td align="center" style="font-size: 36px; color: #dc2626;">⚠️</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">⚠️ Xác thực 2 lớp đã bị xoá</h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #52525b; text-align: center;">
                Xác thực 2 lớp đã bị xoá khỏi tài khoản <strong>Hồi Nét</strong>. Tài khoản của bạn hiện chỉ được bảo vệ bằng mật khẩu.
              </p>
              
              <!-- Warning Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px; margin-bottom: 24px; border: 1px solid #fecaca;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 16px; color: #dc2626; font-weight: 600;">🔓 Bảo mật giảm!</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #52525b;">Phương thức đã xoá: <strong>{{ .MFAType }}</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #71717a;">Thời gian: {{ .Time }}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Recommendation -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      <strong>💡 Khuyến nghị:</strong><br>
                      Bật lại xác thực 2 lớp để bảo vệ tài khoản tốt hơn.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Critical Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b;">
                      <strong>🚨 CẢNH BÁO:</strong><br>
                      Nếu không phải bạn, tài khoản có thể đã bị xâm nhập!<br>
                      1. Đổi mật khẩu ngay<br>
                      2. Bật lại xác thực 2 lớp<br>
                      3. Liên hệ: duongminhhoanginwork@gmail.com
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #52525b; text-align: center;">Xin cảm ơn bạn,<br>Hồi Nét Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #71717a; text-align: center;">
                Hỗ trợ: <a href="mailto:duongminhhoanginwork@gmail.com" style="color: #6366f1; text-decoration: none;">duongminhhoanginwork@gmail.com</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2025 Hồi Nét. Việt Nam.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                <a href="#" style="color: #6366f1; text-decoration: none;">Chính sách Quyền riêng tư</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Liên hệ với chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Đọc blog của chúng tôi</a> • <a href="#" style="color: #6366f1; text-decoration: none;">Tham gia Cộng đồng Hồi Nét</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                Facebook   TikTok   Website
              </p>
              
              <!-- Contact Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
                <tr>
                  <td style="text-align: center;">
                    <table border="0" cellpadding="4" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Email: </td>
                        <td style="font-size: 12px; color: #52525b;">duongminhhoanginwork@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Hotline: </td>
                        <td style="font-size: 12px; color: #52525b;">039 449 7949</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Trưởng dự án: </td>
                        <td style="font-size: 12px; color: #52525b;">Dương Minh Hoàng</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #71717a; font-weight: 600;">Giảng Viên Hướng Dẫn: </td>
                        <td style="font-size: 12px; color: #52525b;">Nguyễn Thị Phượng</td>
                      </tr>
                    </table>
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

## ⚙️ Cấu hình Supabase

### Email Templates
1. **Authentication** → **Email Templates**
2. Chọn từng loại template
3. Paste HTML tương ứng
4. Cập nhật Subject

### Auth Hooks (Notifications)
1. **Authentication** → **Hooks**
2. Bật các notification hooks cần thiết
3. Cấu hình gửi email khi có thay đổi bảo mật

### SMTP Settings (Khuyến nghị)
1. **Project Settings** → **Authentication** → **SMTP Settings**
2. Bật **Enable Custom SMTP**
3. Cấu hình:
   - **Sender email**: duongminhhoanginwork@gmail.com
   - **Sender name**: Hồi Nét

---

## 🔧 Supabase Variables

| Variable | Mô tả |
|----------|-------|
| `{{ .ConfirmationURL }}` | Link xác nhận |
| `{{ .SiteURL }}` | URL website |
| `{{ .Email }}` | Email người dùng |
| `{{ .Token }}` | Token/OTP |
| `{{ .TokenHash }}` | Token hash |
| `{{ .Time }}` | Thời gian thực hiện |
| `{{ .Provider }}` | Nhà cung cấp OAuth |
| `{{ .Phone }}` | Số điện thoại |
| `{{ .OldEmail }}` | Email cũ |
| `{{ .NewEmail }}` | Email mới |
| `{{ .MFAType }}` | Loại MFA (TOTP, SMS) |

---

## ✅ Checklist

- [ ] Copy HTML vào Supabase Email Templates (1-5)
- [ ] Cập nhật Subject cho mỗi template
- [ ] Cấu hình Auth Hooks cho notifications (7-13)
- [ ] Test gửi email
- [ ] Kiểm tra trên mobile
- [ ] Cấu hình SMTP (tùy chọn)

---

## 📞 Liên hệ

| | |
|---|---|
| **Email** | duongminhhoanginwork@gmail.com |
| **Hotline** | 039 449 7949 |
| **Trưởng dự án** | Dương Minh Hoàng |
| **Giảng Viên Hướng Dẫn** | Nguyễn Thị Phượng |
