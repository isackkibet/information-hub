import { AuditEvent } from "@/types";

export const auditEvents: AuditEvent[] = [
  { id: "ae-001", action: "user.role_changed", actorId: "u-admin", actorName: "SIHU Admin (Demo)", targetType: "user", targetId: "u-contrib", targetLabel: "Naomi Wambui (Demo Contributor)", timestamp: "2025-09-28T12:00:00Z", details: "Role maintained as Contributor (demo)" },
  { id: "ae-002", action: "article.submitted", actorId: "u-contrib", actorName: "Naomi Wambui (Demo Contributor)", targetType: "article", targetId: "art-001", targetLabel: "Restoring Lake Victoria Wetlands", timestamp: "2025-09-27T09:30:00Z", details: "Submitted for editorial review (demo)" },
  { id: "ae-003", action: "article.approved", actorId: "u-editor", actorName: "Akinyi Ochieng (Demo Editor)", targetType: "article", targetId: "art-001", targetLabel: "Restoring Lake Victoria Wetlands", timestamp: "2025-09-28T11:15:00Z", details: "Approved for publication (demo)" },
  { id: "ae-004", action: "category.updated", actorId: "u-admin", actorName: "SIHU Admin (Demo)", targetType: "category", targetId: "cat-env", targetLabel: "Environment & Conservation", timestamp: "2025-09-26T14:00:00Z", details: "Description updated (demo)" },
  { id: "ae-005", action: "report.submitted", actorId: "u-reg", actorName: "James Odhiambo (Demo User)", targetType: "report", targetId: "rep-001", targetLabel: "Blocked drainage causing flooding", timestamp: "2025-09-25T08:05:00Z", details: "Submitted via community reporting (demo)" },
];
