import { Request, Response } from "express";
import { RecipientRepository } from "../repositories/recipient-repository";
import { Service } from "typedi";
import { User } from "../models/user";
import { RecipientQuery } from "../models/recipients/api/recipient-query";
import { RecipientResponse } from "../models/recipients/api/recipient-response";
import { RecipientEnsureData } from "../models/recipients/api/recipient-ensure-data";

@Service()
export class RecipientController {

    constructor(
        private recipientRepository: RecipientRepository
    ) {
    }

    async getItem(req: Request, res: Response): Promise<any> {
        const { uid } = req.query as any as RecipientQuery
        const ownerId = (req.user as User)._id
        const recipient = await this.recipientRepository.getItem(uid, ownerId)
        res.status(200).json({
            uid,
            profile: recipient.uProfile,
            metaData: recipient.metaData,
            tags: recipient.tags,
            messengers: recipient.messengers,
            transactions: recipient.transactions
        } as RecipientResponse)
    }

    async ensureItem(req: Request, res: Response): Promise<any> {

        const { uid } = req.query as any as RecipientQuery
        const ownerId = (req.user as User)._id
        const data = req.body as RecipientEnsureData
        const recipient = await this.recipientRepository.ensureItem(uid, ownerId, data)

        res.status(200).json({
            uid,
            profile: recipient.uProfile,
            metaData: recipient.metaData,
            tags: recipient.tags,
            messengers: recipient.messengers,
            transactions: recipient.transactions
        } as RecipientResponse)
    }

    async deleteItem(req: Request, res: Response): Promise<any> {
        const { uid } = req.query as any as RecipientQuery
        const ownerId = (req.user as User)._id
        await this.recipientRepository.deleteItem(uid, ownerId)
        res.status(200).send()
    }

}