import ActionMessages from "../config/actionMessages.config";

export default class ProcessingError extends Error {
    constructor(...codes) {
        super("Request didn't meet required criterias.");
        this.name = this.constructor.name;
        this.codes = codes;
        this.actionMessages = new ActionMessages();
        this.causes = this.actionMessages.convertMessages(...codes);
    }
}
