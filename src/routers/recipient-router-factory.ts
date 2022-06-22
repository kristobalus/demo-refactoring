import express = require('express');
import { Service, ServiceOptions } from "typedi";
import { Factory } from "../di/factory";
import { NextFunction, Request, Response } from "express";
import { RecipientController } from "../controllers/recipient-controller";

@Service({ transient: true } as ServiceOptions)
export class RecipientRouterFactory implements Factory<express.Router> {

    constructor(
        private recipientController: RecipientController
    ) {
    }

    create(): express.Router {

        const router: express.Router = express.Router();

        router.get("/",
            (req: Request, res: Response, next: NextFunction) =>
                this.recipientController.getItem(req, res).catch(err => next(err)))

        router.post("/", (req: Request, res: Response, next: NextFunction) =>
            this.recipientController.ensureItem(req, res).catch(err => next(err)))

        router.put("/", (req: Request, res: Response, next: NextFunction) =>
            this.recipientController.ensureItem(req, res).catch(err => next(err)))

        router.delete("/", (req: Request, res: Response, next: NextFunction) =>
            this.recipientController.deleteItem(req, res).catch(err => next(err)))

        return router;
    }

}