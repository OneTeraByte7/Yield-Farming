import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const keyName = 'organizations/{org_id}/apiKeys/34a2d9b7-7c9c-4fe6-a119-a311a5d9ab12';
const keySecret = `-----BEGIN EC PRIVATE KEY-----
MHCCAQEEIMCmEfQKyD032zYjcmse9yRgcrRsht+8BKnF ytA5HiQ+oAoGCCqGSM49AwEHOUQDQgAEJ0nesiDXvW7r t/8s/3hxeaqU/ZfalazsFTmS0uZ/z5A09HCkzkhXoDnK QumOorUTOZqlF4EAVp12Yi93DGsGYA==
-----END EC PRIVATE KEY-----`;
const requestMethod = 'GET';
const requestHost = 'api.coinbase.com';
const requestPath = '/api/v3/brokerage/accounts';
const algorithm = 'ES256';

const uri = `${requestMethod} ${requestHost}${requestPath}`;

const generateJWT = (): string => {
  const payload = {
    iss: 'cdp',
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120,
    sub: keyName,
    uri,
  };

  const header = {
    alg: algorithm,
    kid: keyName,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  return jwt.sign(payload, keySecret, { algorithm, header });
};

const main = () => {
  const token = generateJWT();
  console.log(token);
};

main();