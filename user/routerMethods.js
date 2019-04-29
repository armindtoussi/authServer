const User            = require('./user');
const admin           = require('firebase-admin');
const RESPONSE_MSG    = require('../response/responseCodes');
const responseHandler = require('../response/responseHandler');
const winston         = require('../config/winston');

//Logging config.
const shortid = require('shortid');
const tag     = `RouterMethods.js:`;

module.exports = 
{
    registerUser: registerUser,
    login: login,
    accountVerify: accountVerify,
    getUserProfile: getUserProfile,
    updateProfile: updateProfile,
    resetPassword: resetPassword,
};

function resetPassword(req, res)
{
    let funcTag = "ResetPassword():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to reset password`);

    let uname = req.params.uname;
    let pass  = parsePasswordResetBody(req, uuid);

    if(isEmpty(pass))
    {
        let error = RESPONSE_MSG.ERROR_CODE.ERR_PASS_RESET_NO_BODY;
        winston.info(`[${uuid}] ${tag} ${funcTag}, no body supplied, cannot change password`);

        return responseHandler.responseHandler(res, error, uuid);
    }

    pass.username = uname;

    return User.resetPassword(pass, uuid)
        .then(
            (result) =>
            {
                if(result === RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PASSWORD_CHANGE)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, password changed successfully, sending response`);
                    return responseHandler.responseHandler(res, result, uuid);
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, password change unsuccessful due to failed auth`);
                return responseHandler.responseHandler(res, result, uuid);
            }
        )
        .catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, error changing password, Error: ${error}`);
                
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function updateProfile(req, res)
{


    let funcTag = "UpdateProfile():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to update profile`);

    let uname = req.params.uname;
    let user  = parseProfileUpdateBody(req, uuid);

    if(isEmpty(user)) 
    {
        let error = RESPONSE_MSG.ERROR_CODE.ERR_POFILE_UPDATE_NO_BODY;
        winston.info(`[${uuid}] ${tag} ${funcTag}, no body supplied, cannot update profile`);

        return responseHandler.responseHandler(res, error, uuid);
    }
    
    user.username = uname;

    return User.updateProfile(user, uuid)
        .then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, update profile complete, returning result response`);
                return responseHandler.responseHandler(res, result, uuid);
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, error updating user profile, Error: ${error}`);
                
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function getUserProfile(req, res)
{
    let funcTag = "GetUserProfile():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to get user profile`);

    let uname = req.params.uname;
    
    return User.getUserProfile(uname, uuid)
        .then(
            (result) =>
            {
                if(result !== undefined)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, user profile successfully fetched, returning to client`);
                    let code = RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_RETRIEVAL;
                    return responseHandler.responseHandler(res, code, uuid, undefined, result);
                }

                let error = RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_NO_EXIST;
                return responseHandler.responseHandler(res, error, uuid);
            }
        ).catch(
            (error) => 
            {   
                winston.error(`[${uuid}] ${tag} ${funcTag}, error retrieving user profile form database, Error: ${error}`);
                
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function registerUser(req, res) 
{
    let funcTag = `registerUser()`;
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to register new user`);

    let user = parseRequestBody(req, uuid);

    if(isEmpty(user) || user.username === undefined || user.password === undefined) // TODO - add user 'type' check to this check. 
    {
        let error = RESPONSE_MSG.ERROR_CODE.ERR_NOT_REGISTERED;
        winston.info(`[${uuid}] ${tag} ${funcTag}, User registration failed, error: ${error}`);

        return responseHandler.responseHandler(res, error, uuid);
    }

    return checkUniqueUsername(user.username, uuid)
        .then(
            (result) =>
            {
                if(result)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, registering username is unique, attemping to register user`);
                    return User.registerUser(user, uuid);
                }
                
                winston.info(`[${uuid}] ${tag} ${funcTag}, registering username is not unique`);   
                return RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_UNAME;
            }
        ).then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, sending result of registration out for processing: ${result}`);
                return responseHandler.responseHandler(res, result, uuid);
            }
        ).catch(
            (error) => 
            {
                error = RESPONSE_MSG.ERROR_CODE.ERR_REG_SQL_FAILURE; //Needs to change.
                 
                winston.error(`[${uuid}] ${tag} ${funcTag}, User registration error: ${error}`);
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function login(req, res)   
{
    let funcTag = `login()`;
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to authenticate user`);

    let user = parseRequestBody(req, uuid);

    if(isEmpty(user) || user.username === undefined || user.password === undefined)
    {
        let error = RESPONSE_MSG.ERROR_CODE.ERR_MISSING_CREDS;
        winston.info(`[${uuid}] ${tag} ${funcTag}, user not authenticated due to incomplete credentials`);
        
        return responseHandler.responseHandler(res, error, uuid);
    }

    return User.authenticateUser(user, uuid)
        .then(
            (result) => 
            {
                if(result)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, user successfully authenticated, attempting to issue token`);

                    return issueToken(user.username, uuid)
                        .then(
                            (token) =>
                            {
                                winston.info(`[${uuid}] ${tag} ${funcTag}, token successfullly issued to authenticated user`);
                                return responseHandler.responseHandler(res, undefined, uuid, token);
                            }
                        );
                }
                winston.info(`[${uuid}] ${tag} ${funcTag}, user was not authenticated due to incorrect credentials`);

                let error = RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH;
                return responseHandler.responseHandler(res, error, uuid);   
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, User authentication Error: ${error}`);

                error = RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH;
                return responseHandler.responseHandler(res, error, uuid);
            }
        );
}

function accountVerify(req, res) 
{
    let funcTag = "AccountVerify():";
    let uuid    = shortid.generate();
    winston.info(`[${uuid}] ${tag} ${funcTag} called, verifying account in database`);

    let userHash = req.params;

    return User.verifyAccount(userHash, uuid)
    .then(
        () => 
        { 
            let msg = RESPONSE_MSG.SUCCESS_MSG.SUCCESS_EMAIL_VERIFY;
            return responseHandler.responseHandler(res, msg, uuid);
        }
    ).catch(
        (error) => 
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, error verifying account: ${error}`);

            error = RESPONSE_MSG.ERROR_CODE.ERR_GENERIC_DB_ERR;
            return responseHandler.responseHandler(res, error, uuid);
        }
    );
}

