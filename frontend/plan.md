# DIY Shop — Kế Hoạch Thiết Kế Giao Diện Toàn Bộ

> Dựa trên design direction đã có, reference UI ArtisanWorkshop, và các token đã định nghĩa.  
> Ngôn ngữ mặc định: Tiếng Việt (Storefront) / English (Seller Dashboard)

---

## 0. Nền Tảng Thiết Kế (Design Foundation)

### 0.1 Token Màu Sắc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--color-brand` | `#006241` | Logo, accent chính |
| `--color-action` | `#00754a` | CTA button, link active |
| `--color-forest` | `#1e3932` | Feature zone nền, heading nổi bật |
| `--color-forest-soft` | `#2b5148` | Hover state trên nền tối |
| `--color-mint` | `#d4e9e2` | Badge, tag, highlight nhẹ |
| `--color-canvas` | `#f2f0eb` | Nền trang chính |
| `--color-ceramic` | `#edebe9` | Nền utility, sidebar, input |
| `--color-surface` | `#ffffff` | Card, modal, dropdown |
| `--color-text` | `rgba(0,0,0,0.87)` | Body text chính |
| `--color-text-muted` | `rgba(0,0,0,0.58)` | Label phụ, placeholder |
| `--color-danger` | `#c82014` | Lỗi, cảnh báo, hủy |
| `--color-gold` | `#cba258` | **Chỉ dùng cho trạng thái đặc biệt/lễ nghi** |

### 0.2 Typography

- **Font stack**: `Manrope`, `Helvetica Neue`, Helvetica, Arial, sans-serif
- **Tracking**: `-0.01em`
- **Line height heading**: `1.2`
- **Line height body**: `1.5`
- Body text KHÔNG dùng pure black trên nền sáng → dùng `--color-text`

| Role | Weight | Size (desktop) | Size (mobile) |
|---|---|---|---|
| Display / Hero | 700–800 | 40–48px | 28–32px |
| H1 | 700 | 32px | 24px |
| H2 | 600 | 24px | 20px |
| H3 | 600 | 18px | 16px |
| Body | 400 | 15–16px | 14–15px |
| Label / Caption | 500 | 12–13px | 12px |
| Price | 700 | 16–18px | 15px |

### 0.3 Component Chuẩn

- **Button Primary**: pill (`border-radius: 50px`), `background: --color-action`, white text, `scale(0.95)` khi click, transition 120ms
- **Button Secondary**: pill, border `--color-action`, text `--color-action`, nền trong suốt
- **Button Ghost**: pill, nền `--color-ceramic`, text `--color-text`
- **Card**: `background: white`, `border-radius: 12px`, shadow `--shadow-card`
- **Input**: label nổi phía trên, focus ring `2px solid --color-action`, không dùng placeholder-only label
- **Badge / Tag**: `background: --color-mint`, text `--color-forest`, `border-radius: 50px`, padding `4px 10px`

### 0.4 Grid & Spacing

- Outer gutter desktop: `24–32px`
- Outer gutter mobile: `16px`
- Column gap card grid: `16px`
- Section padding desktop: `64–80px` top/bottom
- Section padding mobile: `40px` top/bottom
- Catalog desktop: 4 cột → 2 cột tablet → 1 cột mobile

---

## 1. STOREFRONT — Phía Khách Hàng

---

### 1.1 Trang Chủ (Homepage)

#### Mục đích
Tạo ấn tượng đầu tiên, dẫn khách vào danh mục và sản phẩm nổi bật.

#### Cấu trúc

**A. Navigation Bar (Sticky)**
- Trái: Logo "DIY Shop" (text hoặc SVG mark nhỏ)
- Giữa: Danh mục (Làm mộc / Đan lát / Vẽ tranh / Gốm sứ / …)
- Phải: Icon giỏ hàng (với badge số lượng), icon tài khoản (nếu có), toggle ngôn ngữ VI | EN
- Nền: `--color-surface`, shadow `--shadow-navigation` khi scroll
- Mobile: hamburger menu, logo căn giữa, icon giỏ hàng bên phải

