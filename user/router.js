module.exports = (router, methods) => 
{
    router.post('/register', methods.registerUser);
    router.post('/login', methods.login);
    router.post('/updateProfile/:uname', methods.updateProfile);
    router.post('/resetPassword/:uname', methods.resetPassword);
    router.get('/verify/:user_hash', methods.accountVerify);
    router.get('/profile/:uname', methods.getUserProfile);

    return router;
};