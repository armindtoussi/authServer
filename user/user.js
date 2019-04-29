const sqlConnection = require('../dbHelpers/sqlWrapper');
const dbUserHelper  = require('../dbHelpers/dbUserHelper')(sqlConnection);
const RESPONSE_MSG  = require('../response/responseCodes');
const winston       = require('../config/winston');
const bcrypt        = require('bcrypt');
const tag           = `User.js`;

module.exports = 
{
    registerUser: registerUser,
    authenticateUser: authenticateUser,
    checkUniqueUsername: checkUniqueUsername,
    verifyAccount: verifyAccount,
    getUserProfile: getUserProfile,
    updateProfile: updateProfile,
    resetPassword: resetPassword,
};

function resetPassword(pass, uuid) 
{
    let funcTag = "ResetPassword():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to change password`);

    return authenticateUser(pass, uuid)
        .then(
            (result) =>
            {
                if(result)
                {
                    return dbUserHelper.resetPassword(pass, uuid);
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, password was not changed, could not find user`);
                return RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH;
            }
        ).then(
            (result) =>
            {
                if(result === RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PASSWORD_CHANGE)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, pass changed successfully.`);
                    return result;
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, returning after failed authentication`);
                return result;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag} error changing password, Error: ${error}`);
                throw error;
            }
        );
}

function updateProfile(user, uuid)
{
    let funcTag = "UpdateProfile():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to update user profile`);

    return dbUserHelper.updateProfile(user, uuid)
        .then(
            (result) =>
            {
                if(result === RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_UPDATE)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag} profile updated successfully, returning`);
                    return result;
                }

                winston.info(`[${uuid}] ${tag} ${funcTag} profile update failed, user does not exist in database`);
                return RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_UPDATE_NO_USER;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, error updating user profile, Error: ${error}`);
                throw error;
            }
        );
}

function getUserProfile(uname, uuid)
{
    let funcTag = "GetUserProfile():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to get user profile`);

    return dbUserHelper.getUserProfile(uname, uuid).
        then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, queried database for profile, returning results`);
                return result;
            }
        )
        .catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, error retrieving user profile form database ${error}`);
                throw error;
            }
        );
}

function verifyAccount(userHash, uuid) 
{
    let funcTag = "VerifyAccount():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to verify account in db`);

    return dbUserHelper.verifyAccount(userHash, uuid)
        .catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, verfiy account error: ${error}`);
                throw error;
            }
        );
}

function registerUser(user, uuid)
{
    let funcTag = `registerUser()`;
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to register user.`);

    if(user.email)
    {
        return registerWithEmail(user, uuid)
            .then(
                (result) =>
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, returning registration with email result: ${result}`);
                    return result;
                }
            ).catch(
                (error) =>
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, registration with email, error: ${error}`);
                    throw error;
                }
            );
    }
    else 
    {
        return registerWithoutEmail(user, uuid)
            .then(
                (result) =>
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, returning registration result without email: ${result}`);
                    return result;
                }
            ).catch(
                (error) =>
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, registration without email, error: ${error}`);
                    throw error;
                }
            );
    }
}

function registerWithEmail(user, uuid)
{
    let funcTag = "RegisterWithEmail():";

    return checkUniqueEmail(user.email, uuid)
    .then(
        (result) => 
        {
            if(result)
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, user email does not exist, attemping to protect`);
                return passwordProtect(user, uuid);
            }

            winston.info(`[${uuid}] ${tag} ${funcTag}, user email exists`);
            return RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_EMAIL;
        }
    ).then(
        (result) =>
        {
            if(result !== RESPONSE_MSG.ERROR_CODE.ERR_DUPLICATE_EMAIL) 
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, user email does not exist, attemping to register user`);
                return dbUserHelper.registerUserIncludingEmail(user, uuid);
            }
            
            return result;
        }
    ).catch(
        (error) => 
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, user registration error: ${error}`);
            throw error;
        }
    );
}

function registerWithoutEmail(user, uuid)
{
    let funcTag = "RegisterWithoutEmail():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, attempting to register user without an email`);

    return passwordProtect(user, uuid)
        .then(
            (user) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, returned from protecting password and registering user`);
                return dbUserHelper.registerUserExcludingEmail(user, uuid);
            }
        ).then(
            (result) => 
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, user registration without email result`);
                return result;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, user registration error: ${error}`);
                throw error;
            }
        );
}

function authenticateUser(user, uuid)
{
    let funcTag = "authenticateUser()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to authenticate user`);

    if(user.username && user.password)
    {
        return dbUserHelper.authenticateUser(user, uuid)
            .then(
                (result) =>
                {
                    if(result !== undefined)
                    {
                        winston.info(`[${uuid}] ${tag} ${funcTag}, password retrieved, attempting to verify user`);
                        return verifyUser(user, result.password, uuid);
                    }

                    return false;
                }
            ).then(
                (result) =>
                {
                    if(result)
                    {
                        winston.info(`[${uuid}] ${tag} ${funcTag}, user successfullly authenticated`);
                        return true;
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, user authentication unsuccessful`);
                    return false;
                }
            ).catch(
                (error) =>
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, user authentication error: ${error}`);
                    throw error;
                }
            );
    }
}

function checkUniqueUsername(username, uuid)
{
    let funcTag = "checkUniqueUsername()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, checking that username is unique`);

    if(username)
    {
        return dbUserHelper.checkUniqueUsername(username, uuid)
            .then(
                (result) =>
                {
                    if(result !== undefined)
                    {
                        winston.info(`[${uuid}] ${tag} ${funcTag}, username is a duplicate, registation to be rejected`);
                        return false;
                    }
                    winston.info(`[${uuid}] ${tag} ${funcTag}, username does not exist in database, it is unique`);
                    return true;
                }
            ).catch(
                (error) =>
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, checking username duplicate failed: Error: ${error}`);
                    throw error;
                }
            );
    }
}

function checkUniqueEmail(email, uuid)
{
    let funcTag = "checkUniqueEmail()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, checking that email is unique`);
    
    return dbUserHelper.checkUniqueEmail(email, uuid)
        .then(
            (result) =>
            {
                if(result !== undefined)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, email is a duplicate, registration to be rejected`);
                    return false;
                }
                
                winston.info(`[${uuid}] ${tag} ${funcTag}, email does not exist in the database, it is unique`);
                return true;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, checking email duplicate failed: Error: ${error}`);
                throw error;
            }
        );
}

function passwordProtect(user, uuid)
{
    const funcTag    = "passwordProtect():";
    const saltRounds = 10;

    winston.info(`[${uuid}] ${tag} ${funcTag}, called and protecting password`);

    return bcrypt.hash(user.password, saltRounds)
        .then(
            (hash) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, hash was calculated, returning to register`);
                user.password = hash;
                return user; 
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, hashing failed: Error: ${error}`);
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                throw error;
            }
        );
}

function verifyUser(user, storedPass, uuid)
{
    const funcTag = "VerifyUser():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, called and trying to verify user password`);

    return bcrypt.compare(user.password, storedPass)
        .then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, user verification occurred, returning`);
                return result;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, verifying user error: Error: ${error}`);
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                throw error;
            }
        );
}