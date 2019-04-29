const userAdmin       = require('./admin');
const admin           = require('firebase-admin');
const RESPONSE_MSG    = require('../response/responseCodes');
const responseHandler = require('../response/responseHandler');
const winston         = require('../config/winston');

//Loggin config.
const shortid = require('shortid');
const tag     = 'AdminRouterMethods.js';

module.exports = 
{
    getSingleEmail: getSingleEmail,
    getAllEmails: getAllEmails,
    login: login
};

function login(req, res)
{
    let funcTag = "Login():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to login the admin`);

    let authHeaders = parseAuthHeaders(req, res, uuid);

    return authorizeAdmin(authHeaders, res, uuid)
        .then(
            (result) =>
            {
                if(result)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, admin user successfully authenticated, attempting to issue token`);
                    return issueToken(authHeaders.username, uuid);
                }
            }
        ).then(
            (token) =>
            {
                if(token)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, token successfullly issued to authenticated admin user`);
                    return responseHandler.responseHandler(res, undefined, uuid, token);
                }
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, User authentication Error: ${error}`);

                error = RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH;
                return responseHandler.responseHandler(res, error, uuid);
            }
        )
}

function getSingleEmail(req, res) 
{
    let funcTag = "GetSingleEmail():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to get a single email`);

    let authHeaders = parseAuthHeaders(req, res, uuid); 
    let username    = parseEmailRequest(req, res, uuid);

    if(authHeaders !== undefined && username !== undefined) 
    {
        return authorizeAdmin(authHeaders, res, uuid)
            .then(
                (result) => 
                {
                    if(result)
                    {
                        return getEmailHandler(res, username, uuid);
                    }
                }
            ).catch(
                (error) =>
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, unknown server error occurred`);
                    
                    error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                    return responseHandler.responseHandler(res, error, uuid);
                }
            );
    }
}

function getAllEmails(req, res)
{
    let funcTag = "getAllEmails():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to get all emails that have subscribed`);

    let authHeaders = parseAuthHeaders(req, res, uuid);

    if(authHeaders !== undefined)
    {
        return authorizeAdmin(authHeaders, res, uuid)
            .then(
                (result) => 
                {
                    if(result !== undefined)
                    {   
                        return getAllEmailsHandler(res, uuid);
                    }
                }
            ).catch(
                (error) => 
                {
                    error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                    return responseHandler.responseHandler(res, error, uuid);
                }
            );
    }
}

function authorizeAdmin(authHeaders, res, uuid)
{
    let funcTag = "AuthorizeAdmin():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, and attempting to authorize as admin`);

    if(authHeaders.username && authHeaders.password)
    {
        return userAdmin.authenticateAdmin(authHeaders, uuid)
            .then(
                (result) =>
                {
                    if(result)
                    {
                        winston.info(`[${uuid}] ${tag} ${funcTag}, admin successfully authenticated`);
                        return true;
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, admin was not authenticated due to incorrect credentials or lacks access to admin area`);

                    let error = RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_AUTH_FAIL_INCOMPLETE;
                    return responseHandler.responseHandler(res, error, uuid);
                }
            ).catch(
                (error) => 
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, Admin authentication Error: ${error}`);
                    error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;

                    return responseHandler.responseHandler(res, error, uuid);
                }
            );
    }

    winston.info(`[${uuid}] ${tag} ${funcTag}, admin not authenticated due to incomplete credentials`);
    
    let error = RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_MISS_CREDS;
    return new Promise(
        (resolve, reject) =>
        {
            return responseHandler.responseHandler(res, error, uuid);
        }
    )
}

function parseAuthHeaders(req, res, uuid)
{
    let funcTag = "ParseAuthHeaders():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to parse auth headers`);

    let authHeader = req.headers.authorization; 

    if(authHeader === undefined) 
    {
        let error = RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_HEADER_FAIL;
        winston.info(`[${uuid}] ${tag} ${funcTag}, admin access failed due to lack of authorization headers`);

        return responseHandler.responseHandler(res, error, uuid);
    }

    let auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    
    return {
        username: auth[0],
        password: auth[1]
    };
}

function parseEmailRequest(req, res, uuid)
{
    let funcTag = "ParseEmailRequest():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to parse email request`);

    if(req.query.uname) 
    {
        return req.query.uname;
    }

    winston.info(`[${uuid}] ${tag} ${funcTag}, request body did not contain 'uname' attribute, sending response`);
    
    let error = RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_EMAIL_NO_BODY;
    return responseHandler.responseHandler(res, error, uuid);
}

function getEmailHandler(res, username, uuid)
{
    let funcTag = "GetEmailHandler():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to retrieve the email address`);

    return userAdmin.getEmail(username, uuid)
        .then(
            (result) =>
            {
                if(result !== undefined) 
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, email found, and sending response`);
                    
                    let code = RESPONSE_MSG.SUCCESS_MSG.GET_EMAIL_SUCCESS;
                    return responseHandler.responseHandler(res, code, uuid, undefined, result);
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, email not found, user or email does not exist`);

                let error = RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_EMAIL_NO_EXIST;
                return responseHandler.responseHandler(res, error, uuid);
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, some error occurred while trying to get fetch email, Error: ${error}`);
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function getAllEmailsHandler(res, uuid) 
{
    let funcTag = "GetAllEmailsHandler():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to get all subbed emails`);

    return userAdmin.getAllEmails(uuid)
        .then(
            (result) =>
            {
                if(result.length > 0) 
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, emails retrieved, send response`);

                    let code = RESPONSE_MSG.SUCCESS_MSG.GET_EMAIL_SUCCESS;
                    return responseHandler.responseHandler(res, code, uuid, undefined, result);
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, email not found, no subbed users must exist`);
                
                let code = RESPONSE_MSG.ERROR_CODE.ERR_ADMIN_NO_SUBBED_USERS;
                return responseHandler.responseHandler(res, code, uuid);
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, some error occurred while trying to retrieve emails, Error: ${error}`);

                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function issueToken(adminName, uuid)
{
    let funcTag = "IssueToken():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, attempting to issue token to authorized admin`);

    let customClaims = {
        admin: true,
    };

    return admin.auth().createCustomToken(adminName, customClaims)
        .catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, error issuing token to authenticated user: Error: ${error}`);
                throw error;
            }
        );
}