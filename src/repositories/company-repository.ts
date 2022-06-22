import { Service } from "typedi";
import { MessageQueueService } from "../services/message-queue-service";
import { Company } from "../models/dto/company";


@Service()
export class CompanyRepository {

    constructor(
        private messageQueue: MessageQueueService
    ) {
    }

    async findByToken(token: string): Promise<Company> {
        return this.messageQueue.request('company.checkAPIToken', { token })
    }

}