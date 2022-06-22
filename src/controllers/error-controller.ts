import { Inject, Service } from "typedi";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error";


@Service()
export class ErrorController {

    constructor() {}

    async onUncaughtException(err: Error, req: Request, res: Response) {

        if ( err instanceof ApiError ) {
            res.status(err.status).json({ message: err.message })
            return
        }

        res.status(500).json({ message: "Internal error" })
    }

    async onRouteNotFound(req: Request, res: Response) {
        res.status(404).json({ message: "Route not found" })
    }

}