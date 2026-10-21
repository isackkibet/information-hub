import { Task } from "@/types";

export const tasks: Task[] = [
  { id: "tsk-001", title: "Review article: Restoring Lake Victoria Wetlands", description: "Editorial review for clarity, accuracy and adherence to SIHU guidelines.", assigneeId: "u-editor", assigneeName: "Akinyi Ochieng (Demo Editor)", roleRequired: "Editor", status: "in_progress", dueDate: "2025-10-22", createdAt: "2025-09-28T10:00:00Z" },
  { id: "tsk-002", title: "Verify report: Suspected illegal fishing nets", description: "Collect evidence summary and assess verification steps with relevant contacts.", assigneeId: "u-verifier", assigneeName: "Otieno Mwangi (Demo Verifier)", roleRequired: "Verifier", status: "assigned", dueDate: "2025-10-23", createdAt: "2025-09-27T11:00:00Z" },
  { id: "tsk-003", title: "Check category structure for new topics", description: "Review proposed categorization and ensure alignment with SIHU focus areas.", assigneeId: "u-admin", assigneeName: "SIHU Admin (Demo)", roleRequired: "Administrator", status: "assigned", dueDate: "2025-10-24", createdAt: "2025-09-29T09:00:00Z" },
];
