import 'reflect-metadata';

import { MessageQueueService } from "../../services/message-queue-service";
import { Container } from "typedi";
import { CompanyRepository } from "../../repositories/company-repository";
import assert = require("assert");


class NatMock  {

    async request(path: string, data: any): Promise<any> {

        if ( path == "company.checkAPIToken" ) {

            if ( data.token == "good-token" ) {
                return {}

            }

            return null
        }

        throw new Error("Unknown path")
    }
}

describe('CompanyRepository', function () {

    let nats
    let messageQueueService

    before(() => {
        nats = new NatMock()
        messageQueueService = new MessageQueueService(nats)
        Container.set(MessageQueueService, messageQueueService)
    })

    describe('findByToken', () => {

        it('should find the company by token', async () => {
            const repository = Container.get(CompanyRepository)
            const company = repository.findByToken("good-token")
            assert.equal(company != null, true)
        })

        it('should return null if the company not found by token', async () => {
            const repository = Container.get(CompanyRepository)
            const company = repository.findByToken("bad-token")
            assert.equal(company != null, true)
        })
    })



});