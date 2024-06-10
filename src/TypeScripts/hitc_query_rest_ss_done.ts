/**
 * hitc_query_rest_ss_done.ts
 *
 * @NScriptName HITC - Query REST - Scheduled (Done)
 * @NScriptType ScheduledScript
 * @NApiVersion 2.1
 */

import crypto = require('N/crypto');
import encode = require('N/encode');
import https = require('N/https');
import log = require('N/log');

export function execute() {
  queryRESTWebService("tstdrv1264257", "SELECT id FROM contact");
  queryRESTlet('https://tstdrv1264257.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=834&deploy=1');
  log.audit('execute', `Finished at ${new Date()}.`);
}

function queryRESTlet(restletURL: string): void {
  const integrationConsumerKey = 'xxx';
  const tokenId = 'xxx';
  // In the OAuth signature, we have to separate the base URL from the parameters listed after it:
  const baseURLAndParameters = restletURL.split('?'); // Split: https://tstdrv1264278.restlets.api.netsuite.com/app/site/hosting/restlet.nl ? script=1167&deploy=1
  const scriptAndDeployment = baseURLAndParameters[1].split('&'); // Split: script=1167 & deploy=1
  const scriptId = scriptAndDeployment[0].split('=')[1];
  const deploymentId = scriptAndDeployment[1].split('=')[1];
  const nonce = makeNonce(10);
  const timestamp = Math.round(Date.now() / 1000);
  const salesOrderId = '201855'; // In this example, this is the SO ID that we want to get the details for
  // Parameters (URL and OAuth) must be alphabetized, so like: deploy, oauth_consumer_key, oauth_nonce, oauth_signature_method, oauth_timestamp, oauth_token, script
  // (you could make this a bit smarter / more flexible by automatically alphabetizing a list of parameters)
  let stringToSign = `GET&${encodeURIComponent(baseURLAndParameters[0])}`;
  stringToSign += `&deploy%3D${deploymentId}`;
  stringToSign += `%26oauth_consumer_key%3D${integrationConsumerKey}`;
  stringToSign += `%26oauth_nonce%3D${nonce}`;
  stringToSign += `%26oauth_signature_method%3DHMAC-SHA256`;
  stringToSign += `%26oauth_timestamp%3D${timestamp}`;
  stringToSign += `%26oauth_token%3D${tokenId}`;
  stringToSign += `%26salesOrderId%3D${salesOrderId}`;
  stringToSign += `%26script%3D${scriptId}`;
  // Create the HMAC and sign the string using the secret key
  const key = crypto.createSecretKey({ secret: 'custsecret_hitc_qa_rest_demo_done', encoding: encode.Encoding.UTF_8 });
  const hmac = crypto.createHmac({ algorithm: crypto.HashAlg.SHA256, key });
  hmac.update({ input: stringToSign });
  const signature = encodeURIComponent(hmac.digest({ outputEncoding: encode.Encoding.BASE_64 }));
  // Extract the account ID from URL to form the Realm:
  const realm = restletURL.split('.')[0].replace('https://', '').toUpperCase().replace('-', '_');
  // Concatenate the pieces to create the final Authorization Header:
  let Authorization = `OAuth realm="${realm}",oauth_consumer_key="${integrationConsumerKey}",oauth_token="${tokenId}",`;
  Authorization += `oauth_signature_method="HMAC-SHA256",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_signature="${signature}"`;
  const response = https.get({
    url: restletURL + '&salesOrderId=' + salesOrderId,
    headers: { Authorization }
  });
  log.debug('queryRESTlet', `Response ${response.code}: ${response.body}`);
}

function queryRESTWebService(account: string, query: string): void { // If you're using a sandbox, account should be like: 123456-sb1
  const integrationConsumerKey = 'xxx';
  const tokenId = 'xxx';
  const nonce = makeNonce(10);
  const timestamp = Math.round(Date.now() / 1000); // Round to the nearest second
  const restWebServiceURL = `https://${account.toLowerCase()}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`;
  let stringToSign = `POST&${encodeURIComponent(restWebServiceURL)}`;
  stringToSign += `&oauth_consumer_key%3D${integrationConsumerKey}`;
  stringToSign += `%26oauth_nonce%3D${nonce}`;
  stringToSign += '%26oauth_signature_method%3DHMAC-SHA256';
  stringToSign += `%26oauth_timestamp%3D${timestamp}`;
  stringToSign += `%26oauth_token%3D${tokenId}`;
  const key = crypto.createSecretKey({ secret: 'custsecret_hitc_qa_rest_demo_done', encoding: encode.Encoding.UTF_8 });
  const hmac = crypto.createHmac({ algorithm: crypto.HashAlg.SHA256, key });
  hmac.update({ input: stringToSign });
  const signature = encodeURIComponent(hmac.digest({ outputEncoding: encode.Encoding.BASE_64 }));
  const realm = account.toUpperCase().replace('-', '_');
  let Authorization = `OAuth realm="${realm}",oauth_consumer_key="${integrationConsumerKey}",oauth_token="${tokenId}",`;
  Authorization += `oauth_signature_method="HMAC-SHA256",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_signature="${signature}"`;
  const response = https.post({
    url: restWebServiceURL,
    headers: { Authorization, 'Content-Type': 'application/json', 'Accept': '*/*', 'Prefer': 'transient' },
    body: JSON.stringify({ "q": query })
  });
  log.debug('queryRESTWebService', `Response ${response.code}: ${response.body}`);
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
