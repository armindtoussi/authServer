const RESPONSE_MSG = require('./responseCodes');
const winston      = require('../config/winston');

const tag = `ResponseHandler.js:`;

module.exports =
{
    responseHandler: responseHandler,
}

function responseHandler(res, resultCode, uuid, token, getResult)
{
    let funcTag = "responseHandler():";
    let message;

    if(token)
    {
        return sendResponse(res, token, RESPONSE_MSG.SUCCESS_MSG.SUCCESS_LOGIN, uuid);
    }

    switch(resultCode)
    {
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_REGISTER:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user registration successful`);

            message = RESPONSE_MSG.SUCCESS_MSG.SUCCESS_REGISTER;
            return sendResponse(res, message, message, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_NOT_REGISTERED:
            winston.info(`[${uuid}] ${tag} ${funcTag}, User registration failed, error: ${resultCode}`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_REGISTER_INCOMPLETE_CREDS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_UNAME:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user registration failed due to duplicate username`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_REGISTER_UNAME_NOT_UNIQUE;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_EMAIL:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user registration failed due to duplicate email`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_REGISTER_EMAIL_NOT_UNIQUE;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_REG_SQL_FAILURE:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user registration failed due to unknown sql error`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_REGISTER_SQL_ERROR;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_MISSING_CREDS:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user login failed due to missing credentials`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_AUTH_NO_CREDS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH: 
            winston.info(`[${uuid}] ${tag} ${funcTag}, user was not authenticated due to incorrect credentials`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_AUTH_WRONG_CREDS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_TOKEN_ISSUE_FAIL:
            winston.info(`[${uuid}] ${tag} ${funcTag}, there was a failure issuing a JWT token`);
            
            message = RESPONSE_MSG.ERROR_MSG.FAIL_TOKEN_ISSUE;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_GENERIC_DB_ERR:
            winston.info(`[${uuid}] ${tag} ${funcTag}, there was an unknown database issue`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_DB_ERR;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_REG_UNKNOWN:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user registration failed due to unknown circumstances`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_REG_UNKNOWN;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR:
            winston.info(`[${uuid}] ${tag} ${funcTag}, unknown internal server error`);
            
            message = RESPONSE_MSG.ERROR_MSG.FAIL_SERVER_ACTION;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_HEADER_FAIL: 
            winston.info(`[${uuid}] ${tag} ${funcTag}, admin access failed because lack of authorization header`);
            
            message = RESPONSE_MSG.ERROR_MSG.FAIL_ADMIN_HEADERS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_MISS_CREDS:
            winston.info(`[${uuid}] ${tag} ${funcTag}, admin access failed because lack of authorization header`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_ADMIN_AUTH_MISS_CREDS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_AUTH_FAIL_INCOMPLETE:
            winston.info(`[${uuid}] ${tag} ${funcTag}, Admin authentication failed, because of incorrect credentials or lack of clearance for admin functions`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_ADMIN_AUTH_INCOMPLETE_CREDS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.SUCCESS_MSG.GET_EMAIL_SUCCESS:
            winston.info(`[${uuid}] ${tag} ${funcTag}, admin request for single email successful`);

            return sendResponse(res, getResult, resultCode, uuid);
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_EMAIL_VERIFY: 
            winston.info(`[${uuid}] ${tag} ${funcTag}, email verification was successful`);

            message = RESPONSE_MSG.SUCCESS_MSG.SUCCESS_EMAIL_VERIFY;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_EMAIL_NO_EXIST:
            winston.info(`[${uuid}] ${tag} ${funcTag}, admin request succeeded, but no such email or user exists`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_ADMIN_EMAIL_USER_NOT_EXIST;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_EMAIL_NO_BODY:
            winston.info(`[${uuid}] ${tag} ${funcTag}, admin request failed due to lack of request body property 'uname'`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_ADMIN_EMAIL_NO_UNAME;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_NO_SUBBED_USERS: 
            winston.info(`[${uuid}] ${tag} ${funcTag}, admin request failed because there's no subscribed users to email list`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_ADMIN_NO_EMAIL_SUBS;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_DB_CONNECT: 
            winston.info(`[${uuid}] ${tag} ${funcTag}, attempt to connect to database failed for some unknown reason`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_DB_CONNECTION;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_DB_DISCONNECT:
            winston.info(`[${uuid}] ${tag} ${funcTag}, attempt to end database connection error, ended ungracefullly`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_DB_END_CONNECTION;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_RETRIEVAL:
            winston.info(`[${uuid}] ${tag} ${funcTag},  user profile retrieval was successful`);

            return sendResponse(res, getResult, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_NO_EXIST:
            winston.info(`[${uuid}] ${tag} ${funcTag}, user profile retrieval failed, returning error response`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_PROFILE_RETRIEVAL_NO_EXIST;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_POFILE_UPDATE_NO_BODY:
            winston.info(`[${uuid}] ${tag} ${funcTag}, no body supplied with the update profile request`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_PROFILE_UPDATE_NO_BODY;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_UPDATE_NO_USER:
            winston.info(`[${uuid}] ${tag} ${funcTag}, could not update the user profile as we could not find the user in the database`);

            message = RESPONSE_MSG.ERROR_MSG.FAIL_PROFILE_UPDATE_NO_USER;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_UPDATE:
            winston.info(`[${uuid}] ${tag} ${funcTag}, profile was successfully updated`);

            message = RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_UPDATE;
            return sendResponse(res, message, resultCode, uuid);
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PASSWORD_CHANGE: 
            winston.info(`[${uuid}] ${tag} ${funcTag}, password was changed successfully`);

            message = RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PASSWORD_CHANGE;
            return sendResponse(res, message, resultCode, uuid);
        default:
            winston.warn(`[${uuid}] ${tag} ${funcTag}, default failed request response being sent`);
            let error = RESPONSE_MSG.ERROR_CODE.ERR_DEFAULT;
            message   = RESPONSE_MSG.ERROR_MSG.FAIL_DEFAULT;
            return sendResponse(res, message, error, uuid);
    }
}

function sendResponse(res, message, error, uuid)
{
    let funcTag = "sendResponse()";
    let status  = getStatus(error, res, uuid);
    winston.info(`[${uuid}] ${tag} ${funcTag}, Sending response to client: ${status}`);

    res.status(status)
        .json(
            {
                "error": error,
                "message": message
            }
        );
}

function getStatus(code, res, uuid) 
{
    let funcTag = "getStatus():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, getting status code for response, code: ${code}`);

    let resCode;
    
    switch(code)
    {
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_REGISTER:
            resCode = 200;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_NOT_REGISTERED:
            resCode = 422; // Unprocessable entity (validation errors)

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_UNAME:
            resCode = 409; //Conflict code.

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_EMAIL:
            resCode = 409; 

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_REG_SQL_FAILURE:
            resCode = 500; //Server error code 

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
	    case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_LOGIN:
	        resCode = 200; //Success code

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_RETRIEVAL:
            resCode = 200;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_NO_EXIST:
            resCode = 404;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_MISSING_CREDS:
            resCode = 401; //Unauthorized/failed auth
            res.setHeader('WWW-Authenticate', 'Basic realm="TerraTap Technologies Oden Login"');

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH:
            resCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="TerraTap Technologies Oden Login"');

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_TOKEN_ISSUE_FAIL:
            resCode = 500;    

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_GENERIC_DB_ERR:
            resCode = 500;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_DB_CONNECT: 
            resCode = 500; 

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_DB_DISCONNECT: 
            resCode = 500;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_REG_UNKNOWN:
            resCode = 500;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR:
            resCode = 500; 

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_HEADER_FAIL: 
            resCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="TerraTap Technologies Oden Admin Authentication"');

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_MISS_CREDS: 
            resCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="TerraTap Technologies Oden Login"');

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_AUTH_FAIL_INCOMPLETE:
            resCode = 403; //Forbidden.

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.SUCCESS_MSG.GET_EMAIL_SUCCESS:
            resCode = 200;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_EMAIL_VERIFY:
            resCode = 200;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_EMAIL_NO_EXIST:
            resCode = 404;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_EMAIL_NO_BODY:
            resCode = 422; //validation errors, missing params. 

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_NO_SUBBED_USERS: 
            resCode = 404;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_POFILE_UPDATE_NO_BODY:
            resCode = 422;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_UPDATE_NO_USER:
            resCode = 404;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_UPDATE:
            resCode = 200;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        case RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PASSWORD_CHANGE: 
            resCode = 200;

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
        default:
            resCode = 500; 

            winston.info(`[${uuid}] ${tag} ${funcTag}, status code response is: ${resCode} and code is: ${code}`);
            return resCode;
    }
}
