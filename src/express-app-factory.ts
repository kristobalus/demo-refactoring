import 'reflect-metadata';

// bootstrap dependencies
require('./di/bootstrap')

import { Express, NextFunction, Request, Response } from "express";
import express = require('express');
import bodyParser = require('body-parser');
import morgan = require('morgan');

import { ErrorController } from "./controllers/error-controller";
import { RecipientRouterFactory } from "./routers/recipient-router-factory";
import { Factory } from "./di/factory";
import { Service, ServiceOptions } from "typedi";
import { AuthenticationMiddleware } from "./middleware/authentication-middleware";
import { CompanyRepository } from "./repositories/company-repository";

@Service({ transient: true } as ServiceOptions)
export class ExpressAppFactory implements Factory<any> {

    constructor(
        private errorController: ErrorController,
        private recipientRouterFactory: RecipientRouterFactory,
        private companyRepository: CompanyRepository
    ) {}

    create(): Express {

        const authentication =
            new AuthenticationMiddleware(this.companyRepository, "X-Flomni-API")

        const app = express()
        app.use(bodyParser.json())
        app.use(morgan('dev'))
        app.use(authentication.init())

        //  TODO обработку OPTIONS надо выносить в реверс-прокси например на базе NGINX
        //      чтобы не перегружать event loop
        app.use(function (req: Request, res: Response, next: NextFunction) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Flomni-API');
            res.header('Access-Control-Allow-Methods', 'GET,POST, OPTIONS, PUT, PATCH, DELETE');
            if (req.method === 'OPTIONS') {
                res.send(200);
            } else {
                next();
            }
        });

        app.use("/recipients", authentication.token(), this.recipientRouterFactory.create());
        app.use((req: Request, res: Response, next: NextFunction) => {
            this.errorController.onRouteNotFound(req, res)
                .then(() => next())
                .catch(err => next(err))
        })

        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            this.errorController.onUncaughtException(err, req, res)
                .then(() => next())
                .catch(err => next(err))
        })

        return app
    }

}



