import 'reflect-metadata';
import { MessageQueueService } from "../../services/message-queue-service";
import { Container } from "typedi";
import { Recipient } from "../../models/dto/recipient";
import { RecipientController } from "../../controllers/recipient-controller";
import { RecipientRequestMultiResponse } from "../../models/recipients/message-queue/recipient-request-multi-response";
import { RecipientRequestMultiArguments } from "../../models/recipients/message-queue/recipient-request-multi-arguments";
import { RecipientNotFoundError } from "../../errors/recipient-not-found-error";
import { RecipientRequestEnsureArguments } from "../../models/recipients/message-queue/recipient-request-ensure-arguments";
import assert = require("assert");
import { RecipientQuery } from "../../models/recipients/api/recipient-query";
import { RecipientEnsureData } from "../../models/recipients/api/recipient-ensure-data";
import { RecipientValidationError } from "../../errors/recipient-validation-error";

class ControllerNatMock {

    async request(path: string, data: any): Promise<any> {

        if (path == "recipient.requestMulti") {

            const req = data as RecipientRequestMultiArguments

            if (req.userHash == "good-uid") {
                return {
                    count: 1,
                    recipients: [
                        {
                            uProfile: {},
                            metaData: "meta-data",
                            tags: [],
                            messengers: [],
                            transactions: []
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

            const req = data as RecipientRequestEnsureArguments

            if (req.userHash == "good-uid") {
                return {
                    uProfile: {},
                    metaData: "meta-data",
                    tags: [],
                    messengers: [],
                    transactions: []
                } as Recipient
            }

            throw new Error("Validation error")
        }

        throw new Error(`Unknown path ${path}`)
    }
}

describe('RecipientController', function () {

    let nats
    let messageQueueService
    let controller: RecipientController

    before(() => {
        nats = new ControllerNatMock()
        messageQueueService = new MessageQueueService(nats)
        Container.reset()
        Container.set(MessageQueueService, messageQueueService)
        controller = Container.get(RecipientController)
    })

    describe('getItem', () => {

        it('should find item', async () => {

            const req = {
                query: {
                    uid: "good-uid",
                },
                user: {
                    _id: "1"
                }
            } as any

            let result
            const res = {
                status: function () {
                    return this
                },
                json: function (obj) {
                    result = obj
                    return this
                }
            } as any

            await controller.getItem(req, res)
            assert.equal(result != null, true)
        })

        it('should throw RecipientNotFound error', async () => {

            const req = {
                query: {
                    uid: "uid-2",
                },
                user: {
                    _id: "1"
                }
            } as any

            let result
            const res = {
                status: function () {
                    return this
                },
                json: function (obj) {
                    result = obj
                    return this
                }
            } as any

            try {
                await controller.getItem(req, res)
                throw new Error("This point should not be reached")
            } catch (err) {
                let result = err instanceof RecipientNotFoundError
                assert.equal(result, true)
            }
        })

    })

    describe('ensureItem', () => {

        it('should ensure item in the remote repository', async () => {

            const req = {
                query: {
                    uid: "good-uid",
                } as RecipientQuery,
                user: {
                    _id: "1"
                },
                body: {
                    metaData: "meta-data",
                    tags: [],
                    profile: {},
                    phoneNum: "phone-num"
                } as RecipientEnsureData
            } as any

            let result
            const res = {
                status: function () {
                    return this
                },
                json: function (obj) {
                    result = obj
                    return this
                }
            } as any

            await controller.ensureItem(req, res)
            assert.equal(result != null, true)
        })

        it('should throw ValidationError error', async () => {

            const req = {
                query: {
                    uid: "uid-2",
                },
                user: {
                    _id: "1"
                }
            } as any

            let result
            const res = {
                status: function () {
                    return this
                },
                json: function (obj) {
                    result = obj
                    return this
                }
            } as any

            try {
                await controller.ensureItem(req, res)
                throw new Error("This point should not be reached")
            } catch (err) {
                let result = err instanceof RecipientValidationError
                assert.equal(result, true)
            }

        })

    })


});