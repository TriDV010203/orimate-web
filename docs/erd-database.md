# Sơ đồ thực thể - mối quan hệ (ERD) cơ sở dữ liệu OriMate

> Nguồn trích xuất: `OrigamiPlatform.Domain/Entities/*.cs` (43 entity), `OrigamiPlatform.Infrastructure/Persistence/Configurations/*.cs` (Fluent API — PK/FK/Unique Index/DeleteBehavior) và `AppDbContext.cs` của repo backend `B:\PE\backend_OriMate`.
>
> Quy ước nhãn quan hệ: 100% là **danh từ / cụm danh từ** (không dùng động từ), theo đúng yêu cầu.
>
> Ghi chú kỹ thuật quan trọng:
> - Các cặp `(TargetType, TargetId)` trên `Comment`, `Like`, `Wishlist`, `Report` là **tham chiếu đa hình (polymorphic)** — không có ràng buộc khóa ngoại thật ở tầng DB, có thể trỏ tới `Tutorial`, `CommunityPost`, `Comment`, `StuckThread` hoặc `DailyChallengeSubmission` tùy giá trị `TargetType`. Trong sơ đồ Mermaid, các quan hệ này được vẽ bằng đường nét đứt (`..`).
> - `Category.Id` là kiểu `int` (duy nhất trong toàn bộ schema); các entity còn lại dùng `Guid` làm khóa chính.
> - `UserProfile`, `StreakLog`, `ChallengeStreakLog` dùng chính `UserId` làm khóa chính (PK = FK), thể hiện quan hệ 1-1 chặt với `User`.
> - `FollowRelationship`, `Like`, `Wishlist`, `UserRole` là các bảng trung gian dùng khóa chính tổ hợp (composite PK), không có cột `Id` riêng.
> - `ShopLink` là entity độc lập, không có khóa ngoại tới entity nào khác trong schema hiện tại.

---

## Định dạng 1: Sơ đồ Mermaid (erDiagram)

