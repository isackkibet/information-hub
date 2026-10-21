import { Report } from "@/types";

export const reports: Report[] = [
  { id: "rep-001", title: "Blocked drainage causing flooding near Kisumu beach", description: "Blocked culverts after heavy rains are causing water to back up near the landing site, affecting traders.", categoryId: "cat-dev", categoryName: "Community Development", location: "Kisumu Central, Kisumu County", status: "under_review", submittedAt: "2025-09-25T08:00:00Z", submittedByName: "Community Member (Demo)", hasAttachment: false },
  { id: "rep-002", title: "Suspected illegal fishing nets observed at night", description: "Use of undersized mesh nets observed at a landing site. Request verification and follow-up.", categoryId: "cat-blue", categoryName: "Blue Economy", location: "Mbita, Homa Bay County", status: "submitted", submittedAt: "2025-09-26T09:15:00Z", submittedByName: "Community Member (Demo)", hasAttachment: false },
  { id: "rep-003", title: "Encroachment into wetland area", description: "Clearing of papyrus vegetation for farming appears to be expanding into a protected wetland buffer.", categoryId: "cat-env", categoryName: "Environment & Conservation", location: "Nyando, Kisumu County", status: "needs_info", submittedAt: "2025-09-24T14:00:00Z", submittedByName: "Community Member (Demo)", hasAttachment: false },
];
