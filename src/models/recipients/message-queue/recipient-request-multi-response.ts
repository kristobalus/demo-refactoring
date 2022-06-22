import { Recipient } from "../../dto/recipient";


export interface RecipientRequestMultiResponse {
    count: number;
    recipients: Recipient[]
}