```mermaid
erDiagram
    %% ============ NGƯỜI DÙNG & VAI TRÒ ============
    User {
        guid Id PK
        string Email UK
        string PasswordHash
        string Status
        string RefreshTokenHash
        datetime CreatedAt
    }

    UserProfile {
        guid UserId PK_FK
        string DisplayName
        string Bio
        string AvatarUrl
        int SkillPoints
        string SkillLevel
        bool IsOnboardingCompleted
    }

    UserRole {
        guid UserId PK_FK
        string Role PK
        datetime CreatedAt
    }

    StreakLog {
        guid UserId PK_FK
        int CurrentStreak
        int LongestStreak
        date LastActiveDate
        int FreezeCount
    }

    ChallengeStreakLog {
        guid UserId PK_FK
        int CurrentStreak
        int LongestStreak
        date LastSubmissionDate
        int FreezeCount
    }

    FollowRelationship {
        guid FollowerId PK_FK
        guid FollowingId PK_FK
        datetime CreatedAt
    }

    %% ============ HƯỚNG DẪN GẤP GIẤY ============
    Category {
        int Id PK
        string Name
        string Description
        bool IsActive
        bool IsDeleted
    }

    Tutorial {
        guid Id PK
        guid AuthorId FK
        int CategoryId FK
        guid ParentTutorialId FK "nullable"
        string Title
        string Slug UK
        string Type
        string Status
        string Difficulty
        bool IsOfficial
        datetime PublishedAt
    }

    TutorialStep {
        guid Id PK
        guid TutorialId FK
        int StepOrder
        string Description
        string ImageUrl
    }

    TutorialVariant {
        guid Id PK
        guid ParentTutorialId FK
        guid VariantTutorialId FK
        int DifficultyDelta
    }

    TutorialReviewHistory {
        guid Id PK
        guid TutorialId FK
        guid ReviewerId FK
        string FromStatus
        string ToStatus
        string Action
        string Reason
    }

    TutorialDifficultyRating {
        guid Id PK
        guid UserId FK
        guid TutorialId FK
        string Rating
    }

    TutorialStepProgress {
        guid Id PK
        guid UserId FK
        guid TutorialId FK
        guid TutorialStepId FK
        datetime CompletedAt
        bool IsDeleted
        bool HasBeenRewarded
    }

    Achievement {
        guid Id PK
        guid UserId FK
        guid TutorialId FK
        string PhotoUrl
        string Note
        bool IsPublic
    }

    StuckThread {
        guid Id PK
        guid TutorialId FK
        guid StepId FK
        guid UserId FK
        datetime CreatedAt
    }

    %% ============ LỘ TRÌNH HỌC ============
    LearningPathMode {
        guid Id PK
        string Name
        int SortOrder UK
        bool IsActive
    }

    LearningPathModeUnlockTest {
        guid Id PK
        guid LearningPathModeId FK_UK
        guid TutorialId FK
        string Instructions
    }

    ModeUnlockSubmission {
        guid Id PK
        guid UserId FK
        guid LearningPathModeId FK
        guid TutorialId FK
        guid ReviewedByUserId FK "nullable"
        string PhotoUrl
        string Status
        string ReviewNote
    }

    LearningPath {
        guid Id PK
        guid CreatedByUserId FK
        guid LearningPathModeId FK
        string Title
        string Status
        datetime PublishedAt
    }

    LearningPathItem {
        guid Id PK
        guid LearningPathId FK
        guid TutorialId FK
        int ItemOrder
    }

    LearningPathCompletion {
        guid Id PK
        guid UserId FK
        guid LearningPathId FK
        datetime CompletedAt
    }

    %% ============ THỬ THÁCH HẰNG NGÀY ============
    DailyChallenge {
        guid Id PK
        guid TutorialId FK
        guid CreatedByUserId FK "nullable"
        date ChallengeDate UK
        bool IsAutoGenerated
        string Status
    }

    DailyChallengeSubmission {
        guid Id PK
        guid DailyChallengeId FK
        guid UserId FK
        string PhotoUrl
        string Note
        int FinalRank
    }

    %% ============ CỘNG ĐỒNG & TƯƠNG TÁC ============
    CommunityPost {
        guid Id PK
        guid AuthorId FK
        guid LinkedTutorialId FK "nullable"
        string Content
        bool IsVisible
        bool IsDeleted
    }

    CommunityPostMedia {
        guid Id PK
        guid PostId FK
        string MediaType
        string Url
        int DisplayOrder
    }

    Comment {
        guid Id PK
        guid AuthorId FK
        string TargetType
        guid TargetId
        string Content
        bool IsDeleted
    }

    Like {
        guid UserId PK_FK
        string TargetType PK
        guid TargetId PK
        datetime CreatedAt
    }

    Wishlist {
        guid UserId PK_FK
        string TargetType PK
        guid TargetId PK
        datetime CreatedAt
    }

    Report {
        guid Id PK
        guid ReporterId FK
        guid HandledBy FK "nullable"
        string TargetType
        guid TargetId
        string Reason
        string Status
    }

    Notification {
        guid Id PK
        guid RecipientId FK
        string Type
        string Message
        string EntityType
        guid EntityId
        bool IsRead
    }

    %% ============ GAMIFICATION ============
    Badge {
        guid Id PK
        string Code UK
        string Name
        string Category
        int Threshold
        bool IsActive
    }

    UserBadge {
        guid Id PK
        guid UserId FK
        guid BadgeId FK
        datetime EarnedAt
        guid ContextRefId
    }

    PaperPattern {
        guid Id PK
        string Name
        int PriceInHatGap
        bool IsActive
    }

    UserPaperPattern {
        guid Id PK
        guid UserId FK
        guid PaperPatternId FK
        datetime PurchasedAt
    }

    PersonalMilestone {
        guid Id PK
        guid UserId FK
        int Threshold
        datetime UnlockedAt
    }

    HatGapTransaction {
        guid Id PK
        guid UserId FK
        int Amount
        string Type
        string Source
        int BalanceAfter
    }

    %% ============ KINH TẾ & THANH TOÁN ============
    Transaction {
        guid Id PK
        guid UserId FK
        guid ConfirmedBy FK "nullable"
        guid CreatorId FK "nullable"
        string TransactionType
        decimal Amount
        string Status
        string PaymentCode UK
    }

    VipSubscription {
        guid Id PK
        guid SubscriberId FK
        guid CreatorId FK
        guid TransactionId FK
        date StartDate
        date EndDate
        string Status
    }

    CreatorVipSettings {
        guid Id PK
        guid CreatorId FK_UK
        bool IsActive
        decimal Price
    }

    SePayWebhookLog {
        guid Id PK
        guid TransactionId FK "nullable"
        long SePayTransactionId UK
        decimal TransferAmount
        string MatchResult
    }

    ShopLink {
        guid Id PK
        string Title
        string Url
        string Category
        bool IsActive
    }

    %% ============ NHẬT KÝ HỆ THỐNG ============
    AuditLog {
        guid Id PK
        guid ActorId FK "nullable"
        string EntityType
        string EntityId
        string Action
    }

    EmailLog {
        guid Id PK
        guid RecipientId FK "nullable"
        string ToEmail
        string Type
        string Status
    }

    %% ================= QUAN HỆ 1-1 =================
    User ||--o| UserProfile : "Hồ sơ cá nhân"
    User ||--o| StreakLog : "Chuỗi hoạt động"
    User ||--o| ChallengeStreakLog : "Chuỗi thử thách"
    User ||--o| CreatorVipSettings : "Cấu hình VIP kênh"
    LearningPathMode ||--o| LearningPathModeUnlockTest : "Bài kiểm tra mở khóa"

    %% ================= QUAN HỆ 1-N: NGƯỜI DÙNG & VAI TRÒ =================
    User ||--o{ UserRole : "Vai trò người dùng"
    User ||--o{ FollowRelationship : "Người theo dõi"
    User ||--o{ FollowRelationship : "Người được theo dõi"

    %% ================= QUAN HỆ 1-N: HƯỚNG DẪN =================
    User ||--o{ Tutorial : "Tác giả"
    Category ||--o{ Tutorial : "Danh mục"
    Tutorial |o--o{ Tutorial : "Phiên bản gốc"
    Tutorial ||--o{ TutorialStep : "Danh sách bước"
    Tutorial ||--o{ TutorialVariant : "Bản gốc biến thể"
    Tutorial ||--o{ TutorialVariant : "Bản biến thể"
    Tutorial ||--o{ TutorialReviewHistory : "Lịch sử kiểm duyệt"
    User ||--o{ TutorialReviewHistory : "Người kiểm duyệt"
    Tutorial ||--o{ TutorialDifficultyRating : "Đối tượng đánh giá"
    User ||--o{ TutorialDifficultyRating : "Người đánh giá"
    Tutorial ||--o{ TutorialStepProgress : "Hướng dẫn đang học"
    TutorialStep ||--o{ TutorialStepProgress : "Bước đã hoàn thành"
    User ||--o{ TutorialStepProgress : "Người học"
    Tutorial ||--o{ Achievement : "Minh chứng hoàn thành"
    User ||--o{ Achievement : "Chủ nhân thành tựu"
    Tutorial ||--o{ StuckThread : "Hướng dẫn liên quan"
    TutorialStep ||--o{ StuckThread : "Bước gặp khó khăn"
    User ||--o{ StuckThread : "Người gặp khó khăn"

    %% ================= QUAN HỆ 1-N: LỘ TRÌNH HỌC =================
    LearningPathMode ||--o{ LearningPath : "Chế độ học"
    User ||--o{ LearningPath : "Người tạo lộ trình"
    LearningPath ||--o{ LearningPathItem : "Thành phần lộ trình"
    Tutorial ||--o{ LearningPathItem : "Hướng dẫn trong lộ trình"
    User ||--o{ LearningPathCompletion : "Người hoàn thành"
    LearningPath ||--o{ LearningPathCompletion : "Lộ trình đã hoàn thành"
    LearningPathMode ||--o{ ModeUnlockSubmission : "Chế độ cần mở khóa"
    Tutorial ||--o{ ModeUnlockSubmission : "Bài kiểm tra tham chiếu"
    User ||--o{ ModeUnlockSubmission : "Người nộp bài mở khóa"
    User |o--o{ ModeUnlockSubmission : "Người duyệt"

    %% ================= QUAN HỆ 1-N: THỬ THÁCH HẰNG NGÀY =================
    Tutorial ||--o{ DailyChallenge : "Hướng dẫn thử thách"
    User |o--o{ DailyChallenge : "Người tạo thử thách"
    DailyChallenge ||--o{ DailyChallengeSubmission : "Bài nộp thử thách"
    User ||--o{ DailyChallengeSubmission : "Người nộp bài"

    %% ================= QUAN HỆ 1-N: CỘNG ĐỒNG & TƯƠNG TÁC =================
    User ||--o{ CommunityPost : "Tác giả bài đăng"
    Tutorial |o--o{ CommunityPost : "Hướng dẫn liên kết"
    CommunityPost ||--o{ CommunityPostMedia : "Tệp đính kèm"
    User ||--o{ Comment : "Tác giả bình luận"
    User ||--o{ Like : "Người thích"
    User ||--o{ Wishlist : "Người yêu thích"
    User ||--o{ Report : "Người báo cáo"
    User |o--o{ Report : "Người xử lý"
    User ||--o{ Notification : "Người nhận thông báo"

    %% ================= QUAN HỆ 1-N: GAMIFICATION =================
    Badge ||--o{ UserBadge : "Huy hiệu đạt được"
    User ||--o{ UserBadge : "Chủ huy hiệu"
    PaperPattern ||--o{ UserPaperPattern : "Mẫu giấy đã mua"
    User ||--o{ UserPaperPattern : "Người mua"
    User ||--o{ PersonalMilestone : "Chủ mốc cá nhân"
    User ||--o{ HatGapTransaction : "Chủ giao dịch Hạt Gạo"

    %% ================= QUAN HỆ 1-N: KINH TẾ & THANH TOÁN =================
    User ||--o{ Transaction : "Chủ giao dịch"
    User |o--o{ Transaction : "Người xác nhận"
    User |o--o{ Transaction : "Nhà sáng tạo thụ hưởng"
    User ||--o{ VipSubscription : "Người đăng ký"
    User ||--o{ VipSubscription : "Nhà sáng tạo kênh"
    Transaction ||--o{ VipSubscription : "Giao dịch thanh toán"
    Transaction |o--o{ SePayWebhookLog : "Giao dịch đối chiếu"

    %% ================= QUAN HỆ 1-N: NHẬT KÝ HỆ THỐNG =================
    User |o--o{ AuditLog : "Người thực hiện"
    User |o--o{ EmailLog : "Người nhận email"

    %% ================= QUAN HỆ ĐA HÌNH (không ràng buộc FK ở DB) =================
    Tutorial |o..o{ Comment : "Đối tượng được bình luận"
    CommunityPost |o..o{ Comment : "Đối tượng được bình luận"
    Comment |o..o{ Comment : "Bình luận gốc"
    StuckThread |o..o{ Comment : "Đối tượng được bình luận"
    DailyChallengeSubmission |o..o{ Comment : "Đối tượng được bình luận"

    Tutorial |o..o{ Like : "Đối tượng được thích"
    CommunityPost |o..o{ Like : "Đối tượng được thích"
    Comment |o..o{ Like : "Đối tượng được thích"
    StuckThread |o..o{ Like : "Đối tượng được thích"
    DailyChallengeSubmission |o..o{ Like : "Đối tượng được thích"

    Tutorial |o..o{ Wishlist : "Đối tượng được lưu"
    CommunityPost |o..o{ Wishlist : "Đối tượng được lưu"
    Comment |o..o{ Wishlist : "Đối tượng được lưu"
    StuckThread |o..o{ Wishlist : "Đối tượng được lưu"
    DailyChallengeSubmission |o..o{ Wishlist : "Đối tượng được lưu"

    Tutorial |o..o{ Report : "Đối tượng bị báo cáo"
    CommunityPost |o..o{ Report : "Đối tượng bị báo cáo"
    Comment |o..o{ Report : "Đối tượng bị báo cáo"
    StuckThread |o..o{ Report : "Đối tượng bị báo cáo"
    DailyChallengeSubmission |o..o{ Report : "Đối tượng bị báo cáo"
```

