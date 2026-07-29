# Hình thức và công cụ

Hình thức workshop website - build một static website để trình bày (e.g Hugo Template)
Cấu trúc mẫu: https://workshop-sample.awsfcaj.com/
Template Sample: https://github.com/thienluhoan/fcj-workshop-template
**Yêu cầu**:

1. Có đầy đủ 2 ngôn ngữ (vi/en) cho phần nội dung
2. Các thành phần bao gồm:
   - Hình ảnh minh họa
   - Sơ đồ kiến trúc
   - Code snippet và file đính kèm (nếu có)

# Nội dung bắt buộc của báo cáo

**Ngôn ngữ**: Tiếng Anh và Tiếng Việt
Các thành phần bắt buộc có:

1. Thông tin sinh viên: bao gồm
   - họ và tên, sđt, email, trường
   - chuyên ngành, công ty thực tập, vị trí thực tập, thời gian gian thực tập
2. Worklog:
   - thông kê công việc theo tuần: **Tuần 1 -> Tuần 12**
   - với mỗi tuần ghi mô tả: _<công việc - kết quả>_
   - format: làm một bảng bao gồm _<Day, Task, Start Date, Completion Date, Reference Material>_
3. Proposal:
   - tổng quan dự án - mục tiêu - vấn đề cần giải quyết
   - kiến trúc giải pháp
   - timeline
   - rủi ro, ngân sách (nếu có)
4. Blogs Post
   - Mỗi nhóm cần phải nghiên cứu hoặc chia sẻ về những gì mình học thành 3 bài blogs sau đó post
5. Events Participated: bao gồm
   - tên sự kiện - thời gian - địa điểm - vai trò
   - nội dung chính
   - hình ảnh + minh chứng tham gia
   - bài học rút ra / đóng góp cá nhân
6. Workshop: bao gồm
   - Overview + Prerequesite
   - Mô tả kiến trúc
   - Các bước thực hành
7. Self-evaluation
   - mỗi tiêu chí chọn **Tốt / Khá / Trung bình** và có nhận xét về _(1) kiến thức, (2) khả năng học hỏi, (3) tính chủ động, (4) kỷ luật, (5) giao tiếp, (6) teamwork, (7) giải quyết vấn đề, (8) đóng góp cho dự án_
8. Sharing & Feedback
   - Cảm nhận chương trình
   - Mức độ hài lòng
   - Điểm cần cải thiện
   - Có giới thiệu chương trình cho bạn bè không? Vì sao?

## Proposal

In this section, you need to summarize the contents of the workshop that you plan to conduct. Understanding as presenting the description of full project not just scope in MVP, including: - Summary - Problem definition: includes (1) problem, (2) solution, ... (some additional information if needs) - Solution Architecture: draw diagram for architecture and description, lists used AWS service - Timeline: need to show a timeline of project, milestones and implementation phases - Risks and Budget are similar to Project Management for Engineering course

## Blogs Post

List posted blogs on study group, includes full information of that blog and link to access

## Events Participated

In this section, you should list and describe in detail the events you have participated in during your internship or work experience.

Each event should be presented in the format Event 1, Event 2, Event 3…, along with the following details:

    - Event name
    - Date and time
    - Location (if applicable)
    - Your role in the event (attendee, event support, speaker, etc.)
    - A brief description of the event’s content and main activities
    - Outcomes or value gained (lessons learned, new skills, contribution to the team/project)
    - This listing helps demonstrate your actual participation as well as the soft skills and experience you have gained from each event.

## Workshop

Project nên:

Là use-case thực tế trên AWS:

Serverless application
Data pipeline
Monitoring system
IoT
…
Sử dụng ít nhất 3 dịch vụ AWS

# Yêu cầu đối với "Workshop" - Project

Project nên là use-case thực tế trên AWS và sử dụng ít nhất 3 dịch vụ AWS

Tiêu chí đánh giá để **nhận mộc thực tập**: - Hoàn thành project - Hoàn thành báo cáo - Thời gian thực tập ít nhất 3 tháng - Lên văn phòng đủ 10 buổi - Post đủ 3 bài blogs lên nhóm

Project cần thể hiện được: - Thiết kế kiến trúc: (1) sơ đồ kiến trúc, (2) dịch vụ sử dụng, (3) lý do lựa chọn dịch vụ - Triển khai end-to-end: (1) các bước chi tiết, (2) người khác có thể làm theo - Kiểm thử và đo lường: log, metric, alert - Tối ưu: (1) chi phí, (2) clean-up để tránh phát sinh chi phí, (3) bảo mật cơ bản

# Thang điểm mẫu cho Project

```
- Ý tưởng và mục tiêu (1 điểm)
- Kiến trúc và thiết kế kỹ thuật (2 điểm)
- Triển khai và lab step-by-step (2 điểm)
- Tài liệu workshop và trình bày (0.5 điểm)
- Đóng góp cá nhân (0.5 điểm)

TỔNG: 6 điểm
```

## Ý tưởng & mục tiêu

1. Bối cảnh và bái toán:
   - Hệ thống dùng để làm gì? --> mục tiêu của sản phẩm
   - Khách hàng là ai? --> đối tượng sử dụng
   - Giải quyết vấn đề gì? --> vấn đề đặt ra khi làm project
2. Mục tiêu cụ thể:
   - Output mong muốn
   - Tiêu chí đánh giá thành công
3. Phù hợp chương trình:
   - Use-case gắn với FCAJ/AWS
   - Không quá chung chung, không lệch chủ đề cloud

## Kiến trúc và thiết kế kỹ thuật

1. Sơ đồ kiến trúc:
   - Thể hiện đầy đủ AWS Services, luồng dữ liệu
   - Diagram rõ ràng
2. Lựa chọn dịch vụ:
   - Giải thích lý do chọn cho từng dịch vụ (với mỗi dịch vụ giải quyết vấn đề gì, ...)
   - Dựa trên chi phí, độ đơn giản, serverless, managed service
3. Bảo mật & IAM cơ bản:
   - IAM role
   - Principle of Least Privilege
   - Hạn chế public resource và không hard-code access key
4. Khả năng mở rộng & vận hành
   - Scale: auto scaling, event-driven, ...
   - Logging/Monitoring: CloudWatch, Alarm, ...