**B. Hero Section**
- Ảnh sản phẩm/workshop thật từ API làm nền (không fake screenshot)
- Overlay nhẹ `rgba(30,57,50,0.45)` để text đọc được
- Headline lớn (tiếng Việt mặc định): ví dụ "Tự tay tạo nên kiệt tác của riêng bạn"
- Subheadline 1 dòng mô tả shop
- CTA button Primary: "Khám phá ngay" / "Explore now"
- Layout: text trái, ảnh phủ toàn phần bên phải hoặc full-width với text overlay

**C. Danh Mục Nổi Bật (Category Shelf)**
- Grid 4 cột desktop / 2 cột mobile
- Mỗi ô: icon hoặc ảnh nhỏ + tên danh mục
- Card nền `--color-surface`, radius `12px`, shadow nhẹ
- Hover: nhẹ scale 1.02, shadow đậm hơn chút

**D. Sản Phẩm Nổi Bật (Featured Products)**
- Tiêu đề section: "Sản phẩm nổi bật" + link "Xem tất cả" căn phải
- Grid 4 cột desktop / 2 cột mobile / 1 cột mobile nhỏ
- Mỗi Product Card:
  - Ảnh sản phẩm (tỉ lệ 4:3 hoặc 1:1, `object-fit: cover`)
  - Tên sản phẩm (H3, bold)
  - Mô tả phụ ngắn (1 dòng, muted)
  - Giá (bold, `--color-text`)
  - Nút "+" tròn góc phải dưới → thêm vào giỏ hàng nhanh
- Không có badge giảm giá ở release đầu trừ khi API trả về

**E. Feature / Inspiration Zone**
- Nền `--color-forest`
- Text màu trắng
- Tiêu đề: "Cảm hứng sáng tạo"
- Đoạn trích ngắn + nút secondary (pill, border trắng)
- Ảnh tròn bên phải (circle crop, ảnh workshop thật)
- Không dùng gradient làm decoration

**F. Footer**
- Nền `--color-canvas`
- Trái: Logo + copyright
- Phải: 2 cột link: Về chúng tôi, Vận chuyển, Đổi trả, Chính sách bảo mật
- Đơn giản, không footer phức tạp ở release đầu

---

### 1.2 Trang Danh Mục / Catalog (Category / All Products Page)

#### Mục đích
Khách duyệt và lọc sản phẩm theo danh mục.

#### Cấu trúc

**A. Header của trang**
- Breadcrumb: Trang chủ > Làm mộc
- Tên danh mục lớn (H1)
- Số lượng sản phẩm: "24 sản phẩm"

**B. Layout chính**
- Desktop: sidebar lọc 240px bên trái + grid sản phẩm bên phải
- Mobile: filter ẩn vào drawer/bottom sheet, kéo lên khi cần

**C. Sidebar Lọc (Filter)**
- Nền `--color-ceramic`
- Nhóm lọc:
  - Danh mục (checkbox list)
  - Khoảng giá (range input hoặc 2 input số)
  - Sắp xếp: Mới nhất / Giá tăng / Giá giảm / Nổi bật
- Nút "Áp dụng" (Primary pill) và "Xoá bộ lọc" (Ghost pill)

**D. Grid Sản Phẩm**
- 3 cột desktop / 2 cột tablet / 1 cột mobile
- Product Card như mô tả ở 1.1.D
- Trạng thái hết hàng: card mờ 60%, badge "Hết hàng" overlay

**E. Phân Trang (Pagination)**
- Số trang hoặc "Tải thêm" button (Ghost pill, căn giữa)

---

### 1.3 Trang Chi Tiết Sản Phẩm (Product Detail Page)

#### Mục đích
Cung cấp đủ thông tin để khách quyết định mua.

#### Cấu trúc

**A. Gallery Ảnh**
- Desktop: ảnh lớn bên trái + thumbnail dọc bên dưới (hoặc ngang)
- Mobile: ảnh full-width, vuốt ngang giữa các ảnh
- Ảnh thật từ API, không placeholder

**B. Thông Tin Sản Phẩm (bên phải desktop)**
- Breadcrumb
- Tên sản phẩm (H1)
- Giá (lớn, bold)
- Mô tả ngắn (2–3 dòng, muted)
- Số lượng tồn kho nếu sắp hết (ví dụ: "Còn 3 sản phẩm")
- Bộ chọn số lượng: nút `-` | input số | nút `+`
- CTA: "Thêm vào giỏ" (Primary pill, full-width mobile)
- Thông tin giao hàng ngắn (icon + text): "Giao hàng toàn quốc", "Thanh toán khi nhận hàng"

