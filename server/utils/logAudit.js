import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({
  action,
  userId,
  targetId,
  targetType,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      action,
      user: userId,
      targetId,
      targetType,
      metadata,
    });
  } catch (err) {
    console.error("❌ Failed to log audit action:", err);
  }
};
