/**
 * hitc_query_rest_ss.ts
 *
 * @NScriptName HITC - Query REST - Scheduled
 * @NScriptType ScheduledScript
 * @NApiVersion 2.1
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    function execute() {
    }
    exports.execute = execute;
    function makeNonce(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
});