**C. Mô Tả Chi Tiết (tab hoặc accordion)**
- Tab 1: Mô tả
- Tab 2: Thông số (nếu có)
- Tab 3: Hướng dẫn sử dụng (nếu có)
- Nền `--color-surface`, padding rộng

**D. Sản Phẩm Liên Quan**
- Tiêu đề: "Có thể bạn thích"
- Horizontal scroll mobile / grid 4 cột desktop

---

### 1.4 Giỏ Hàng (Cart)

#### Mục đích
Khách xem lại, điều chỉnh đơn trước khi thanh toán.

#### Cấu trúc

**Phiên bản desktop**: trang riêng  
**Phiên bản mobile**: slide-over drawer từ phải hoặc trang riêng

**A. Danh Sách Sản Phẩm**
- Mỗi dòng: ảnh nhỏ (60x60) | tên + mô tả ngắn | bộ chọn số lượng | giá | nút xoá (icon ×)
- Cập nhật giá realtime khi đổi số lượng
- Trạng thái hết hàng: highlight đỏ, vô hiệu hóa checkout

**B. Tóm Tắt Đơn Hàng (Order Summary)**
- Subtotal
- Phí vận chuyển (hiển thị "Sẽ tính khi thanh toán" nếu chưa có địa chỉ)
- Tổng cộng (lớn, bold)
- CTA: "Tiến hành thanh toán" (Primary pill, full-width)

**C. Trạng Thái Giỏ Trống**
- Minh họa nhỏ hoặc icon
- Text: "Giỏ hàng của bạn đang trống."
- CTA: "Khám phá sản phẩm" → về catalog

---

### 1.5 Trang Thanh Toán (Checkout)

#### Mục đích
Thu thập thông tin giao hàng và phương thức thanh toán, xác nhận đơn.

#### Cấu trúc

**Layout**: 2 cột desktop (form trái, order summary phải) / 1 cột mobile (summary ẩn gọn ở trên)

**Bước 1: Thông Tin Giao Hàng**
- Họ và tên (required)
- Số điện thoại (required)
- Địa chỉ (required): đường/số nhà
- Tỉnh/Thành phố (dropdown)
- Quận/Huyện (dropdown, phụ thuộc tỉnh)
- Phường/Xã (dropdown, phụ thuộc quận)
- Ghi chú cho người giao hàng (textarea, optional)

Tất cả input: label nổi phía trên, focus ring xanh, validation inline (hiện lỗi dưới field ngay khi blur).

**Bước 2: Phương Thức Thanh Toán**
- Radio card lớn, dễ tap:
  - **Thanh toán khi nhận hàng (COD)**: icon tiền mặt + mô tả ngắn
  - **Chuyển khoản ngân hàng**: icon ngân hàng + mô tả ngắn
- Khi chọn Chuyển khoản:
  - Hiện thông tin tài khoản ngân hàng của shop
  - Hiện VietQR code (ảnh từ API)
  - Hướng dẫn: "Chuyển khoản với nội dung: [Tên + SĐT]. Đơn sẽ được xác nhận sau khi nhận thanh toán."

**Order Summary (cột phải / collapse mobile)**
- Danh sách sản phẩm (thumbnail nhỏ + tên + giá)
- Subtotal, phí ship, tổng

**CTA**: "Đặt hàng" (Primary pill, full-width mobile)

**Validation**:
- Không submit nếu thiếu field required
- Lỗi hiện inline, màu `--color-danger`

---

### 1.6 Trang Xác Nhận Đơn Hàng (Order Confirmation)

#### Mục đích
Xác nhận đơn đã đặt thành công, cung cấp mã đơn để tra cứu.

#### Cấu trúc

- Icon check lớn (màu `--color-action`)
- Tiêu đề: "Đặt hàng thành công!"
- **Order Code** hiển thị to, bold, có nút copy
- Thông tin tóm tắt: tên người nhận, địa chỉ, phương thức thanh toán
- Danh sách sản phẩm đã đặt (compact)
- Tổng tiền
- Nếu chọn chuyển khoản: hiện lại VietQR và hướng dẫn
- CTA: "Tra cứu đơn hàng" | "Tiếp tục mua sắm"
- Lưu ý: "Lưu mã đơn hàng để tra cứu sau."

