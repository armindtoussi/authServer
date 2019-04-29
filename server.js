#!/usr/bin/env nodejs
const port = 8080;
const express     = require('express');
const bodyParser  = require('body-parser');
const admin       = require('firebase-admin');
const compression = require('compression');
const winston     = require('./config/winston');

const app = express();

const routeMethods = require('./user/routerMethods.js');
const routes       = require('./user/router.js')(express.Router(), routeMethods);
const adminMethods = require('./admin/adminRouterMethods.js');
const adminRoutes  = require('./admin/adminRouter.js')(express.Router(), adminMethods);

const serviceAccount = require('./config/serviceKey.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.dev.serviceKey),
    databaseURL: serviceAccount.dev.database,
});

app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => 
    {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept, Authorization");
        next();
    }
);

app.use('/auth', routes);
app.use('/admin', adminRoutes);

app.listen(port, 
    () => 
    {
        console.log("listening on port", port);
        winston.info(`listening on port ${port}`);
    }    
);
