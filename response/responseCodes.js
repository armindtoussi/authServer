module.exports = 
{
    ERROR_MSG: 
    {
        FAIL_REGISTER_INCOMPLETE_CREDS: "User not registered due to incomplete credentials", //
        FAIL_REGISTER_UNAME_NOT_UNIQUE: "User was not registered due to duplicate username in database", //
        FAIL_REGISTER_EMAIL_NOT_UNIQUE: "User was not registered due to duplicate email", //
        FAIL_REGISTER_SQL_ERROR: "User was not registered due to database error", //
        FAIL_AUTH_NO_CREDS: "Unable to authenticate user due to missing credentials",//
        FAIL_AUTH_WRONG_CREDS: "Unable to authenticate user due to incorrect credential pair", //
        FAIL_TOKEN_ISSUE: "Unable to issue token",//
        FAIL_DB_CONNECTION: "Getting a pool connection to database failed", //
        FAIL_DB_END_CONNECTION: "Pool connection to database end ended ungracefully", //
        FAIL_DB_TRANSACTION: "There was an issue with the database transaction", //
        FAIL_DB_ERR: "Database unable to complete transaction", // generic database error.
        FAIL_REG_UNKNOWN: "User registration failed due to unknown circumstances",// 
        FAIL_SERVER_ACTION: "Unknown server error occured", //
        FAIL_DEFAULT: "Unknown failed request, default response", //
        FAIL_ADMIN_HEADERS: "Admin request did not contain appropriate authorization header", //
        FAIL_ADMIN_AUTH_MISS_CREDS: "Admin authentication failed due to some missing credential in authorization headers", //
        FAIL_ADMIN_AUTH_INCOMPLETE_CREDS: "Admin authentication failed either due to incorrect credential pair or user not having authorization to enter admin area", //
        FAIL_ADMIN_EMAIL_USER_NOT_EXIST: "Admin request couldn't get email as user or email does not exist", // 
        FAIL_ADMIN_EMAIL_NO_UNAME: "Admin request could not be completed as request body was not populated with 'uname' attribute", //
        FAIL_ADMIN_NO_EMAIL_SUBS: "Admin request could not get emails as no users are subscribed to email list", //
        FAIL_PROFILE_RETRIEVAL_NO_EXIST: "Could not get user profile as username does not exist", //
        FAIL_PROFILE_UPDATE_NO_BODY: "No profile parameters were supplied to update profile", //
        FAIL_PROFILE_UPDATE_NO_USER: "Profile update failed, user does not exist", //
        FAIL_PASSWORD_RESET_NO_BODY: "No password parameters were supplied to change password", //
    },
    ERROR_CODE: 
    {
        ERR_NOT_REGISTERED: "err/not-registered", //
        ERR_DUPLICATE_UNAME: "err/duplicate-username",//
        ERR_DUPLICATE_EMAIL: "err/duplicate-email",//
        ERR_REG_SQL_FAILURE: "err/sql-issue", //
        ERR_MISSING_CREDS: "err/missing-credentials",//
        ERR_FAIL_AUTH: "err/auth-failed", //
        ERR_TOKEN_ISSUE_FAIL: "err/issue-token-failure",//
        ERR_DB_CONNECT: "err/db-connection", //
        ERR_DB_DISCONNECT: "err/db-disconnection", //
        ERR_DB_TRANSACTION: "err/db-transaction-fail", //
        ERR_GENERIC_DB_ERR: "err/db-transaction",// generic db err. 
        ERR_REG_UNKNOWN: "err/reg-fail-unknown", //
        ERR_SERVER_ERR: "err/server-err", //
        ERR_DEFAULT: "err/default-unknown", //
        ERR_ADMIN_HEADER_FAIL: "err/no-auth-headers", //
        ERR_ADMIN_MISS_CREDS: "err/missing-auth-creds", // 
        ERR_ADMIN_AUTH_FAIL_INCOMPLETE: "err/failed-admin-auth", // 
        ERR_ADMIN_EMAIL_NO_EXIST: "err/no-user-email", //
        ERR_ADMIN_EMAIL_NO_BODY: "err/no-req-body", //
        ERR_ADMIN_NO_SUBBED_USERS: "err/no-email-subs", //
        ERR_PROFILE_NO_EXIST: "err/no-profile-exists", //
        ERR_POFILE_UPDATE_NO_BODY: "err/no-update-profile-body", //
        ERR_PROFILE_UPDATE_NO_USER: "err/no-user", //
        ERR_PASS_RESET_NO_BODY: "err/no-pass-data", //
    },
    SUCCESS_MSG:
    {
        SUCCESS_REGISTER: "User registered sucessfully",
        SUCCESS_LOGIN: "Authentication successful, user logged in",
        GET_EMAIL_SUCCESS: "Admin request get email succeeded",
        SUCCESS_EMAIL_VERIFY: "Email successfully verified, thank you", 
        SUCCESS_PROFILE_RETRIEVAL: "Profile successfully retrieved", 
        SUCCESS_PROFILE_UPDATE: "Profile updated successfully", 
        SUCCESS_PASSWORD_CHANGE: "Password successfully changed"
    }
}

    