---

### 1.7 Trang Tra Cứu Đơn Hàng (Order Lookup)

#### Mục đích
Khách không có tài khoản vẫn tra cứu được đơn hàng qua Order Code.

#### Cấu trúc

**Form tra cứu**
- Label: "Nhập mã đơn hàng"
- Input text (ví dụ: DIY-20240728-XXXX)
- CTA: "Tra cứu" (Primary pill)

**Kết quả tra cứu**
- Order Code
- Ngày đặt
- Trạng thái đơn hàng: pill badge có màu theo status
  - `PENDING` → vàng nhạt
  - `CONFIRMED` → mint/xanh nhạt
  - `SHIPPING` → xanh dương nhạt
  - `DELIVERED` → xanh lá `--color-mint`
  - `CANCELLED` → đỏ nhạt
- Trạng thái thanh toán:
  - `UNPAID` → cam
  - `PAID` → xanh
  - `FAILED` → đỏ
- Danh sách sản phẩm + tổng tiền
- Thông tin giao hàng (địa chỉ, SĐT che một phần)
- Nếu đang chờ thanh toán: hiện lại VietQR

**Trạng thái không tìm thấy**
- Text: "Không tìm thấy đơn hàng với mã này. Kiểm tra lại mã hoặc liên hệ shop."

---

## 2. SELLER DASHBOARD — Phía Người Bán

> Ngôn ngữ mặc định: English  
> Dùng layout denser hơn storefront, vẫn reuse core tokens

---

### 2.1 Layout Tổng Thể Dashboard

**Desktop**: Sidebar cố định bên trái (240px) + content area chiếm phần còn lại  
**Mobile/Tablet**: Sidebar collapse thành bottom tab bar hoặc hamburger

**Sidebar items**:
- 📊 Overview
- 📦 Products
- 🗂 Categories
- 🛒 Orders
- ⚙️ Settings
- (logo + shop name ở đỉnh sidebar)

**Top Bar**:
- Tên trang hiện tại (H2)
- Avatar / tên seller góc phải
- Notification bell (nếu có)

**Nền sidebar**: `--color-forest`  
**Text sidebar**: white (active item: `--color-mint` highlight)  
**Nền content**: `--color-canvas`

---

### 2.2 Overview (Dashboard Home)

#### Mục đích
Tóm tắt hoạt động shop hôm nay / 7 ngày / 30 ngày.

#### Cấu trúc

**A. Stat Cards (hàng ngang, 4 thẻ)**
- Đơn hàng mới (hôm nay)
- Doanh thu (7 ngày)
- Sản phẩm đang bán
- Đơn chờ xử lý
- Mỗi thẻ: số to + label + mũi tên so với kỳ trước

**B. Đơn Hàng Cần Xử Lý**
- Table nhỏ: Order Code | Khách | Tổng | Trạng thái | Nút "Xem"
- Chỉ hiện đơn `PENDING` và `CONFIRMED`
- Link "Xem tất cả đơn hàng"

**C. Sản Phẩm Sắp Hết Hàng**
- List: ảnh nhỏ + tên + số lượng còn lại
- Chỉ hiện sản phẩm có inventory ≤ ngưỡng cảnh báo (ví dụ ≤ 5)
- Link "Cập nhật kho"

---

### 2.3 Quản Lý Sản Phẩm (Products)

#### Mục đích
Xem, thêm, sửa, ẩn/hiện, xoá sản phẩm.

#### Cấu trúc

**A. Toolbar**
- Input tìm kiếm sản phẩm (bên trái)
- Filter: Danh mục | Trạng thái (Đang bán / Ẩn / Hết hàng)
- Nút "Add Product" (Primary pill, bên phải)

**B. Bảng Sản Phẩm**

| Cột | Nội dung |
|---|---|
| Ảnh | Thumbnail 48x48 |
| Tên sản phẩm | Tên (VI) + tên (EN) dưới nhỏ hơn |
| Danh mục | Badge |
| Giá | Formatted VND |
| Tồn kho | Số, màu đỏ nếu ≤ 5 |
| Trạng thái | Badge: Active / Hidden |
| Thao tác | Edit (icon) / Hide/Show (toggle) / Delete (icon đỏ) |