function checkUniqueUsername(username, uuid)
{   
    let funcTag = "checkUniqueUsername()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, checking that username is unique`);

    return User.checkUniqueUsername(username, uuid)
        .then(
            (result) =>
            {
                if(result)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, username is unique.`);
                    return true;
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, username is not unique`);
                return false;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, checking for unique username Error:  ${error}`);
                throw error;
            }
        );
} 

function issueToken(username, uuid)
{
    let funcTag = `issueToken()`;
    winston.info(`[${uuid}] ${tag} ${funcTag}, attempting to issue token to authenticated user`);

    return admin.auth().createCustomToken(username)
        .catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, Error issuing a token to authenticated user: ${error}`);
                throw error;
            }
        );
}

function parseRequestBody(req, uuid)
{
    let funcTag = "parseRequestBody()";
    winston.info(`[${uuid}] ${tag} ${funcTag}, Parsing request body`);

    let user = {};

    if(req.body.username)
    {
        user.username = req.body.username;
    }
    if(req.body.password)
    {
        user.password = req.body.password;
    }
    if(req.body.email)
    {
        user.email = req.body.email;
    }
    // TODO - implement type
    user.type = "user";

    return user;
}

function parseProfileUpdateBody(req, uuid) 
{
    let funcTag = "ParseProfileUpdateBody():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, attempting to parse update profile body`);

    let user = {};

    if(req.body.has_email_subscription)
    {
        user.has_email_subscription = (req.body.has_email_subscription === "true") ? 1 : 0;
    }

    return user;
}

function parsePasswordResetBody(req, uuid)
{
    let funcTag = "ParsePasswordResetBody():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, attempting to parse password reset body`);

    let pass = {};

    if(req.body.oldPassword)
    {
        pass.password = req.body.oldPassword;
    }
    if(req.body.newPassword)
    {
        pass.newPassword = req.body.newPassword;
    }
    if(req.body.confirmPassword)
    {
        pass.confirmPassword = req.body.confirmPassword;
    }

    return pass;
}

function isEmpty(obj)
{
    return Object.keys(obj).length === 0;
}
