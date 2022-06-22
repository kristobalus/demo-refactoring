import 'reflect-metadata';
import { MessageQueueService } from "../../services/message-queue-service";
import { Container } from "typedi";
import { CompanyRepository } from "../../repositories/company-repository";
import { AuthenticationMiddleware } from "../../middleware/authentication-middleware";
import assert = require("assert");

class NatMock {

    async request(path: string, data: any): Promise<any> {

        if (path == "company.checkAPIToken") {

            if (data.token == "good-token") {
                return {}
            }

            return null
        }

        throw new Error("Unknown path")
    }
}

describe('AuthenticationMiddleware', function () {

    let nats
    let messageQueueService
    let authenticator: AuthenticationMiddleware
    // let app: Express

    before(() => {
        nats = new NatMock()
        messageQueueService = new MessageQueueService(nats)
        Container.set(MessageQueueService, messageQueueService)
        const repository = Container.get(CompanyRepository)
        authenticator = new AuthenticationMiddleware(repository, "x-token")
    })

    describe('token authentication', () => {

        it('should create initialization route handler', (done) => {
            const handler = authenticator.init()
            const req = {} as any
            const res = {
                end: function () {
                    done(new Error(`Passport.js unexpectedly closed the HTTP connection with code: ${this.statusCode}`));
                }
            } as any
            handler(req, res, done)
            assert.equal(req._passport != null, true)
        })

        it('should find the company with good-token and pass on', (done) => {

            const req = {
                headers: {
                    "x-token": "good-token"
                }
            } as any

            const res = {
                end: function () {
                    done(new Error(`Passport.js unexpectedly closed the HTTP connection with code: ${this.statusCode}`));
                }
            } as any

            const init = authenticator.init()
            const auth = authenticator.token()
            init(req, res, (err) => {

            })
            auth(req, res, (err) => {
                done()
            })
        })

        it('should throw error with bad-token', (done) => {

            const req = {
                headers: {
                    "x-token": "bad-token"
                }
            } as any

            const res = {
                end: function () {
                    if (this.statusCode == 401) {
                        done()
                    } else {
                        done(new Error("Passport.js failed to raise 401 error"))
                    }
                }
            } as any

            const init = authenticator.init()
            const auth = authenticator.token()
            init(req, res, (err) => {
                if ( err) {
                    done(new Error("Passport.js failed to initialize"))
                    return
                }
                auth(req, res, (err) => {
                    done(new Error("Passport.js failed to raise error"))
                })
            })
        })
    })


});