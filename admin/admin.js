//This file will handle adminstration requests.
const sqlConnection = require('../dbHelpers/sqlWrapper');
const dbAdminHelper = require('../dbHelpers/dbAdminHelper')(sqlConnection);
const RESPONSE_MSG  = require('../response/responseCodes');
const winston       = require('../config/winston');
const bcrypt        = require('bcrypt');
const tag           = `Admin.js`;

module.exports = 
{
    authenticateAdmin: authenticateAdmin,
    getEmail: getEmail,
    getAllEmails: getAllEmails,
};


function authenticateAdmin(admin, uuid)
{
    let funcTag = "AuthenticateAdmin():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to authenticate admin`);

    if(admin)
    {
        return dbAdminHelper.authenticateAdmin(admin, uuid)
            .then(
                (result) =>
                {   
                    if(result !== undefined) 
                    { 
                        winston.info(`[${uuid}] ${tag} ${funcTag}, password retrieved, attempting to verify admin user`);
                        return verifyAdmin(admin, result.password, uuid);
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, password retrieval came up empty, no such user with permissions exists or credentials wrong`);
                    return false; 
                }
            ).then(
                (result) =>
                {
                    if(result)
                    {
                        winston.info(`[${uuid}] ${tag} ${funcTag}, admin successfullly authenticated`);
                        return true;
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, Admin authentication unsuccessful`);
                    return false;
                }
            ).catch(
                (error) => 
                {
                    winston.error(`[${uuid}] ${tag} ${funcTag}, Admin authentication error: ${error}`);
                    throw error;
                }
            );
    }
}

function verifyAdmin(admin, storedPass, uuid)
{
    let funcTag = "VerifyAdmin()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, trying to verify admin password`);

    return bcrypt.compare(admin.password, storedPass)
        .then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, admin verification occurred, returning`);
                return result;
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, verifying admin error: Error: ${error}`);
                error = RESPONSE_MSG.ERROR_CODE.ERR_SERVER_ERR;
                throw error;
            }
        );
}

function getEmail(username, uuid)
{
    let funcTag = "GetEmail():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, getting single email by username ${username}`);

    return dbAdminHelper.getEmail(username, uuid)
        .then(
            (result)  =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, returning with email request.`);
                return result;
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, Getting email failed due to Error: ${error}`);
                throw error;
            }
        );
}

function getAllEmails(uuid)
{
    let funcTag = "GetAllEmails():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, getting all subscribe emails`);

    return dbAdminHelper.getAllEmails(uuid)
        .then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, returning with all emails request`);
                return processAllEmailRequestResults(result, uuid);
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, getting all emails failed due to Error: ${error}`);
                throw error;
            }
        );
}

function processAllEmailRequestResults(result, uuid) 
{
    let emails = [];

    for(var i = 0; i < result.length; i++) 
    {
        emails.push(result[i].email);
    }
    
    return emails;
}
