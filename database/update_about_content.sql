-- Cập nhật lại nội dung cho about sections với nội dung chất lượng hơn

-- Xóa dữ liệu cũ
TRUNCATE TABLE about_sections CASCADE;

-- Thêm nội dung mới chất lượng cao
INSERT INTO about_sections (title, subtitle, description, image_url, image_position, display_order, is_active) VALUES

-- 1. Sứ Mệnh
('Sứ Mệnh Của Chúng Tôi',
'Bảo tồn ký ức, kết nối thế hệ',
'Chúng tôi tin rằng mỗi bức ảnh cũ đều chứa đựng một câu chuyện quý giá - những khoảnh khắc đáng nhớ, những kỷ niệm gia đình, và di sản văn hóa cần được lưu giữ. Sứ mệnh của chúng tôi là sử dụng công nghệ AI tiên tiến nhất để khôi phục những bức ảnh đã bị thời gian làm phai màu, giúp các thế hệ hôm nay và tương lai có thể kết nối với quá khứ một cách sống động nhất.

Với đội ngũ chuyên gia công nghệ và nghệ sĩ khôi phục ảnh, chúng tôi cam kết mang đến dịch vụ chất lượng cao nhất, biến những bức ảnh cũ kỹ thành những tác phẩm nghệ thuật đẹp mắt, giữ nguyên giá trị cảm xúc và lịch sử của chúng.',
'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
'right',
1,
true),

-- 2. Tầm Nhìn
('Tầm Nhìn Phát Triển',
'Dẫn đầu công nghệ khôi phục ảnh AI tại Việt Nam',
'Chúng tôi hướng tới việc trở thành nền tảng khôi phục ảnh AI hàng đầu tại Việt Nam và khu vực Đông Nam Á, được tin tưởng bởi hàng triệu gia đình trong việc bảo tồn ký ức của họ.

Không chỉ dừng lại ở việc khôi phục ảnh, chúng tôi muốn xây dựng một hệ sinh thái hoàn chỉnh giúp mọi người lưu trữ, quản lý và chia sẻ những khoảnh khắc quý giá của gia đình mình. Chúng tôi đầu tư không ngừng vào nghiên cứu và phát triển công nghệ AI, machine learning và computer vision để mang đến những giải pháp tốt nhất.

Tầm nhìn của chúng tôi là tạo ra một thế giới nơi không có bức ảnh nào bị lãng quên, không có ký ức nào bị mai một bởi thời gian.',
'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
'left',
2,
true),

-- 3. Giá Trị Cốt Lõi
('Giá Trị Cốt Lõi',
'Những nguyên tắc định hướng mọi hoạt động của chúng tôi',
'**Chất lượng là ưu tiên hàng đầu** - Mỗi bức ảnh được khôi phục đều trải qua quy trình kiểm tra nghiêm ngặt để đảm bảo chất lượng tốt nhất.

**Đổi mới không ngừng** - Chúng tôi luôn theo đuổi những công nghệ mới nhất, cải tiến thuật toán AI để mang đến kết quả vượt trội.

**Khách hàng là trung tâm** - Mọi quyết định của chúng tôi đều đặt lợi ích và trải nghiệm của khách hàng lên hàng đầu.

**Minh bạch và tin cậy** - Chúng tôi cam kết bảo mật thông tin, minh bạch về quy trình và giá cả, tạo dựng niềm tin lâu dài.

**Tận tâm với sản phẩm** - Chúng tôi đối xử với mỗi bức ảnh như thể đó là kỷ niệm của chính gia đình mình, dành trọn tâm huyết cho từng chi tiết nhỏ nhất.',
'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
'right',
3,
true),

-- 4. Công Nghệ
('Công Nghệ Tiên Tiến',
'AI và Machine Learning thế hệ mới',
'Chúng tôi sử dụng các mô hình AI state-of-the-art như Generative Adversarial Networks (GANs), Deep Learning và Computer Vision để phân tích và khôi phục ảnh với độ chính xác cao.

Hệ thống của chúng tôi được huấn luyện trên hàng triệu bức ảnh, cho phép tự động:
• Loại bỏ nhiễu và vết xước
• Phục hồi màu sắc tự nhiên
• Tăng độ nét và chi tiết
• Khôi phục khuôn mặt với độ chính xác cao
• Upscale ảnh lên độ phân giải cao

Tất cả được thực hiện tự động trong vài phút, mang lại kết quả chuyên nghiệp mà trước đây phải mất hàng giờ xử lý thủ công.',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
'left',
4,
true);
