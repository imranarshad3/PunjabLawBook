export function adminWriteError(role: unknown, table: string): string {
  if (!["owner", "admin", "editor"].includes(String(role))) return "Your role has read-only access.";
  if (table === "admin_members" && role !== "owner") return "Only an owner can manage team membership.";
  if (["store_settings", "admin_invitations"].includes(table) && role === "editor") return "Only an owner or admin can change these settings.";
  return "";
}
