

export class MessageQueueService {

    constructor(
        private nats
    ) {
    }

    request<T>(path: string, data: any): Promise<T> {
        return this.nats.request(path, data)
    }

}