---

## Định dạng 2: Dữ liệu cấu trúc JSON (dùng để AI khác tinh chỉnh sơ đồ)

```json
{
  "systemName": "OriMate Database Schema (OrigamiPlatform)",
  "sourceRepo": "B:\\PE\\backend_OriMate",
  "namingConvention": "PascalCase theo tên class C# / bảng EF Core",
  "relationshipLabelRule": "Tất cả nhãn quan hệ là danh từ hoặc cụm danh từ, không dùng động từ",
  "entities": [
    { "name": "User", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "Email", "type": "string", "key": "UK" },
      { "name": "PasswordHash", "type": "string" },
      { "name": "Status", "type": "string(enum AccountStatus)" },
      { "name": "RefreshTokenHash", "type": "string", "nullable": true },
      { "name": "CreatedAt", "type": "datetime" }
    ]},
    { "name": "UserProfile", "attributes": [
      { "name": "UserId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "DisplayName", "type": "string", "nullable": true },
      { "name": "Bio", "type": "string", "nullable": true },
      { "name": "AvatarUrl", "type": "string", "nullable": true },
      { "name": "SkillPoints", "type": "int" },
      { "name": "SkillLevel", "type": "string(enum SkillLevel)" },
      { "name": "IsOnboardingCompleted", "type": "bool" }
    ]},
    { "name": "UserRole", "attributes": [
      { "name": "UserId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "Role", "type": "string(enum UserRoleType)", "key": "PK" },
      { "name": "CreatedAt", "type": "datetime" }
    ]},
    { "name": "StreakLog", "attributes": [
      { "name": "UserId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "CurrentStreak", "type": "int" },
      { "name": "LongestStreak", "type": "int" },
      { "name": "LastActiveDate", "type": "date", "nullable": true },
      { "name": "FreezeCount", "type": "int" }
    ]},
    { "name": "ChallengeStreakLog", "attributes": [
      { "name": "UserId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "CurrentStreak", "type": "int" },
      { "name": "LongestStreak", "type": "int" },
      { "name": "LastSubmissionDate", "type": "date", "nullable": true },
      { "name": "FreezeCount", "type": "int" }
    ]},
    { "name": "FollowRelationship", "attributes": [
      { "name": "FollowerId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "FollowingId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "CreatedAt", "type": "datetime" }
    ]},
    { "name": "Category", "attributes": [
      { "name": "Id", "type": "int", "key": "PK" },
      { "name": "Name", "type": "string" },
      { "name": "Description", "type": "string", "nullable": true },
      { "name": "IsActive", "type": "bool" },
      { "name": "IsDeleted", "type": "bool" }
    ]},
    { "name": "Tutorial", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "AuthorId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "CategoryId", "type": "int", "key": "FK", "references": "Category.Id" },
      { "name": "ParentTutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id", "nullable": true },
      { "name": "Title", "type": "string" },
      { "name": "Slug", "type": "string", "key": "UK" },
      { "name": "Type", "type": "string(enum TutorialType)" },
      { "name": "Status", "type": "string(enum TutorialStatus)" },
      { "name": "Difficulty", "type": "string(enum TutorialDifficulty)" },
      { "name": "IsOfficial", "type": "bool" },
      { "name": "PublishedAt", "type": "datetime", "nullable": true }
    ]},
    { "name": "TutorialStep", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "StepOrder", "type": "int" },
      { "name": "Description", "type": "string" },
      { "name": "ImageUrl", "type": "string", "nullable": true }
    ]},
    { "name": "TutorialVariant", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "ParentTutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "VariantTutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "DifficultyDelta", "type": "int", "nullable": true }
    ]},
    { "name": "TutorialReviewHistory", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "ReviewerId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "FromStatus", "type": "string(enum TutorialStatus)" },
      { "name": "ToStatus", "type": "string(enum TutorialStatus)" },
      { "name": "Action", "type": "string" },
      { "name": "Reason", "type": "string", "nullable": true }
    ]},
    { "name": "TutorialDifficultyRating", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "Rating", "type": "string(enum PerceivedDifficulty)" }
    ]},
    { "name": "TutorialStepProgress", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "TutorialStepId", "type": "guid", "key": "FK", "references": "TutorialStep.Id" },
      { "name": "CompletedAt", "type": "datetime" },
      { "name": "IsDeleted", "type": "bool" },
      { "name": "HasBeenRewarded", "type": "bool" }
    ]},
    { "name": "Achievement", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "PhotoUrl", "type": "string", "nullable": true },
      { "name": "Note", "type": "string", "nullable": true },
      { "name": "IsPublic", "type": "bool" }
    ]},
    { "name": "StuckThread", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "StepId", "type": "guid", "key": "FK", "references": "TutorialStep.Id" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "CreatedAt", "type": "datetime" }
    ]},
    { "name": "LearningPathMode", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "Name", "type": "string" },
      { "name": "SortOrder", "type": "int", "key": "UK" },
      { "name": "IsActive", "type": "bool" }
    ]},
    { "name": "LearningPathModeUnlockTest", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "LearningPathModeId", "type": "guid", "key": "FK,UK", "references": "LearningPathMode.Id" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "Instructions", "type": "string", "nullable": true }
    ]},
    { "name": "ModeUnlockSubmission", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "LearningPathModeId", "type": "guid", "key": "FK", "references": "LearningPathMode.Id" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "ReviewedByUserId", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "PhotoUrl", "type": "string" },
      { "name": "Status", "type": "string(enum ModeUnlockSubmissionStatus)" },
      { "name": "ReviewNote", "type": "string", "nullable": true }
    ]},
    { "name": "LearningPath", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "CreatedByUserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "LearningPathModeId", "type": "guid", "key": "FK", "references": "LearningPathMode.Id" },
      { "name": "Title", "type": "string" },
      { "name": "Status", "type": "string(enum LearningPathStatus)" },
      { "name": "PublishedAt", "type": "datetime", "nullable": true }
    ]},
    { "name": "LearningPathItem", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "LearningPathId", "type": "guid", "key": "FK", "references": "LearningPath.Id" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "ItemOrder", "type": "int" }
    ]},
    { "name": "LearningPathCompletion", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "LearningPathId", "type": "guid", "key": "FK", "references": "LearningPath.Id" },
      { "name": "CompletedAt", "type": "datetime" }
    ]},
    { "name": "DailyChallenge", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "TutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id" },
      { "name": "CreatedByUserId", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "ChallengeDate", "type": "date", "key": "UK" },
      { "name": "IsAutoGenerated", "type": "bool" },
      { "name": "Status", "type": "string(enum DailyChallengeStatus)" }
    ]},
    { "name": "DailyChallengeSubmission", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "DailyChallengeId", "type": "guid", "key": "FK", "references": "DailyChallenge.Id" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "PhotoUrl", "type": "string" },
      { "name": "Note", "type": "string", "nullable": true },
      { "name": "FinalRank", "type": "int", "nullable": true }
    ]},
    { "name": "CommunityPost", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "AuthorId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "LinkedTutorialId", "type": "guid", "key": "FK", "references": "Tutorial.Id", "nullable": true },
      { "name": "Content", "type": "string" },
      { "name": "IsVisible", "type": "bool" },
      { "name": "IsDeleted", "type": "bool" }
    ]},
    { "name": "CommunityPostMedia", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "PostId", "type": "guid", "key": "FK", "references": "CommunityPost.Id" },
      { "name": "MediaType", "type": "string(enum MediaType)" },
      { "name": "Url", "type": "string" },
      { "name": "DisplayOrder", "type": "int" }
    ]},
    { "name": "Comment", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "AuthorId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "TargetType", "type": "string(enum TargetType)", "note": "polymorphic - không FK thật" },
      { "name": "TargetId", "type": "guid", "note": "polymorphic - không FK thật" },
      { "name": "Content", "type": "string" },
      { "name": "IsDeleted", "type": "bool" }
    ]},
    { "name": "Like", "attributes": [
      { "name": "UserId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "TargetType", "type": "string(enum TargetType)", "key": "PK", "note": "polymorphic - không FK thật" },
      { "name": "TargetId", "type": "guid", "key": "PK", "note": "polymorphic - không FK thật" },
      { "name": "CreatedAt", "type": "datetime" }
    ]},
    { "name": "Wishlist", "attributes": [
      { "name": "UserId", "type": "guid", "key": "PK,FK", "references": "User.Id" },
      { "name": "TargetType", "type": "string(enum TargetType)", "key": "PK", "note": "polymorphic - không FK thật" },
      { "name": "TargetId", "type": "guid", "key": "PK", "note": "polymorphic - không FK thật" },
      { "name": "CreatedAt", "type": "datetime" }
    ]},
    { "name": "Report", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "ReporterId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "HandledBy", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "TargetType", "type": "string(enum TargetType)", "note": "polymorphic - không FK thật" },
      { "name": "TargetId", "type": "guid", "note": "polymorphic - không FK thật" },
      { "name": "Reason", "type": "string" },
      { "name": "Status", "type": "string(enum ReportStatus)" }
    ]},
    { "name": "Notification", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "RecipientId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "Type", "type": "string(enum NotificationType)" },
      { "name": "Message", "type": "string" },
      { "name": "EntityType", "type": "string", "nullable": true, "note": "polymorphic tự do - không enum ràng buộc" },
      { "name": "EntityId", "type": "guid", "nullable": true, "note": "polymorphic tự do - không enum ràng buộc" },
      { "name": "IsRead", "type": "bool" }
    ]},
    { "name": "Badge", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "Code", "type": "string", "key": "UK" },
      { "name": "Name", "type": "string" },
      { "name": "Category", "type": "string(enum BadgeCategory)" },
      { "name": "Threshold", "type": "int", "nullable": true },
      { "name": "IsActive", "type": "bool" }
    ]},
    { "name": "UserBadge", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "BadgeId", "type": "guid", "key": "FK", "references": "Badge.Id" },
      { "name": "EarnedAt", "type": "datetime" },
      { "name": "ContextRefId", "type": "guid", "nullable": true }
    ]},
    { "name": "PaperPattern", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "Name", "type": "string" },
      { "name": "PriceInHatGap", "type": "int" },
      { "name": "IsActive", "type": "bool" }
    ]},
    { "name": "UserPaperPattern", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "PaperPatternId", "type": "guid", "key": "FK", "references": "PaperPattern.Id" },
      { "name": "PurchasedAt", "type": "datetime" }
    ]},
    { "name": "PersonalMilestone", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "Threshold", "type": "int" },
      { "name": "UnlockedAt", "type": "datetime" }
    ]},
    { "name": "HatGapTransaction", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "Amount", "type": "int" },
      { "name": "Type", "type": "string(enum HatGapTransactionType)" },
      { "name": "Source", "type": "string" },
      { "name": "BalanceAfter", "type": "int" }
    ]},
    { "name": "Transaction", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "UserId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "ConfirmedBy", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "CreatorId", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "TransactionType", "type": "string(enum)" },
      { "name": "Amount", "type": "decimal(18,2)" },
      { "name": "Status", "type": "string(enum TransactionStatus)" },
      { "name": "PaymentCode", "type": "string", "key": "UK" }
    ]},
    { "name": "VipSubscription", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "SubscriberId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "CreatorId", "type": "guid", "key": "FK", "references": "User.Id" },
      { "name": "TransactionId", "type": "guid", "key": "FK", "references": "Transaction.Id" },
      { "name": "StartDate", "type": "date" },
      { "name": "EndDate", "type": "date" },
      { "name": "Status", "type": "string(enum SubscriptionStatus)" }
    ]},
    { "name": "CreatorVipSettings", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "CreatorId", "type": "guid", "key": "FK,UK", "references": "User.Id" },
      { "name": "IsActive", "type": "bool" },
      { "name": "Price", "type": "decimal(18,2)" }
    ]},
    { "name": "SePayWebhookLog", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "TransactionId", "type": "guid", "key": "FK", "references": "Transaction.Id", "nullable": true },
      { "name": "SePayTransactionId", "type": "long", "key": "UK" },
      { "name": "TransferAmount", "type": "decimal(18,2)" },
      { "name": "MatchResult", "type": "string(enum SePayWebhookMatchResult)" }
    ]},
    { "name": "ShopLink", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "Title", "type": "string" },
      { "name": "Url", "type": "string" },
      { "name": "Category", "type": "string", "nullable": true, "note": "chuỗi tự do, không FK tới Category" },
      { "name": "IsActive", "type": "bool" }
    ]},
    { "name": "AuditLog", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "ActorId", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "EntityType", "type": "string" },
      { "name": "EntityId", "type": "string" },
      { "name": "Action", "type": "string" }
    ]},
    { "name": "EmailLog", "attributes": [
      { "name": "Id", "type": "guid", "key": "PK" },
      { "name": "RecipientId", "type": "guid", "key": "FK", "references": "User.Id", "nullable": true },
      { "name": "ToEmail", "type": "string" },
      { "name": "Type", "type": "string" },
      { "name": "Status", "type": "string" }
    ]}
  ],
  "relationships": [
    { "from": "User", "to": "UserProfile", "cardinality": "1-1", "label": "Hồ sơ cá nhân", "foreignKey": "UserProfile.UserId" },
    { "from": "User", "to": "StreakLog", "cardinality": "1-1", "label": "Chuỗi hoạt động", "foreignKey": "StreakLog.UserId" },
    { "from": "User", "to": "ChallengeStreakLog", "cardinality": "1-1", "label": "Chuỗi thử thách", "foreignKey": "ChallengeStreakLog.UserId" },
    { "from": "User", "to": "CreatorVipSettings", "cardinality": "1-1", "label": "Cấu hình VIP kênh", "foreignKey": "CreatorVipSettings.CreatorId" },
    { "from": "LearningPathMode", "to": "LearningPathModeUnlockTest", "cardinality": "1-1", "label": "Bài kiểm tra mở khóa", "foreignKey": "LearningPathModeUnlockTest.LearningPathModeId" },

    { "from": "User", "to": "UserRole", "cardinality": "1-N", "label": "Vai trò người dùng", "foreignKey": "UserRole.UserId" },
    { "from": "User", "to": "FollowRelationship", "cardinality": "1-N", "label": "Người theo dõi", "foreignKey": "FollowRelationship.FollowerId" },
    { "from": "User", "to": "FollowRelationship", "cardinality": "1-N", "label": "Người được theo dõi", "foreignKey": "FollowRelationship.FollowingId" },

    { "from": "User", "to": "Tutorial", "cardinality": "1-N", "label": "Tác giả", "foreignKey": "Tutorial.AuthorId" },
    { "from": "Category", "to": "Tutorial", "cardinality": "1-N", "label": "Danh mục", "foreignKey": "Tutorial.CategoryId" },
    { "from": "Tutorial", "to": "Tutorial", "cardinality": "1-N", "label": "Phiên bản gốc", "foreignKey": "Tutorial.ParentTutorialId", "nullableFk": true },
    { "from": "Tutorial", "to": "TutorialStep", "cardinality": "1-N", "label": "Danh sách bước", "foreignKey": "TutorialStep.TutorialId" },
    { "from": "Tutorial", "to": "TutorialVariant", "cardinality": "1-N", "label": "Bản gốc biến thể", "foreignKey": "TutorialVariant.ParentTutorialId" },
    { "from": "Tutorial", "to": "TutorialVariant", "cardinality": "1-N", "label": "Bản biến thể", "foreignKey": "TutorialVariant.VariantTutorialId" },
    { "from": "Tutorial", "to": "TutorialReviewHistory", "cardinality": "1-N", "label": "Lịch sử kiểm duyệt", "foreignKey": "TutorialReviewHistory.TutorialId" },
    { "from": "User", "to": "TutorialReviewHistory", "cardinality": "1-N", "label": "Người kiểm duyệt", "foreignKey": "TutorialReviewHistory.ReviewerId" },
    { "from": "Tutorial", "to": "TutorialDifficultyRating", "cardinality": "1-N", "label": "Đối tượng đánh giá", "foreignKey": "TutorialDifficultyRating.TutorialId" },
    { "from": "User", "to": "TutorialDifficultyRating", "cardinality": "1-N", "label": "Người đánh giá", "foreignKey": "TutorialDifficultyRating.UserId" },
    { "from": "Tutorial", "to": "TutorialStepProgress", "cardinality": "1-N", "label": "Hướng dẫn đang học", "foreignKey": "TutorialStepProgress.TutorialId" },
    { "from": "TutorialStep", "to": "TutorialStepProgress", "cardinality": "1-N", "label": "Bước đã hoàn thành", "foreignKey": "TutorialStepProgress.TutorialStepId" },
    { "from": "User", "to": "TutorialStepProgress", "cardinality": "1-N", "label": "Người học", "foreignKey": "TutorialStepProgress.UserId" },
    { "from": "Tutorial", "to": "Achievement", "cardinality": "1-N", "label": "Minh chứng hoàn thành", "foreignKey": "Achievement.TutorialId" },
    { "from": "User", "to": "Achievement", "cardinality": "1-N", "label": "Chủ nhân thành tựu", "foreignKey": "Achievement.UserId" },
    { "from": "Tutorial", "to": "StuckThread", "cardinality": "1-N", "label": "Hướng dẫn liên quan", "foreignKey": "StuckThread.TutorialId" },
    { "from": "TutorialStep", "to": "StuckThread", "cardinality": "1-N", "label": "Bước gặp khó khăn", "foreignKey": "StuckThread.StepId" },
    { "from": "User", "to": "StuckThread", "cardinality": "1-N", "label": "Người gặp khó khăn", "foreignKey": "StuckThread.UserId" },

    { "from": "LearningPathMode", "to": "LearningPath", "cardinality": "1-N", "label": "Chế độ học", "foreignKey": "LearningPath.LearningPathModeId" },
    { "from": "User", "to": "LearningPath", "cardinality": "1-N", "label": "Người tạo lộ trình", "foreignKey": "LearningPath.CreatedByUserId" },
    { "from": "LearningPath", "to": "LearningPathItem", "cardinality": "1-N", "label": "Thành phần lộ trình", "foreignKey": "LearningPathItem.LearningPathId" },
    { "from": "Tutorial", "to": "LearningPathItem", "cardinality": "1-N", "label": "Hướng dẫn trong lộ trình", "foreignKey": "LearningPathItem.TutorialId" },
    { "from": "User", "to": "LearningPathCompletion", "cardinality": "1-N", "label": "Người hoàn thành", "foreignKey": "LearningPathCompletion.UserId" },
    { "from": "LearningPath", "to": "LearningPathCompletion", "cardinality": "1-N", "label": "Lộ trình đã hoàn thành", "foreignKey": "LearningPathCompletion.LearningPathId" },
    { "from": "LearningPathMode", "to": "ModeUnlockSubmission", "cardinality": "1-N", "label": "Chế độ cần mở khóa", "foreignKey": "ModeUnlockSubmission.LearningPathModeId" },
    { "from": "Tutorial", "to": "ModeUnlockSubmission", "cardinality": "1-N", "label": "Bài kiểm tra tham chiếu", "foreignKey": "ModeUnlockSubmission.TutorialId" },
    { "from": "User", "to": "ModeUnlockSubmission", "cardinality": "1-N", "label": "Người nộp bài mở khóa", "foreignKey": "ModeUnlockSubmission.UserId" },
    { "from": "User", "to": "ModeUnlockSubmission", "cardinality": "1-N", "label": "Người duyệt", "foreignKey": "ModeUnlockSubmission.ReviewedByUserId", "nullableFk": true },

    { "from": "Tutorial", "to": "DailyChallenge", "cardinality": "1-N", "label": "Hướng dẫn thử thách", "foreignKey": "DailyChallenge.TutorialId" },
    { "from": "User", "to": "DailyChallenge", "cardinality": "1-N", "label": "Người tạo thử thách", "foreignKey": "DailyChallenge.CreatedByUserId", "nullableFk": true },
    { "from": "DailyChallenge", "to": "DailyChallengeSubmission", "cardinality": "1-N", "label": "Bài nộp thử thách", "foreignKey": "DailyChallengeSubmission.DailyChallengeId" },
    { "from": "User", "to": "DailyChallengeSubmission", "cardinality": "1-N", "label": "Người nộp bài", "foreignKey": "DailyChallengeSubmission.UserId" },

    { "from": "User", "to": "CommunityPost", "cardinality": "1-N", "label": "Tác giả bài đăng", "foreignKey": "CommunityPost.AuthorId" },
    { "from": "Tutorial", "to": "CommunityPost", "cardinality": "1-N", "label": "Hướng dẫn liên kết", "foreignKey": "CommunityPost.LinkedTutorialId", "nullableFk": true },
    { "from": "CommunityPost", "to": "CommunityPostMedia", "cardinality": "1-N", "label": "Tệp đính kèm", "foreignKey": "CommunityPostMedia.PostId" },
    { "from": "User", "to": "Comment", "cardinality": "1-N", "label": "Tác giả bình luận", "foreignKey": "Comment.AuthorId" },
    { "from": "User", "to": "Like", "cardinality": "1-N", "label": "Người thích", "foreignKey": "Like.UserId" },
    { "from": "User", "to": "Wishlist", "cardinality": "1-N", "label": "Người yêu thích", "foreignKey": "Wishlist.UserId" },
    { "from": "User", "to": "Report", "cardinality": "1-N", "label": "Người báo cáo", "foreignKey": "Report.ReporterId" },
    { "from": "User", "to": "Report", "cardinality": "1-N", "label": "Người xử lý", "foreignKey": "Report.HandledBy", "nullableFk": true },
    { "from": "User", "to": "Notification", "cardinality": "1-N", "label": "Người nhận thông báo", "foreignKey": "Notification.RecipientId" },

    { "from": "Badge", "to": "UserBadge", "cardinality": "1-N", "label": "Huy hiệu đạt được", "foreignKey": "UserBadge.BadgeId" },
    { "from": "User", "to": "UserBadge", "cardinality": "1-N", "label": "Chủ huy hiệu", "foreignKey": "UserBadge.UserId" },
    { "from": "PaperPattern", "to": "UserPaperPattern", "cardinality": "1-N", "label": "Mẫu giấy đã mua", "foreignKey": "UserPaperPattern.PaperPatternId" },
    { "from": "User", "to": "UserPaperPattern", "cardinality": "1-N", "label": "Người mua", "foreignKey": "UserPaperPattern.UserId" },
    { "from": "User", "to": "PersonalMilestone", "cardinality": "1-N", "label": "Chủ mốc cá nhân", "foreignKey": "PersonalMilestone.UserId" },
    { "from": "User", "to": "HatGapTransaction", "cardinality": "1-N", "label": "Chủ giao dịch Hạt Gạo", "foreignKey": "HatGapTransaction.UserId" },

    { "from": "User", "to": "Transaction", "cardinality": "1-N", "label": "Chủ giao dịch", "foreignKey": "Transaction.UserId" },
    { "from": "User", "to": "Transaction", "cardinality": "1-N", "label": "Người xác nhận", "foreignKey": "Transaction.ConfirmedBy", "nullableFk": true },
    { "from": "User", "to": "Transaction", "cardinality": "1-N", "label": "Nhà sáng tạo thụ hưởng", "foreignKey": "Transaction.CreatorId", "nullableFk": true },
    { "from": "User", "to": "VipSubscription", "cardinality": "1-N", "label": "Người đăng ký", "foreignKey": "VipSubscription.SubscriberId" },
    { "from": "User", "to": "VipSubscription", "cardinality": "1-N", "label": "Nhà sáng tạo kênh", "foreignKey": "VipSubscription.CreatorId" },
    { "from": "Transaction", "to": "VipSubscription", "cardinality": "1-N", "label": "Giao dịch thanh toán", "foreignKey": "VipSubscription.TransactionId" },
    { "from": "Transaction", "to": "SePayWebhookLog", "cardinality": "1-N", "label": "Giao dịch đối chiếu", "foreignKey": "SePayWebhookLog.TransactionId", "nullableFk": true },

    { "from": "User", "to": "AuditLog", "cardinality": "1-N", "label": "Người thực hiện", "foreignKey": "AuditLog.ActorId", "nullableFk": true },
    { "from": "User", "to": "EmailLog", "cardinality": "1-N", "label": "Người nhận email", "foreignKey": "EmailLog.RecipientId", "nullableFk": true },

    { "from": "Tutorial", "to": "Comment", "cardinality": "polymorphic-1-N", "label": "Đối tượng được bình luận", "note": "qua cặp Comment.TargetType/TargetId, không FK ở DB" },
    { "from": "CommunityPost", "to": "Comment", "cardinality": "polymorphic-1-N", "label": "Đối tượng được bình luận", "note": "qua cặp Comment.TargetType/TargetId, không FK ở DB" },
    { "from": "Comment", "to": "Comment", "cardinality": "polymorphic-1-N", "label": "Bình luận gốc", "note": "trả lời bình luận, qua Comment.TargetType/TargetId, không FK ở DB" },
    { "from": "StuckThread", "to": "Comment", "cardinality": "polymorphic-1-N", "label": "Đối tượng được bình luận", "note": "qua cặp Comment.TargetType/TargetId, không FK ở DB" },
    { "from": "DailyChallengeSubmission", "to": "Comment", "cardinality": "polymorphic-1-N", "label": "Đối tượng được bình luận", "note": "qua cặp Comment.TargetType/TargetId, không FK ở DB" },

    { "from": "Tutorial", "to": "Like", "cardinality": "polymorphic-1-N", "label": "Đối tượng được thích", "note": "qua cặp Like.TargetType/TargetId, không FK ở DB" },
    { "from": "CommunityPost", "to": "Like", "cardinality": "polymorphic-1-N", "label": "Đối tượng được thích", "note": "qua cặp Like.TargetType/TargetId, không FK ở DB" },
    { "from": "Comment", "to": "Like", "cardinality": "polymorphic-1-N", "label": "Đối tượng được thích", "note": "qua cặp Like.TargetType/TargetId, không FK ở DB" },
    { "from": "StuckThread", "to": "Like", "cardinality": "polymorphic-1-N", "label": "Đối tượng được thích", "note": "qua cặp Like.TargetType/TargetId, không FK ở DB" },
    { "from": "DailyChallengeSubmission", "to": "Like", "cardinality": "polymorphic-1-N", "label": "Đối tượng được thích", "note": "qua cặp Like.TargetType/TargetId, không FK ở DB" },

    { "from": "Tutorial", "to": "Wishlist", "cardinality": "polymorphic-1-N", "label": "Đối tượng được lưu", "note": "qua cặp Wishlist.TargetType/TargetId, không FK ở DB" },
    { "from": "CommunityPost", "to": "Wishlist", "cardinality": "polymorphic-1-N", "label": "Đối tượng được lưu", "note": "qua cặp Wishlist.TargetType/TargetId, không FK ở DB" },
    { "from": "Comment", "to": "Wishlist", "cardinality": "polymorphic-1-N", "label": "Đối tượng được lưu", "note": "qua cặp Wishlist.TargetType/TargetId, không FK ở DB" },
    { "from": "StuckThread", "to": "Wishlist", "cardinality": "polymorphic-1-N", "label": "Đối tượng được lưu", "note": "qua cặp Wishlist.TargetType/TargetId, không FK ở DB" },
    { "from": "DailyChallengeSubmission", "to": "Wishlist", "cardinality": "polymorphic-1-N", "label": "Đối tượng được lưu", "note": "qua cặp Wishlist.TargetType/TargetId, không FK ở DB" },

    { "from": "Tutorial", "to": "Report", "cardinality": "polymorphic-1-N", "label": "Đối tượng bị báo cáo", "note": "qua cặp Report.TargetType/TargetId, không FK ở DB" },
    { "from": "CommunityPost", "to": "Report", "cardinality": "polymorphic-1-N", "label": "Đối tượng bị báo cáo", "note": "qua cặp Report.TargetType/TargetId, không FK ở DB" },
    { "from": "Comment", "to": "Report", "cardinality": "polymorphic-1-N", "label": "Đối tượng bị báo cáo", "note": "qua cặp Report.TargetType/TargetId, không FK ở DB" },
    { "from": "StuckThread", "to": "Report", "cardinality": "polymorphic-1-N", "label": "Đối tượng bị báo cáo", "note": "qua cặp Report.TargetType/TargetId, không FK ở DB" },
    { "from": "DailyChallengeSubmission", "to": "Report", "cardinality": "polymorphic-1-N", "label": "Đối tượng bị báo cáo", "note": "qua cặp Report.TargetType/TargetId, không FK ở DB" }
  ]
}
```
