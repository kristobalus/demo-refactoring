

export interface NatLikeService {
    request(path: string, data: any): Promise<any>
}

export class MessageQueueService {

    constructor(
        private nats: NatLikeService
    ) {
    }

    request<T>(path: string, data: any): Promise<T> {
        return this.nats.request(path, data)
    }

}

