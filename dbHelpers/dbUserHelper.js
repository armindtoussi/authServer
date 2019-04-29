let sqlConnection;

const crypto       = require('crypto');
const RESPONSE_MSG = require('../response/responseCodes');
const winston      = require('../config/winston');
const bcrypt        = require('bcrypt');
const tag          = "DbUserHelper.js";


module.exports = injectedSqlInjection => 
{
    sqlConnection = injectedSqlInjection;

    return {
        registerUserIncludingEmail: registerUserIncludingEmail,
        registerUserExcludingEmail: registerUserExcludingEmail,
        authenticateUser: authenticateUser,
        checkUniqueUsername: checkUniqueUsername,
        checkUniqueEmail: checkUniqueEmail,
        verifyAccount: verifyAccount,
        getUserProfile: getUserProfile,
        updateProfile: updateProfile,
        resetPassword: resetPassword,
    }
};

function resetPassword(pass, uuid) 
{

    let funcTag = "ResetPassword():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to change password`);

    const query     = "SELECT id FROM oden_users WHERE username = ?";
    const passQuery = "UPDATE oden_users SET password = ? WHERE id = ?";

    return passwordProtect(pass, uuid)
        .then(
            () =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, user's new password hashed and salted successfully`);
                
                return sqlConnection.getConnection(uuid);
            }
        ).then(
            () =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, connection successful, initiating transaction`);

                return sqlConnection.initiateTransaction(query,
                        [pass.username], uuid);
            }
        ).then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, first transaction succesful, retrieved the user id`);
                let id = result[0].id;

                return sqlConnection.transactionQuery(passQuery,
                    [pass.newPassword, id], uuid);
            }
        ).then(
            (result) => 
            {
                sqlConnection.commitTransaction(uuid);

                if(result !== undefined) 
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, transaction was successful, password changed`);
                    return RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PASSWORD_CHANGE;
                }
                
                winston.info(`[${uuid}] ${tag} ${funcTag}, password was not changed, could not find user`);
                return RESPONSE_MSG.ERROR_CODE.ERR_FAIL_AUTH;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, change password Error: ${error}`);
                throw error;
            }
        );
}

function updateProfile(user, uuid)
{
    let funcTag = "UpdateProfile():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to update the user profile`);

    const query       = "SELECT id FROM oden_users WHERE username = ?";
    const updateQuery = "UPDATE oden_users SET has_email_subscription = ? WHERE id = ?";

    return sqlConnection.getConnection(uuid)
        .then(
            () =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, connection successful, initiating transaction`);

                return sqlConnection.initiateTransaction(query,
                    [user.username], uuid);
            }
        ).then(
            (result) =>
            {
                if(result.length > 0)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, first transaction successful, performing update`);
                    let id = result[0].id;

                    return sqlConnection.transactionQuery(updateQuery,
                        [user.has_email_subscription, id], uuid);
                }
            }
        ).then(
            (result) =>
            {
                sqlConnection.commitTransaction(uuid);

                if(result !== undefined) 
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, transaction was successful, releasing resource and returning`);
                    return RESPONSE_MSG.SUCCESS_MSG.SUCCESS_PROFILE_UPDATE;
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, user profile update was no successful, couldn't find user`);
                return RESPONSE_MSG.ERROR_CODE.ERR_PROFILE_UPDATE_NO_USER;
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, update profile Error: ${error}`);
                throw error;
            }
        )
}

function getUserProfile(username, uuid)
{
    let funcTag = "GetUserProfile():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to get the user profile`);

    const query = `SELECT username, email, created_at, has_email_subscription FROM oden_users WHERE username = ?`;

    return sqlConnection.query(query, uuid, 
        [username]
    ).then(
        (result) =>
        {
            winston.info(`[${uuid}] ${tag} ${funcTag}, returning from database query, passing results back`);
            return result[0];
        }
    ).catch(
        (error) =>
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, error retrieving user profile form database ${error}`);
            throw error;
        }
    )
}


function verifyAccount(userHash, uuid)
{
    let funcTag = "VerifyAccount():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to verify the user in the database`);

    const query       = "SELECT * FROM user_verify where user_hash = ?";
    const updateQuery = "UPDATE oden_users SET is_verified = ? WHERE id = ?";
    const delQuery    = "DELETE from user_verify WHERE user_hash = ?";

    return sqlConnection.getConnection(uuid)
        .then(
            () =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, connection established, initiating a transaction`);

                return sqlConnection.initiateTransaction(query, 
                    [userHash.user_hash], uuid);
            }
        ).then(
            (result) =>
            {   
                let id = result[0].user_id;
                winston.info(`[${uuid}] ${tag} ${funcTag}, initial query completed continuing transaction with is_verified update`);

                return sqlConnection.transactionQuery(updateQuery, 
                    [1, id], uuid);
            }
        ).then(
            () => 
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, updating is_verified complete in transaction, now attempting to delete user_hash entry`);

                return sqlConnection.transactionQuery(delQuery, 
                    [userHash.user_hash], uuid);
            }
        ).then(
            () =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, user_hash entry deleted successfully, finalizing the transaction with a commit`);

                return sqlConnection.commitTransaction(uuid);
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, user verify error: ${error}`);
                throw error;
            }
        );
}

