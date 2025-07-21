// 🛡️ Security Layer - Because with great power comes great responsibility
// We don't want Claude sending emails to your ex at 3am

export class SecurityManager {
  constructor() {
    this.whitelist = new Set();
    this.blacklist = new Set();
    this.permissions = new Map();
    this.auditLog = [];
    this.rateLimits = new Map();
  }

  // Initialize security settings
  async initialize() {
    // Load from config file if exists
    try {
      const configPath = `${process.env.HOME}/.automator-mcp/security.json`;
      const config = await fs.readFile(configPath, 'utf8');
      const settings = JSON.parse(config);
      
      this.whitelist = new Set(settings.whitelist || []);
      this.blacklist = new Set(settings.blacklist || []);
      this.permissions = new Map(settings.permissions || []);
    } catch (error) {
      // Use defaults if no config
      this.setDefaultPermissions();
    }
  }

  // Default safe permissions
  setDefaultPermissions() {
    this.permissions.set('email', {
      enabled: true,
      requireConfirmation: true,
      allowedDomains: [],
      maxPerDay: 10
    });

    this.permissions.set('file_system', {
      enabled: true,
      allowedPaths: [
        `${process.env.HOME}/Desktop`,
        `${process.env.HOME}/Documents`,
        `${process.env.HOME}/Downloads`
      ],
      forbiddenPaths: [
        `${process.env.HOME}/.ssh`,
        `${process.env.HOME}/.gnupg`,
        '/System',
        '/Library'
      ]
    });

    this.permissions.set('applications', {
      enabled: true,
      allowedApps: [
        'Finder',
        'Safari',
        'Mail',
        'Calendar',
        'Notes',
        'Preview'
      ],
      forbiddenApps: [
        'System Preferences',
        'Terminal',
        'Activity Monitor'
      ]
    });
  }

  // Check if action is allowed
  async checkPermission(action, details) {
    // Log all attempts
    this.auditLog.push({
      timestamp: new Date(),
      action,
      details,
      allowed: null
    });

    // Check rate limits
    if (!this.checkRateLimit(action)) {
      this.auditLog[this.auditLog.length - 1].allowed = false;
      throw new Error(`Rate limit exceeded for ${action}`);
    }

    // Check specific permissions
    switch (action) {
      case 'send_email':
        return this.checkEmailPermission(details);
      
      case 'file_operation':
        return this.checkFilePermission(details);
      
      case 'run_application':
        return this.checkApplicationPermission(details);
      
      case 'execute_script':
        return this.checkScriptPermission(details);
      
      default:
        return this.checkGenericPermission(action, details);
    }
  }

  // Email-specific security
  async checkEmailPermission(details) {
    const emailPerms = this.permissions.get('email');
    
    if (!emailPerms.enabled) {
      throw new Error('Email sending is disabled');
    }

    // Check blacklist
    if (this.blacklist.has(details.to)) {
      throw new Error(`Email to ${details.to} is blocked`);
    }

    // Check whitelist (if configured)
    if (this.whitelist.size > 0 && !this.whitelist.has(details.to)) {
      throw new Error(`Email to ${details.to} is not whitelisted`);
    }

    // Check domain restrictions
    if (emailPerms.allowedDomains.length > 0) {
      const domain = details.to.split('@')[1];
      if (!emailPerms.allowedDomains.includes(domain)) {
        throw new Error(`Domain ${domain} is not allowed`);
      }
    }

    // Require confirmation for first-time recipients
    if (emailPerms.requireConfirmation && !this.hasEmailedBefore(details.to)) {
      return {
        allowed: true,
        requiresConfirmation: true,
        message: `First time emailing ${details.to}. Please confirm.`
      };
    }

    return { allowed: true };
  }

