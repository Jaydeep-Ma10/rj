import { prisma } from '../prisma/client.js';
import { logger } from '../utils/logger.js';

// Audit action types
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_LOCKED: 'account_locked',
  
  // Financial
  DEPOSIT_REQUEST: 'deposit_request',
  DEPOSIT_APPROVED: 'deposit_approved',
  DEPOSIT_REJECTED: 'deposit_rejected',
  WITHDRAW_REQUEST: 'withdraw_request',
  WITHDRAW_APPROVED: 'withdraw_approved',
  WITHDRAW_REJECTED: 'withdraw_rejected',
  
  // Gaming
  BET_PLACED: 'bet_placed',
  BET_WON: 'bet_won',
  BET_LOST: 'bet_lost',
  ROUND_CREATED: 'round_created',
  ROUND_SETTLED: 'round_settled',
  
  // KYC
  KYC_SUBMITTED: 'kyc_submitted',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  
  // Admin
  ADMIN_LOGIN: 'admin_login',
  USER_SUSPENDED: 'user_suspended',
  USER_UNSUSPENDED: 'user_unsuspended',
  SYSTEM_CONFIG_CHANGED: 'system_config_changed',
  
  // Security
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token'
};

// Audit status types
export const AUDIT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
};

/**
 * Log an audit event
 * @param {Object} params - Audit parameters
 * @param {string} params.action - Action type from AUDIT_ACTIONS
 * @param {string} params.status - Status from AUDIT_STATUS
 * @param {number} [params.userId] - User ID (if applicable)
 * @param {number} [params.adminId] - Admin ID (if applicable)
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @param {Object} [params.metadata] - Additional context data
 * @param {string} [params.error] - Error message (if failed)
 */
export async function logAuditEvent({
  action,
  status,
  userId = null,
  adminId = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
  error = null
}) {
  try {
    // Validate required parameters
    if (!action || !status) {
      throw new Error('Action and status are required for audit logging');
    }

    // Sanitize metadata to prevent large objects
    let sanitizedMetadata = metadata;
    if (metadata && typeof metadata === 'object') {
      sanitizedMetadata = JSON.parse(JSON.stringify(metadata, null, 0));
      
      // Limit metadata size
      const metadataString = JSON.stringify(sanitizedMetadata);
      if (metadataString.length > 10000) {
        sanitizedMetadata = { 
          ...sanitizedMetadata, 
          _truncated: true,
          _originalSize: metadataString.length 
        };
      }
    }

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        status,
        userId,
        adminId,
        ipAddress,
        userAgent,
        metadata: sanitizedMetadata,
        error
      }
    });

    // Also log to application logger for immediate visibility
    logger.info('Audit event logged', {
      auditId: auditLog.id,
      action,
      status,
      userId,
      adminId,
      ipAddress: ipAddress ? `${ipAddress.substring(0, 8)}***` : null
    });

    return auditLog;
  } catch (auditError) {
    // If audit logging fails, log the error but don't throw
    // to prevent breaking the main application flow
    logger.error('Failed to log audit event', {
      error: auditError.message,
      action,
      status,
      userId,
      adminId
    });
    
    return null;
  }
}

/**
 * Log user authentication event
 */
export async function logAuthEvent(action, status, userId, req, error = null) {
  return logAuditEvent({
    action,
    status,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    error
  });
}

/**
 * Log financial transaction event
 */
export async function logFinancialEvent(action, status, userId, metadata, req, error = null) {
  return logAuditEvent({
    action,
    status,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    metadata: {
      ...metadata,
      // Mask sensitive financial data
      amount: metadata.amount ? `***${metadata.amount.toString().slice(-2)}` : undefined
    },
    error
  });
}

/**
 * Log gaming event
 */
export async function logGamingEvent(action, status, userId, metadata, req, error = null) {
  return logAuditEvent({
    action,
    status,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    metadata,
    error
  });
}

/**
 * Log admin action
 */
export async function logAdminEvent(action, status, adminId, metadata, req, error = null) {
  return logAuditEvent({
    action,
    status,
    adminId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    metadata,
    error
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(action, status, userId, req, metadata = null, error = null) {
  return logAuditEvent({
    action,
    status,
    userId,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      severity: 'high'
    },
    error
  });
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs({
  userId = null,
  adminId = null,
  action = null,
  status = null,
  startDate = null,
  endDate = null,
  page = 1,
  limit = 50
}) {
  try {
    const where = {};
    
    if (userId) where.userId = userId;
    if (adminId) where.adminId = adminId;
    if (action) where.action = action;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, mobile: true }
          },
          admin: {
            select: { id: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to fetch audit logs', {
      error: error.message,
      userId,
      adminId,
      action,
      status
    });
    throw error;
  }
}

/**
 * Clean up old audit logs (for GDPR compliance)
 */
export async function cleanupOldAuditLogs(retentionDays = 365) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleted = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    logger.info('Cleaned up old audit logs', {
      deletedCount: deleted.count,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays
    });

    return deleted.count;
  } catch (error) {
    logger.error('Failed to cleanup old audit logs', {
      error: error.message,
      retentionDays
    });
    throw error;
  }
}
