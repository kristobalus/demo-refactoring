import { RecipientNotFoundError } from "../errors/recipient-not-found-error";
import { MessageQueueService } from "../services/message-queue-service";
import { Recipient } from "../models/dto/recipient";
import { RecipientRequestMultiArguments } from "../models/recipients/message-queue/recipient-request-multi-arguments";
import { RecipientRequestMultiResponse } from "../models/recipients/message-queue/recipient-request-multi-response";
import { RecipientValidationError } from "../errors/recipient-validation-error";

import {
    RecipientRequestEnsureArguments,
    TransactionId
} from "../models/recipients/message-queue/recipient-request-ensure-arguments";
import { RecipientRequestDeleteArguments } from "../models/recipients/message-queue/recipient-request-delete-arguments";
import { Service } from "typedi";
import { RecipientEnsureData } from "../models/recipients/api/recipient-ensure-data";

@Service()
export class RecipientRepository {

    constructor(
        private messageQueue: MessageQueueService
    ) {
    }

    async getItem(uid: string, ownerId: string): Promise<Recipient> {

        const response = await this.messageQueue
            .request<RecipientRequestMultiResponse>("recipient.requestMulti",
                { userHash: uid, ownerId } as RecipientRequestMultiArguments)

        const {
            count,
            recipients: [
                recipient
            ]
        } = response

        if (count < 1) {
            throw new RecipientNotFoundError()
        }

        return recipient
    }

    async deleteItem(uid: string, ownerId: string): Promise<any> {
        return await this.messageQueue.request("recipient.remove",
            { userHash: uid, ownerId } as RecipientRequestDeleteArguments);
    }

    async ensureItem(uid: string, ownerId: string, data: RecipientEnsureData): Promise<Recipient> {

        let response: Recipient

        try {
            response = await this.messageQueue.request<Recipient>("recipient.ensure",
                {
                    userHash: uid,
                    wId: ownerId,
                    metaData: data.metaData,
                    tags: data.tags,
                    uProfile: data.profile,
                    transactionId: { type: 'phoneNum', value: data.phoneNum } as TransactionId
                } as RecipientRequestEnsureArguments)
        } catch (e) {
            throw new RecipientValidationError()
        }

        return response
    }


}

