export default class RequestError extends Error {
    status: number;
    text: string;
    constructor(status: number, text: string);
}
