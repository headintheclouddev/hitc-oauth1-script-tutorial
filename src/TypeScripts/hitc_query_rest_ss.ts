/**
 * hitc_query_rest_ss.ts
 *
 * @NScriptName HITC - Query REST - Scheduled
 * @NScriptType ScheduledScript
 * @NApiVersion 2.1
 */

import log = require('N/log');

export function execute() {

}

function makeNonce(length: number) {
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