  // File system security
  checkFilePermission(details) {
    const filePerms = this.permissions.get('file_system');
    
    if (!filePerms.enabled) {
      throw new Error('File operations are disabled');
    }

    const path = details.path;

    // Check forbidden paths
    for (const forbidden of filePerms.forbiddenPaths) {
      if (path.startsWith(forbidden)) {
        throw new Error(`Access to ${path} is forbidden`);
      }
    }

    // Check allowed paths
    const inAllowedPath = filePerms.allowedPaths.some(allowed => 
      path.startsWith(allowed)
    );

    if (!inAllowedPath) {
      throw new Error(`Path ${path} is not in allowed directories`);
    }

    return { allowed: true };
  }

  // Application security
  checkApplicationPermission(details) {
    const appPerms = this.permissions.get('applications');
    
    if (!appPerms.enabled) {
      throw new Error('Application control is disabled');
    }

    const appName = details.application;

    if (appPerms.forbiddenApps.includes(appName)) {
      throw new Error(`Application ${appName} is forbidden`);
    }

    if (appPerms.allowedApps.length > 0 && !appPerms.allowedApps.includes(appName)) {
      throw new Error(`Application ${appName} is not whitelisted`);
    }

    return { allowed: true };
  }

  // Script execution security
  checkScriptPermission(details) {
    const script = details.script;

    // Dangerous patterns to block
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,  // Recursive delete from root
      /sudo/,           // Sudo commands
      /passwd/,         // Password changes
      /ssh\s+/,         // SSH connections
      /curl.*\|.*sh/,   // Curl pipe to shell
      />\/dev\/sda/,    // Direct disk writes
      /dd\s+if=/,       // DD commands
      /mkfs/,           // Format filesystem
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(script)) {
        throw new Error('Script contains dangerous commands');
      }
    }

    return { allowed: true };
  }

  // Rate limiting
  checkRateLimit(action) {
    const key = `${action}:${new Date().toISOString().split('T')[0]}`;
    const current = this.rateLimits.get(key) || 0;
    
    const limits = {
      send_email: 10,
      file_operation: 100,
      run_application: 50,
      execute_script: 30
    };

    const limit = limits[action] || 50;

    if (current >= limit) {
      return false;
    }

    this.rateLimits.set(key, current + 1);
    return true;
  }

  // Check if we've emailed this address before
  hasEmailedBefore(address) {
    return this.auditLog.some(log => 
      log.action === 'send_email' && 
      log.details.to === address && 
      log.allowed === true
    );
  }

  // Generic permission check
  checkGenericPermission(action, details) {
    // For unknown actions, be conservative
    return {
      allowed: true,
      requiresConfirmation: true,
      message: `Unknown action ${action}. Please confirm.`
    };
  }

  // Get audit log
  getAuditLog(filter = {}) {
    let logs = [...this.auditLog];

    if (filter.action) {
      logs = logs.filter(log => log.action === filter.action);
    }

    if (filter.startDate) {
      logs = logs.filter(log => log.timestamp >= filter.startDate);
    }

    if (filter.allowed !== undefined) {
      logs = logs.filter(log => log.allowed === filter.allowed);
    }

    return logs;
  }

  // Add to whitelist
  addToWhitelist(item) {
    this.whitelist.add(item);
    this.saveConfig();
  }

  // Add to blacklist
  addToBlacklist(item) {
    this.blacklist.add(item);
    this.saveConfig();
  }

  // Save configuration
  async saveConfig() {
    const config = {
      whitelist: Array.from(this.whitelist),
      blacklist: Array.from(this.blacklist),
      permissions: Array.from(this.permissions.entries())
    };

    const configPath = `${process.env.HOME}/.automator-mcp/security.json`;
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }
}

// Export singleton
export const security = new SecurityManager();

// 🔐 Security decorators for actions
export function requirePermission(action) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const permission = await security.checkPermission(action, args[0]);
      
      if (!permission.allowed) {
        throw new Error(`Permission denied for ${action}`);
      }

      if (permission.requiresConfirmation) {
        // In real implementation, this would trigger a UI confirmation
        console.log(`⚠️  ${permission.message}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}