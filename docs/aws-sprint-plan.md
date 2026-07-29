# AWS Sprint Plan (23/07 - 27/07)

Track tiến độ 5 ngày: AWS integration (RDS, S3, Elastic Beanstalk, CloudWatch, GitHub Actions) + Report (Proposal + Workshop lab).

Không cover trong file này: thông tin sinh viên, Worklog Tuần 1-12, Blog posts, Events participated, Self-evaluation, Sharing & Feedback (làm riêng).

## Quyết định đã chốt

- Workshop lab topic: **RDS migration & secure connectivity**
- Infra approach: ~~Terraform~~ -> **thực tế đang làm qua AWS Console thủ công** (VPC, SG, EC2, RDS đều tạo tay, không dùng Terraform). Mở: có viết lại thành Terraform sau để phục vụ report/"reproducible" không, hay giữ console + document từng bước cho Workshop lab (khuyến nghị vì đỡ tốn thời gian trong 5 ngày còn lại)
- VPC: 2 public + 2 private subnets, **NAT Gateway = None**, **S3 Gateway endpoint = có** (`diy-vpce-s3`, đã tạo xong)
- Subnet placement: RDS -> private subnets, **EC2 thuần `diyshop-app-server`** (không dùng Elastic Beanstalk) -> public subnet
- Compute: đã pivot từ Elastic Beanstalk sang **raw EC2** (instance `diyshop-app-server`, SG `EC2-WebApp-SG`) - cần cập nhật Day 2-3 vì không còn tự động hoá của EB (tự cài JDK, tự deploy jar, tự quản version)
- Mở (chưa chốt): seller API auth trước khi deploy public lên EB - cần quyết định trước Day 3
- Frontend hosting: **S3 + CloudFront** (đã chốt theo [ADR-0001](adr/0001-independent-react-frontend.md)), tách biệt hoàn toàn khỏi EC2/EB chạy backend. Không cần Node.js trên EC2 - build frontend ở local/GitHub Actions rồi upload static output lên S3.

---

## Day 1 - Thứ 5, 23/07: RDS + networking (đã đổi từ Terraform sang Console)

- [x] VPC `diy-vpc`: 2 public + 2 private subnet, NAT = None, S3 Gateway endpoint (`diy-vpce-s3`) - qua Console
- [x] Security Group cho RDS (`SG-RDSPostgreSQL`, inbound 5432 chỉ từ SG của EC2, không mở `0.0.0.0/0`) - qua Console
- [x] DB Subnet Group (`rds-subnet-group`, 2 private subnet, 2 AZ)
- [x] EC2 instance `diyshop-app-server` (Amazon Linux 2023, t3.micro, SG `EC2-WebApp-SG`, Auto-assign public IP = Enable, EBS encrypted)
- [x] Tạo RDS PostgreSQL instance (Sandbox template, Single-AZ, db.t3.micro/t4g.micro free tier, Public access = No, "Don't connect to EC2 compute resource")
- [x] **Siết outbound RDS SG**: đổi destination sang prefix list `pl-6ca54005` (`com.amazonaws.ap-southeast-2.s3`)
- [x] Không có SG dư thừa `rds-ec2-*`/`ec2-rds-*` (đã chọn "Don't connect to EC2 compute resource" khi tạo RDS)
- [x] Đợi RDS status = **Available**, ghi lại RDS endpoint (`diyshop-db-instance.cdcmqck2qzuj.ap-southeast-2.rds.amazonaws.com`)
- [x] SSH vào EC2 (qua MobaXterm), cài JDK 17 (`java-17-amazon-corretto`)
- [x] Build jar, copy lên EC2, set env var, chạy jar -> Flyway migrate thật lên RDS thành công (V1-V6, đủ bảng categories/products/product_images/orders/order_items)
- [x] Lưu lại các bước Console đã làm (ảnh + note cấu hình) - nguyên liệu cho Workshop lab Day 5, thay cho Terraform snippet
- [x] Chụp/lưu RDS Logs & Events (PostgreSQL log qua CloudWatch)
- [x] Đổi lại RDS master password (password cũ đã bị paste vào chat lúc debug)

**Verify:** RDS status Available; SSH vào EC2 chạy jar kết nối được RDS; `flyway_schema_history` trên RDS có đủ V1-V5. **=> Day 1 DONE.**

---

## Day 2 - Thứ 6, 24/07: S3 + IAM cho product images

- [x] ~~EB application + environment~~ -> đã làm bằng EC2 thuần ở Day 1, không cần bước này nữa
- [x] Tạo S3 bucket cho product images (`diyshop-s3-bucket`, Account Regional namespace, Block Public Access, SSE-S3)
- [x] IAM policy least-privilege (`diyshop-s3-product-images-policy`: `s3:PutObject`/`GetObject`/`DeleteObject` trên `products/*`) + IAM role (`diyshop-ec2-role`) gắn vào EC2 `diyshop-app-server`
- [x] Đổi `IMAGE_STORAGE_PROVIDER=s3` + `IMAGE_STORAGE_S3_BUCKET` + `AWS_REGION=ap-southeast-2`, test upload ảnh thật qua `POST /api/seller/products/{productId}/images` (kèm login + CSRF token) -> **201 Created**, presigned URL có `X-Amz-Security-Token` xác nhận dùng IAM Role đúng, không hardcode access key
- [x] Seller API auth: đã có sẵn trong code (`SecurityConfig.java` - form login + CSRF + `hasRole("SELLER")`), không cần làm thêm - đã tự phát hiện lúc debug lỗi 403
- [x] Kiểm tra Billing → Free Tier dashboard xem `db.t4g.micro` có thật sự nằm trong free-tier không (RDS đang là dòng chi phí cao nhất - $0.20). Nếu không, đổi RDS sang `db.t3.micro` cho các ngày còn lại

