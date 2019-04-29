module.exports = 
{
    query: query,
    getConnection: getConnection, 
    initiateTransaction: initiateTransaction,
    commitTransaction: commitTransaction,
    transactionQuery: transactionQuery,
};

const mysql  = require('mysql');
const config = require('../config/sqlConfig.js');

const RESPONSE_MSG = require('../response/responseCodes');
const winston      = require('../config/winston');
const tag          = "SqlWrapper.js";


let pool = mysql.createPool(config);
let connection;


function getConnection(uuid)
{
    let funcTag = "GetConnection():";
    winston.info(`[${uuid}] ${tag} ${funcTag}, getting a pool connection`);

    return new Promise(
        (resolve,reject) => 
        {
            pool.getConnection(
                (err, con) => 
                {
                    if(err){
                        winston.warn(`[${uuid}] ${tag} ${funcTag}, problem getting a pool connection`);
                        return reject(err);
                    } 

                    winston.info(`[${uuid}] ${tag} ${funcTag}, got a pool connection, returning`);

                    if(connection === undefined)
                    {
                        connection = con;
                    }     
                    return resolve();
                }
            );
        }
    ).catch(
        (error) => 
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, failed to get a pool connection, Error: ${error}`);
            error = RESPONSE_MSG.ERROR_CODE.ERR_DB_CONNECT;
            throw error;
        }
    );
}

function initiateTransaction(query, params, uuid)
{
    let funcTag = "InitiateTransaction(): ";
    winston.info(`[${uuid}] ${tag} ${funcTag}, initiating a transaction`);

    return new Promise(
        (resolve, reject) => 
        {
            connection.beginTransaction(
                (err) =>
                {
                    if(err) {
                        winston.warn(`[${uuid}] ${tag} ${funcTag}, failed to begin the transaction`);
                        return reject(err);
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, transaction started, doing initial query`);
                    
                    connection.query(query, params, 
                        (err, result) =>
                        {
                            if(err) 
                            {
                                winston.warn(`[${uuid}] ${tag} ${funcTag}, issue with the query`);
                                connection.rollback(
                                    (err) =>
                                    {
                                        return reject(err);
                                    }
                                );
                                return reject(err);
                            }

                            winston.info(`[${uuid}] ${tag} ${funcTag}, query finished successfully`);
                            return resolve(result);
                        }
                    );
                }
            );
        }
    ).catch(
        (error) => 
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, transaction error, Error: ${error}`);
            error = RESPONSE_MSG.ERROR_CODE.ERR_DB_TRANSACTION;
            throw error;
        }
    );
}

function transactionQuery(query, params, uuid)
{
    let funcTag = "TransactionQuery():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, adding a query to current transaction`);

    return new Promise(
        (resolve, reject) => 
        {
            connection.query(query, params,
                (err, result) =>
                {
                    if(err)
                    {
                        winston.warn(`[${uuid}] ${tag} ${funcTag}, issue with the query, rolling back`);
                        connection.rollback(
                            (err) =>
                            {
                                return reject(err);
                            }
                        );
                        return reject(err);
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, query successful, returning results`);
                    return resolve(result);
                }
            );
        }
    ).catch(
        (error) => 
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, transaction query error, Error: ${error}`);
            error = RESPONSE_MSG.ERROR_CODE.ERR_DB_TRANSACTION;
            throw error;
        }
    );
}

function commitTransaction(uuid)
{
    let funcTag = "CommitTransaction():";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, trying to commit transaction and release`);

    return new Promise(
        (resolve, reject) => 
        {
            connection.commit(
                (err) =>
                {
                    if(err) 
                    {
                        winston.warn(`[${uuid}] ${tag} ${funcTag} transaction commit failed`);
                        connection.rollback(
                            (err) =>
                            {
                                return reject(err);
                            }
                        );
                        return reject(err);
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, transaction commit successful, releasing resource`);
                    connection.release();
                    return resolve();
                }
            );
        }
    ).catch(
        (error) =>
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, transaction commit error, Error: ${error}`);
            error = RESPONSE_MSG.ERROR_CODE.ERR_DB_TRANSACTION;
            throw error;
        }
    );
}

function query(query, uuid, args) 
{
    let funcTag = "query()";
    winston.info(`[${uuid}] ${tag} ${funcTag} called, attempting to execute query`);

    return new Promise(
        (resolve, reject) =>
        {
            pool.query(query, args, 
                (error, results, fields) => 
                {
                    if(error) 
                    {
                        return reject(error);
                    }

                    winston.info(`[${uuid}] ${tag} ${funcTag}, query completed sucessfully`);
                    resolve(results);
                }
            );
        }
    ).catch(
        (error) => 
        {
            winston.error(`[${uuid}] ${tag} ${funcTag}, Sql query error: ${error}`);
            let customErr = RESPONSE_MSG.ERROR_MSG.FAIL_DB_ERR;
            throw customErr;
        } 
    );
}
