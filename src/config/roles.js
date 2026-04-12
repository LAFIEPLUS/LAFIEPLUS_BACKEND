/**
 * RBAC - Role definitions and permissions for LAFIEPLUS
 * 
 * ROLES:
 * user - regular platform user (symptom checker, health library, reminders, facility locator)
 * physician - healthcare provider with access to patient management features
 * admin - platform administrator with full access to all features and user management
 * 
 */

export const ROLES = {
    USER: "user",
    PARTNER: "partner",
    ADMIN: "admin",
};

export const PERMISSIONS = {
    // --- Profile
    READ_OWN_PROFILE: "read:own_profile",
    UPDATE_OWN_PROFILE: "update:own_profile",

    // --- Users (admin only)
    READ_ALL_USERS: "read:all_users",
    UPDATE_ANY_USER: "update:any_user",
    DELETE_ANY_USER: "delete:any_user",
    NOTIFY_USER: "notify_user",

    // --- Symptom Checker
    USE_SYMPTOM_CHECKER: "use:symptom_checker",

    // --- Consultations
    REQUEST_CONSULTATION: "request:consultation",
    CONDUCT_CONSULTATION: "conduct:consultation",
    VIEW_CONSULTATIONS: "view:consultations",

    // --- Health Library
    READ_HEALTH_CONTENT: "read:health_content",
    CREATE_HEALTH_CONTENT: "create:health_content",
    UPDATE_HEALTH_CONTENT: "update:health_content",
    DELETE_HEALTH_CONTENT: "delete:health_content",

    // --- Reminders
    MANAGE_OWN_REMINDERS: "manage:own_reminders",

    // --- Facilities
    READ_FACILITY_INFO: "read:facility_info",
    READ_FACILITIES: "read:facilities",
    CREATE_FACILITY_INFO: "create:facility_info",
    UPDATE_FACILITY_INFO: "update:facility_info",
    DELETE_FACILITY_INFO: "delete:facility_info",
    MANAGE_FACILITIES: "manage:facilities",

    // --- Referrals
    CREATE_REFERRAL: "create:referral",
    MANAGE_REFERRALS: "manage:referrals",
    TRACK_REFERRAL: "track:referral",

    // --- Admin Dashboard
    ACCESS_ADMIN_DASHBOARD: "access:admin_dashboard",
    VIEW_ANALYTICS: "view:analytics",
    MANAGE_CONTENT: "manage:content",
    MANAGE_USERS: "manage:users",

    // --- Analytics
    VIEW_ANALYTICS: "view:analytics",

};

// Permission mapping for each role
export const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        PERMISSIONS.READ_OWN_PROFILE,
        PERMISSIONS.UPDATE_OWN_PROFILE,
        PERMISSIONS.USE_SYMPTOM_CHECKER,
        PERMISSIONS.READ_HEALTH_CONTENT,
        PERMISSIONS.READ_FACILITY_INFO,
        PERMISSIONS.READ_FACILITIES,
        PERMISSIONS.REQUEST_CONSULTATION,
        PERMISSIONS.VIEW_CONSULTATIONS,
        PERMISSIONS.CREATE_REFERRAL,
        PERMISSIONS.TRACK_REFERRAL,
    ],
    [ROLES.PARTNER]: [
        PERMISSIONS.READ_OWN_PROFILE,
        PERMISSIONS.UPDATE_OWN_PROFILE,
        PERMISSIONS.READ_HEALTH_CONTENT,
        PERMISSIONS.CREATE_HEALTH_CONTENT,
        PERMISSIONS.UPDATE_HEALTH_CONTENT,
        PERMISSIONS.DELETE_HEALTH_CONTENT,
        PERMISSIONS.READ_FACILITY_INFO,
        PERMISSIONS.READ_FACILITIES,
        PERMISSIONS.MANAGE_FACILITIES,
        PERMISSIONS.CONDUCT_CONSULTATION,
        PERMISSIONS.VIEW_CONSULTATIONS,
        PERMISSIONS.MANAGE_REFERRALS,
        PERMISSIONS.TRACK_REFERRAL,
        PERMISSIONS.VIEW_ANALYTICS,
    ],
    // [ROLES.ADMIN]: [
    //     PERMISSIONS.READ_OWN_PROFILE,
    //     PERMISSIONS.UPDATE_OWN_PROFILE,
    //     PERMISSIONS.USE_SYMPTOM_CHECKER,
    //     PERMISSIONS.READ_HEALTH_CONTENT,
    //     PERMISSIONS.MANAGE_OWN_REMINDERS,
    //     PERMISSIONS.READ_FACILITY_INFO,
    //     PERMISSIONS.CREATE_REFERRAL,
    //     PERMISSIONS.TRACK_REFERRAL,
    //     PERMISSIONS.READ_ALL_USERS,
    //     PERMISSIONS.UPDATE_ANY_USER,
    //     PERMISSIONS.DELETE_ANY_USER,
    //     PERMISSIONS.NOTIFY_USER,
    //     PERMISSIONS.CREATE_HEALTH_CONTENT,
    //     PERMISSIONS.UPDATE_HEALTH_CONTENT,
    //     PERMISSIONS.DELETE_HEALTH_CONTENT,
    //     PERMISSIONS.CREATE_FACILITY_INFO,
    //     PERMISSIONS.UPDATE_FACILITY_INFO,
    //     PERMISSIONS.DELETE_FACILITY_INFO,
    //     PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
    //     PERMISSIONS.VIEW_ANALYTICS,
    //     PERMISSIONS.MANAGE_CONTENT,
    //     PERMISSIONS.MANAGE_USERS,
    // ],

    [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin have all permissions except user management
};

/**
 * Check if a role has a specific permission
 * @param {string} role - Role to check
 * @param {string} permission - Permission to check for
 */

export const hasPermission = (role, permission) => {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};