import 'reflect-metadata';
import { MessageQueueService } from "../../services/message-queue-service";
import { Container } from "typedi";
import { RecipientRepository } from "../../repositories/recipient-repository";
import { RecipientEnsureData } from "../../models/recipients/api/recipient-ensure-data";
import { Recipient } from "../../models/dto/recipient";
import { RecipientRequestMultiArguments } from "../../models/recipients/message-queue/recipient-request-multi-arguments";
import { RecipientRequestMultiResponse } from "../../models/recipients/message-queue/recipient-request-multi-response";
import { RecipientRequestEnsureArguments } from "../../models/recipients/message-queue/recipient-request-ensure-arguments";
import { RecipientRequestDeleteArguments } from "../../models/recipients/message-queue/recipient-request-delete-arguments";
import { RecipientValidationError } from "../../errors/recipient-validation-error";
import { RecipientNotFoundError } from "../../errors/recipient-not-found-error";
import assert = require("assert");

class RecipientNatsMock {

    async request(path: string, data: any): Promise<any> {

        if (path == "recipient.requestMulti") {

            const { userHash, ownerId } = data as RecipientRequestMultiArguments

            if (userHash == "good-uid") {
                return {
                    count: 1,
                    recipients: [
                        {
                            uProfile: {},
                            tags: [],
                            messengers: [],
                            metaData: "meta-data"
                        } as Recipient
                    ]
                } as RecipientRequestMultiResponse
            }

            return {
                count: 0,
                recipients: []
            } as RecipientRequestMultiResponse
        }

        if (path == "recipient.ensure") {

            const request = data as RecipientRequestEnsureArguments
            const { userHash } = request

            if (userHash == "bad-uid") {
                throw new Error("Validation error occurred")
            }

            return {
                uProfile: {},
                metaData: "meta-data",
                tags: [],
                messengers: [],
                transactions: []
            } as Recipient
        }

        if (path == "recipient.remove") {
            const request = data as RecipientRequestDeleteArguments
            return request.userHash == "good-uid";
        }

        throw new Error("Unknown path")
    }
}

describe('RecipientRepository', function () {

    let nats
    let messageQueueService

    before(() => {
        nats = new RecipientNatsMock()
        messageQueueService = new MessageQueueService(nats)
        Container.reset()
        Container.set(MessageQueueService, messageQueueService)
    })

    describe('ensureItem', () => {

        it('should return item', async () => {
            const repository = Container.get(RecipientRepository)
            const item = await repository.ensureItem("good-uid", "1",
                {
                    metaData: "meta-data",
                    tags: [],
                    profile: {},
                    phoneNum: "phone-num"
                } as RecipientEnsureData)
            assert.equal(item != null, true)
        })

        it('should throw RecipientValidationError', async () => {
            const repository = Container.get(RecipientRepository)

            try {

                await repository.ensureItem("bad-uid", "1",
                    {
                        metaData: "meta-data",
                        tags: [],
                        profile: [],
                        phoneNum: "phone-nub"
                    } as RecipientEnsureData)

                assert.fail("this point should not be reached")

            } catch (err) {
                const result = err instanceof RecipientValidationError
                assert.equal(result, true)
            }

        })
    })

    describe('getItem', () => {

        it('should return item', async () => {
            const repository = Container.get(RecipientRepository)
            const item = await repository.getItem("good-uid", "1")
            assert.equal(item != null, true)
        })

        it('should return error 404 if item not found', async () => {
            const repository = Container.get(RecipientRepository)
            let error
            try {
                await repository.getItem("bad-uid", "1")
                assert.fail("this point should not be reached")
            } catch (err) {
                let result = err instanceof RecipientNotFoundError
                assert.equal(result, true)
            }

        })
    })

    describe('deleteItem', () => {
        it('should return true if item deleted', async () => {
            const repository = Container.get(RecipientRepository)
            const result = await repository.deleteItem("good-uid", "1")
            assert.equal(result == true, true)
        })
    })


});