**Verify:** bucket S3 tạo xong; upload ảnh qua app (chạy trên EC2) ra bucket thật thành công, lấy được presigned URL.

---

## Day 3 - Thứ 7, 25/07: Chạy app ổn định trên EC2 + CloudWatch + GitHub Actions

- [x] Chạy app như systemd service trên EC2 (`diyshop.service`, `EnvironmentFile=/etc/diyshop/env` chmod 600, `Restart=on-failure`) - stable, không còn crash loop sau khi fix RDS bị Stop
- [x] Cài + cấu hình CloudWatch Agent trên EC2 (log group `/diyshop/app`), xác nhận log app thật (Flyway, Hikari, Started DiyShopApplication) xuất hiện trên CloudWatch Console
- [x] CloudWatch: log group `/diyshop/access` (Tomcat access log) + 3 Metric Filter (`common-metric` ERROR/WARN/FAILED trên `/diyshop/app`, `http-4xx-count`, `http-5xx-count` trên `/diyshop/access` dùng space-delimited pattern) + 3 Alarm tương ứng, gắn SNS topic `diyshop-alerts` gửi email - đã test thật (gọi 404 thật, xác nhận alarm chuyển `Insufficient data` -> `In alarm` -> SNS gửi thành công)
- [x] GitHub Actions workflow (`.github/workflows/deploy.yml`): push -> build+test (kèm Postgres service container cho CI) -> SCP jar lên EC2 -> restart systemd service
- [x] Push commit test -> pipeline chạy thành công end-to-end (run #2, 1m56s), verify trên EC2 service restart đúng + app hoạt động
- [x] Bundle FE (React, đã bỏ Supabase) vào `static/` của Spring Boot - deploy chung 1 jar, cùng origin, không cần CORS. GitHub Actions cập nhật tự build FE + BE mỗi lần push
- [x] Elastic IP gắn vào EC2 - IP cố định, không đổi khi Stop/Start
- [ ] ~~CloudFront~~ - **Huỷ, không làm** - bị chặn bởi rào cản account verification của AWS (phản hồi trong 24h, không kiểm soát được thời gian) - đã gửi AWS Support case, không chờ, ưu tiên Proposal/Workshop

**Verify:** `http://<Elastic-IP>:8081/` trả về FE React thật, gọi API sang chính EC2, kết nối RDS/S3 thật; Action chạy xanh và bản mới (cả FE+BE) tự lên EC2 sau khi push; log xuất hiện trên CloudWatch. **=> Day 3 DONE (trừ CloudFront, đã huỷ có chủ đích).**

---

## Day 4 - Chủ nhật, 26/07: Viết Proposal (EN + VI)

- [ ] Summary
- [ ] Problem definition (problem + solution)
- [ ] Solution Architecture: vẽ diagram (Customer -> EC2 (public subnet) -> RDS (private subnet)/S3, CloudWatch, GitHub Actions CI/CD), liệt kê service + lý do chọn, ghi chú IAM least-privilege + private subnet cho RDS
- [ ] Timeline (map theo tiến độ Day 1-3 thực tế + hướng mở rộng sau)
- [ ] Risks & Budget (giới hạn free-tier, chi phí sau free-tier, rủi ro, rollback)
- [ ] Viết bản tiếng Anh
- [ ] Viết bản tiếng Việt

**Verify:** đủ hết mục con Proposal theo TASK.md, có diagram, bản song ngữ, khớp kiến trúc thật đã triển khai.

---

## Day 5 - Thứ 2, 27/07: Workshop lab (Hugo, song ngữ) + rà soát cuối

- [ ] Setup Hugo site từ template `fcj-workshop-template`, cấu trúc content vi/en
- [ ] Viết Overview + Prerequisites (tài khoản AWS, region, IAM quyền cần thiết) cho lab "RDS migration & secure connectivity"
- [ ] Viết Lab step-by-step (dùng code trong `notes/` + screenshot từ Day 1), giải thích rõ VPC/subnet/security group
- [ ] **Test & validation** (theo đúng "Quy định về project" mục 4.3): Gửi request -> Xem log -> Check metric -> Kiểm thử lỗi (dùng lại lỗi "database does not exist" đã gặp thật) -> Kết quả mong đợi
- [ ] **Clean-up section** (bắt buộc riêng): hướng dẫn xoá RDS/EC2/S3 bucket/alarm/IAM role sau khi xong, tránh phát sinh chi phí
- [ ] **Reflection cá nhân** (mục "Đóng góp cá nhân"): tổng hợp lại các khó khăn thật đã gặp (nhầm region ap-southeast-1/2, lỗi CSRF/401/403 khi test API, sai ARN IAM, JDK version mismatch, chi phí db.t4g.micro...) + cách giải quyết + hướng phát triển tương lai (Auto Scaling, Cognito, Lambda auto-expire...)
- [ ] Đối chiếu với tiêu chí "Project kỹ thuật (Workshop)" trong PDF quy định (kiến trúc, lý do chọn service, IAM/least-privilege, end-to-end reproducible)
- [ ] `hugo server` chạy thử, kiểm tra 2 ngôn ngữ render đúng, ảnh/code snippet/link không lỗi

**Verify:** site build không lỗi; người chưa biết project có thể làm theo lab RDS từ đầu đến cuối chỉ dựa vào bài viết.