- Row click → mở edit
- Xác nhận trước khi xoá: modal confirm đơn giản
- Pagination hoặc infinite scroll

**C. Form Thêm / Sửa Sản Phẩm**
- Trang riêng hoặc side panel (slide từ phải)
- **Thông tin cơ bản**:
  - Tên sản phẩm (VI) — required
  - Tên sản phẩm (EN) — optional
  - Danh mục — dropdown
  - Giá (VND) — number input
  - Inventory Quantity — number input
  - Trạng thái — toggle: Đang bán / Ẩn
- **Mô tả**:
  - Mô tả ngắn (VI) — textarea, max ~200 ký tự
  - Mô tả ngắn (EN) — textarea
  - Mô tả chi tiết (VI) — rich text hoặc textarea dài
  - Mô tả chi tiết (EN) — rich text hoặc textarea dài
- **Ảnh sản phẩm**:
  - Upload tối đa (ví dụ 8 ảnh)
  - Drag & drop hoặc click-to-select
  - Preview grid, kéo để sắp xếp thứ tự
  - Nút xoá từng ảnh
- **Actions**: "Save" (Primary) | "Cancel" (Ghost) | "Delete Product" (danger link, góc dưới trái)

---

### 2.4 Quản Lý Danh Mục (Categories)

#### Mục đích
Tạo, sửa, sắp xếp, xoá danh mục sản phẩm.

#### Cấu trúc

**A. Danh Sách Danh Mục**
- Card list hoặc table đơn giản
- Mỗi danh mục: icon (optional) | Tên (VI) | Tên (EN) | Số sản phẩm | Edit | Delete

**B. Form Thêm/Sửa Danh Mục**
- Tên danh mục (VI) — required
- Tên danh mục (EN) — optional
- Icon hoặc ảnh đại diện (upload, optional)
- Slug (tự sinh từ tên, cho phép sửa)
- Actions: Save | Cancel

**Lưu ý**: Không cho xoá danh mục đang có sản phẩm. Hiện warning: "Danh mục này có X sản phẩm. Chuyển sản phẩm sang danh mục khác trước khi xoá."

---

### 2.5 Quản Lý Đơn Hàng (Orders)

#### Mục đích
Xem, lọc, cập nhật trạng thái, tra cứu đơn hàng.

#### Cấu trúc

**A. Toolbar**
- Search theo Order Code hoặc tên khách
- Filter tabs: Tất cả | Chờ xác nhận | Đang giao | Đã giao | Đã huỷ
- Filter phụ: Trạng thái thanh toán (Chưa thanh toán / Đã thanh toán)
- Date range picker

**B. Bảng Đơn Hàng**

| Cột | Nội dung |
|---|---|
| Order Code | Bold, monospace |
| Ngày đặt | dd/mm/yyyy hh:mm |
| Khách hàng | Tên + SĐT (che bớt) |
| Tổng tiền | VND |
| Phương thức TT | COD / Bank Transfer |
| Order Status | Pill badge có màu |
| Payment Status | Pill badge có màu |
| Thao tác | Nút "Xem chi tiết" |

**C. Trang Chi Tiết Đơn Hàng**
- Order Code + ngày đặt
- **Thông tin khách hàng**: tên, SĐT, địa chỉ giao hàng, ghi chú
- **Danh sách sản phẩm**: thumbnail + tên + SL + đơn giá + thành tiền
- **Tóm tắt tài chính**: subtotal, phí ship, tổng
- **Phương thức thanh toán** + Payment Status
- **Timeline trạng thái đơn** (dạng stepper):
  - PENDING → CONFIRMED → SHIPPING → DELIVERED
  - Hoặc → CANCELLED
- **Hành động cập nhật trạng thái**:
  - Nút "Xác nhận đơn" (khi PENDING)
  - Nút "Đánh dấu đang giao" (khi CONFIRMED)
  - Nút "Đánh dấu đã giao" (khi SHIPPING)
  - Nút "Huỷ đơn" (khi PENDING hoặc CONFIRMED) → yêu cầu nhập lý do
