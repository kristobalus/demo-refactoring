import { ApiError } from "./api-error";


export class RecipientNotFoundError extends ApiError {

    constructor() {
        super("RecipientNotFoundError", 404);
    }

}