// ============================================================
// Shared TypeScript types for the Modern Trader admin dashboard.
// Each type mirrors the shape returned by the Express backend API.
// ============================================================

// ------------------------------------------------------------
// Pagination
// ------------------------------------------------------------

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
};

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

// ------------------------------------------------------------
// Dashboard metrics
// Returned by GET /admin/metrics as { data: { metrics } }
// ------------------------------------------------------------

export type Metrics = {
  totalSubmissions: number;
  successfulVerifications: number;
  failedVerifications: number;
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
  parserFailures: number;
};

// ------------------------------------------------------------
// User submissions
// Returned by GET /admin/submissions
// ------------------------------------------------------------

export type SubmissionStatus = "PENDING" | "VERIFIED" | "FAILED" | "DUPLICATE";

export type UserSubmission = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  submittedAccountId: string;
  xmAccountId: string | null;
  status: SubmissionStatus;
  verificationAttempts: number;
  ipAddress: string | null;
  campaignId: string | null;
  submittedAt: string;
  updatedAt: string;
  fulfilledAt: string | null;
  campaign?: { campaignName: string; brokerName: string } | null;
};

// ------------------------------------------------------------
// Fulfillment jobs
// Returned by GET /admin/jobs
// ------------------------------------------------------------

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type NotificationChannel = "WHATSAPP" | "EMAIL";

export type FulfillmentJob = {
  id: string;
  submissionId: string;
  notificationChannel: NotificationChannel;
  jobStatus: JobStatus;
  retryCount: number;
  lastError: string | null;
  scheduledFor: string;
  processedAt: string | null;
  createdAt: string;
  submission: {
    name: string;
    email: string;
    submittedAccountId: string;
    xmAccountId: string | null;
  };
};

// ------------------------------------------------------------
// Dead-letter (failed jobs)
// Returned by GET /admin/jobs/failed
// ------------------------------------------------------------

export type FailedJob = {
  id: string;
  originalJobId: string;
  notificationChannel: NotificationChannel;
  failureReason: string;
  payloadSnapshot: Record<string, unknown>;
  retryAttempts: number;
  failedAt: string;
};

// ------------------------------------------------------------
// XM approved accounts
// Returned by GET /admin/accounts
// ------------------------------------------------------------

export type XmApprovedAccount = {
  id: string;
  accountId: string;
  emailSubject: string | null;
  senderEmail: string | null;
  rawEmailExcerpt: string | null;
  parsedSuccessfully: boolean;
  fetchedAt: string;
  submissions: { status: SubmissionStatus }[];
};

// ------------------------------------------------------------
// Campaigns
// Returned by GET /admin/campaigns
// ------------------------------------------------------------

export type Campaign = {
  id: string;
  campaignName: string;
  brokerName: string;
  whopLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: { submissions: number };
};

// ------------------------------------------------------------
// Notification templates
// Returned by GET /admin/templates
// ------------------------------------------------------------

export type NotificationTemplate = {
  id: string;
  templateName: string;
  notificationType: NotificationChannel;
  subjectLine: string | null;
  templateBody: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ------------------------------------------------------------
// Parser logs
// Returned by GET /admin/parser-logs
// ------------------------------------------------------------

export type ParsingStatus = "SUCCESS" | "FAILED";

export type ParserLog = {
  id: string;
  emailSubject: string | null;
  senderEmail: string | null;
  parsingStatus: ParsingStatus | null;
  extractedAccountId: string | null;
  failureReason: string | null;
  createdAt: string;
};

// ------------------------------------------------------------
// Audit logs
// Returned by GET /admin/audit-logs
// ------------------------------------------------------------

export type AuditLog = {
  id: string;
  eventType: string;
  eventDescription: string;
  entityId: string | null;
  performedBy: string | null;
  createdAt: string;
};

// ------------------------------------------------------------
// Metrics history item (for trend chart)
// Returned by GET /admin/metrics/history
// ------------------------------------------------------------

export type MetricsHistoryItem = Metrics & {
  id: string;
  createdAt: string;
};

// ------------------------------------------------------------
// Submission detail (for drill-down page)
// Returned by GET /admin/submissions/:id
// ------------------------------------------------------------

export type FulfillmentLog = {
  id: string;
  fulfillmentType: NotificationChannel;
  deliveryStatus: "PENDING" | "SUCCESS" | "FAILED";
  providerResponse: string | null;
  createdAt: string;
};

export type SubmissionDetail = UserSubmission & {
  xmApprovedAccount: XmApprovedAccount | null;
  campaign: Campaign | null;
  fulfillmentJobs: FulfillmentJob[];
  fulfillmentLogs: FulfillmentLog[];
};

// ------------------------------------------------------------
// Livestream waitlist
// Returned by GET /admin/waitlist
// ------------------------------------------------------------

export type WaitlistStatus = "PENDING" | "SENT" | "FAILED";

export type LivestreamWaitlistEntry = {
  id: string;
  name: string;
  surname: string;
  email: string;
  xmAccountId: string;
  status: WaitlistStatus;
  joinedAt: string;
  sentAt: string | null;
};
