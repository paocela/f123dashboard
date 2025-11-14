var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { GenezioDeploy } from "@genezio/types";
import axios from 'axios';
let DreandosTwitchInterface = (() => {
    let _classDecorators = [GenezioDeploy()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DreandosTwitchInterface = _classThis = class {
        constructor() {
            this.clientId = '76pgow7h813kegw9ivqb9c63anh2uc'; // Replace with your Twitch Client ID
            this.clientSecret = process.env.RACEFORFEDERICA_DREANDOS_SECRET ?? "";
            this.tokenUrl = 'https://id.twitch.tv/oauth2/token';
            this.apiUrl = 'https://api.twitch.tv/helix';
            this.accessToken = null;
            this.tokenExpiration = 0;
        }
        async getAccessToken() {
            if (this.accessToken && Date.now() < this.tokenExpiration) {
                return this.accessToken;
            }
            if (!this.clientSecret) {
                throw new Error("Twitch client secret is not set.");
            }
            const body = new URLSearchParams();
            body.set('client_id', this.clientId);
            body.set('client_secret', this.clientSecret);
            body.set('grant_type', 'client_credentials');
            try {
                const response = await axios.post(this.tokenUrl, body.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });
                this.accessToken = response.data.access_token;
                this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
                return this.accessToken;
            }
            catch (error) {
                throw new Error(`Failed to fetch access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        async getStreamInfo(channelName) {
            return this.getAccessToken()
                .then(token => {
                return axios.get(`${this.apiUrl}/streams?user_login=${channelName}`, {
                    headers: {
                        'Client-ID': this.clientId,
                        'Authorization': `Bearer ${token}`
                    }
                });
            })
                .then(response => {
                return response.data;
            })
                .catch(error => {
                throw new Error(`Failed to fetch access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
            });
        }
    };
    __setFunctionName(_classThis, "DreandosTwitchInterface");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DreandosTwitchInterface = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DreandosTwitchInterface = _classThis;
})();
export { DreandosTwitchInterface };