- **Cập nhật Payment Status**: dropdown hoặc nút toggle (UNPAID → PAID / FAILED)
- Nút "In đơn hàng" (optional, ghost)

---

### 2.6 Cài Đặt Shop (Settings)

#### Mục đích
Seller cấu hình thông tin shop, thanh toán, vận chuyển.

#### Cấu trúc (dạng tab hoặc section cuộn)

**Tab 1: Thông Tin Shop**
- Tên shop
- Mô tả ngắn (VI + EN)
- Logo (upload)
- Email liên hệ
- SĐT liên hệ

**Tab 2: Thông Tin Thanh Toán**
- Tên ngân hàng
- Số tài khoản
- Tên chủ tài khoản
- VietQR config (hoặc upload ảnh QR tĩnh)

**Tab 3: Vận Chuyển**
- Phí vận chuyển mặc định (VND)
- Miễn phí ship từ giá trị đơn hàng X (optional)
- Ghi chú vận chuyển (VI + EN)

**Tab 4: Tài Khoản Seller**
- Email đăng nhập
- Đổi mật khẩu: mật khẩu hiện tại | mật khẩu mới | xác nhận mật khẩu mới

Tất cả tab đều có nút "Save changes" (Primary pill) ở cuối.

---

## 3. SHARED PATTERNS (Dùng Chung Cả 2 Phía)

### 3.1 Loading States
- Skeleton loader (dải xám animate) cho card, table row
- Không dùng spinner toàn trang nếu chỉ load một phần

### 3.2 Empty States
- Icon nhỏ + tiêu đề + mô tả ngắn + CTA
- Ví dụ: "Chưa có sản phẩm nào. [Thêm sản phẩm đầu tiên]"
- Ví dụ: "Không tìm thấy đơn hàng nào khớp với bộ lọc."

### 3.3 Error States
- Inline error dưới input: icon cảnh báo + text đỏ `--color-danger`
- Toast notification (góc phải trên, tự đóng sau 4s):
  - Success: nền mint nhạt, icon check xanh
  - Error: nền đỏ nhạt, icon X đỏ
  - Info: nền ceramic, icon info

### 3.4 Modal / Confirm Dialog
- Overlay mờ `rgba(0,0,0,0.4)`
- Card trắng, radius `12px`, shadow lớn hơn card thường
- Tiêu đề + mô tả ngắn + 2 nút: Cancel (Ghost) | Confirm (Primary hoặc Danger)
- Close khi click outside hoặc Escape

### 3.5 Responsive Breakpoints

| Breakpoint | Width | Layout thay đổi |
|---|---|---|
| Mobile | < 640px | 1 cột, gutter 16px, bottom nav |
| Tablet | 640–1024px | 2 cột, gutter 20px |
| Desktop | > 1024px | Layout đầy đủ, sidebar cố định |

### 3.6 Accessibility Checklist
- Tất cả interactive element có visible focus ring (`2px solid --color-action`, offset `2px`)
- Touch target tối thiểu `44x44px`
- `aria-label` cho icon-only button
- Color contrast ratio ≥ 4.5:1 cho text thường, ≥ 3:1 cho text lớn
- `prefers-reduced-motion`: tắt transition, dùng instant state change
- Storefront light-only (không theo OS dark mode ở release đầu)

---

## 4. THỨ TỰ TRIỂN KHAI ĐỀ XUẤT

| Giai đoạn | Trang / Tính năng | Độ ưu tiên |
|---|---|---|
| 1 | Homepage, Product Detail, Cart | 🔴 Cao nhất |
| 2 | Checkout, Order Confirmation | 🔴 Cao nhất |
| 3 | Order Lookup | 🟠 Cao |
| 4 | Catalog / Category Page | 🟠 Cao |
| 5 | Dashboard: Overview, Orders | 🟠 Cao |
| 6 | Dashboard: Products (list + form) | 🟠 Cao |
| 7 | Dashboard: Categories | 🟡 Trung bình |
| 8 | Dashboard: Settings | 🟡 Trung bình |
| 9 | Bilingual (EN) toàn bộ Storefront | 🟡 Trung bình |
| 10 | Polish: animation, skeleton, empty states | 🟢 Thấp |

---

*Tài liệu này là kế hoạch thiết kế sống — cập nhật khi product requirement thay đổi.*