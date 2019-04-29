let sqlConnection; 

const winston      = require('../config/winston');
const tag          = "DbAdminHelper.js";

module.exports = injectedSqlConnection => 
{
    sqlConnection = injectedSqlConnection;

    return {
        authenticateAdmin: authenticateAdmin,
        getEmail: getEmail,
        getAllEmails, getAllEmails,
    }
};

function authenticateAdmin(admin, uuid) 
{
    let funcTag = "AuthenticateAdmin():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to authenticate admin user`);

    const query = `SELECT password FROM oden_users WHERE username = ? and user_type = "admin"`;

    return sqlConnection.query(query, uuid, 
            [admin.username]
        ).then(
            (result) => 
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, finished querying database for user password corresponding to admin type`);
                return result[0];
            }
        ).catch(
            (error) =>
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, Admin authentication failed, Error: ${error}`);
                throw error; 
            }
        );
}

function getEmail(username, uuid)
{
    let funcTag = "GetEmail():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, getting single email by username from db ${username}`);

    const query = `select email, user_hash FROM oden_users INNER JOIN user_verify ON oden_users.id = user_verify.user_id WHERE username = ?`;
    
    return sqlConnection.query(query, uuid, 
            [username]
        ).then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, finished query for email, passing back results`);
                return result[0];
            }   
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, query for ${funcTag} failed, Error: ${error}`);
                throw error;
            }
        );
}

function getAllEmails(uuid)
{
    let funcTag = "GetAllEmails():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, getting all subscribed emails`);

    const query = "SELECT email FROM oden_users WHERE has_email_subscription = 1";

    return sqlConnection.query(query, uuid)
        .then(
            (result) =>
            {
                winston.info(`[${uuid}] ${tag} ${funcTag}, finished query for email, passing back results`);
                return result;
            }
        ).catch(
            (error) => 
            {
                winston.error(`[${uuid}] ${tag} ${funcTag}, query for ${funcTag} failed, Error: ${error}`);
                throw error;
            }
        )

}