// TODO - has_email_subscription needs to be properly reflected on the ui. 
function registerUserIncludingEmail(user, uuid) 
{   
    let funcTag = "registerUserIncludingEmail()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to register user including email`);

    const query     = "INSERT INTO oden_users(username, password, email, user_type, has_email_subscription, is_verified) VALUES(?, ?, ?, ?, 1, 0)";
    const hashQuery = "INSERT INTO user_verify(user_id, user_hash) VALUES(?, ?)";

    return sqlConnection.getConnection(uuid)
        .then(
            () => 
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, connection successfully created, initiating transaction`);
                
                return sqlConnection.initiateTransaction(query, 
                    [user.username, user.password, user.email, user.type], uuid);
            }
        ).then(
            (result) =>
            {
                if(result !== undefined)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, first register transaction successful, attempting to insert user hash`);

                    let id = result.insertId;
                    let hash = createHash(user.username, uuid);

                    return sqlConnection.transactionQuery(hashQuery, 
                        [id, hash], uuid);
                }
            }
        ).then(
            (result) =>
            {
                sqlConnection.commitTransaction(uuid);

                if(result !== undefined)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, user successfully register including email`);
                    return RESPONSE_MSG.SUCCESS_MSG.SUCCESS_REGISTER;
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, user registration failed due to unknown circumstances`);
                return RESPONSE_MSG.ERROR_CODE.FAIL_REG_UNKNOWN;
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, user registration error: ${error}`);
                throw error;
            }
        );
}

function registerUserExcludingEmail(user, uuid) 
{
    let funcTag = "registerUserExcludingEmail()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to register user excluding email`);

    const query     = "INSERT INTO oden_users(username, password, user_type, has_email_subscription, is_verified) VALUES(?, ?, ?, 0, 0)";
    const hashQuery = "INSERT INTO user_verify(user_id, user_hash) VALUES(?, ?)";

    return sqlConnection.getConnection(uuid)
        .then(
            () =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, connection successfully created, initiating transaction`);

                return sqlConnection.initiateTransaction(query, 
                    [user.username, user.password, user.type], uuid);
            }
        ).then(
            (result) => 
            {
                if(result !== undefined)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, first register transaction successful, attempting to insert user hash`);
                    
                    let id   = result.insertId;
                    let hash = createHash(user.username, uuid);

                    return sqlConnection.transactionQuery(hashQuery,
                        [id, hash], uuid);
                }
            }
        ).then(
            (result) =>
            {
                sqlConnection.commitTransaction(uuid);

                if(result !== undefined) 
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, user successfully register excluding email`);
                    return RESPONSE_MSG.SUCCESS_MSG.SUCCESS_REGISTER;   
                }

                winston.info(`[${uuid}] ${tag} ${funcTag}, user registration failed due to unknown circumstances`);
                return RESPONSE_MSG.ERROR_CODE.FAIL_REG_UNKNOWN;
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
    winston.info(`[${uuid}] ${tag} ${funcTag} called, Attempting to authenticate user`);
    
    const query = `SELECT password FROM oden_users WHERE username = ?`;
    
    return sqlConnection.query(query, uuid,
            [user.username]
        ).then(
            (result) =>
            {
                if(result !== undefined)
                {
                    winston.info(`[${uuid}] ${tag} ${funcTag}, finished querying database for user password`);
                    return result[0];
                }
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, User authentication failed, Error: ${error}`);
                throw error;
            }
        );
}

function checkUniqueUsername(username, uuid)
{
    let funcTag = "checkUniqueUsername()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, checking that username is unique`);

    const query = `SELECT username FROM oden_users WHERE username = ?`;

    return sqlConnection.query(query, uuid, 
            [username]
        ).then(
            (result) => 
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, finished querying database for username`);
                return result[0];
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, checking username uniqueness failed Error: ${error}`);
                throw error;
            }
        );
}

function checkUniqueEmail(email, uuid)
{
    let funcTag = "checkUniqueEmail()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to check uniqueness of the email`);

    const query = `SELECT email FROM oden_users WHERE email = ?`;

    return sqlConnection.query(query, uuid, 
            [email]
        ).then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, finished querying database from email`);
                return result[0];
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, checking email uniqueness failed Error: ${error}`);
                throw error;
            }
        );
}

function createHash(username, uuid) 
{
    let funcTag = "CreateHash():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, creating a hash from given username`);

    return crypto.createHash('sha256')
                 .update(username)
                 .digest('hex');
}

function passwordProtect(pass, uuid)
{
    const funcTag    = "passwordProtect():";
    const saltRounds = 10;

    winston.info(`[${uuid}] ${tag} ${funcTag}, called and protecting password`);

    return bcrypt.hash(pass.newPassword, saltRounds)
        .then(
            (hash) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, hash was calculated, returning`);
                pass.newPassword = hash;
                return pass; 
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