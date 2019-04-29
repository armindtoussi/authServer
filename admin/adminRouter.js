module.exports = (router, methods) => 
{
    router.get('/email', methods.getSingleEmail);
    router.get('/all-emails', methods.getAllEmails);
    router.post('/login', methods.login);

    return router; 
};