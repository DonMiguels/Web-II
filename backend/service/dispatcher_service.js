import SS from '../service/session_service.js'
import Config from "../config/config.js";
import SecurityService from './security_service.js';

export default class DispatcherService {
    static instance;

    constructor() {
        if (DispatcherService.instance) return DispatcherService.instance;

        this.config = new Config();
        this.session = new SS();
        this.security = new SecurityService();
        DispatcherService.instance = this;
    }

    async toProccess(request) {
        try {
            if (!this.session.authenticate(request)) {
                return this.config.getMessage(request?.body?.lang, 'session_required');
            }
            if  (!this.security.hasPermission(request?.body?.permission)) {
                return this.config.getMessage(request?.body?.lang, 'missing_required_fields');
            }
            return await this.security.executeAuthorized(request?.body?.permission);
        } catch (error) {
            return {
                statusCode: this.config.STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: this.config.getMessage(request?.body?.lang, 'server_error'),
            };
        }
    }
}
