import { ApiError } from "./api-error";


export class RecipientValidationError extends ApiError {
    constructor() {
        super("Validation error", 417);
    }
}
