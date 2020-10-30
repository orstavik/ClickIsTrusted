//CROSS REQUEST STATE SECRET
//const STATE_SECRET_TTL_MS = 3 * 60 * 1000;
//const STATE_SECRET_REGISTRY_LENGTH = 10000; //10000 = 24 000kb max size.
const states = [];               //i don't have a clean up method for the registry length.

function getStateSecret(ttl, stateRegistrySize) {
  //1. the secret is a hexString of a random number
  const secret = randomString(12);

  //2. states is an LRU cache
  states.length > stateRegistrySize && states.shift();
  states.push(secret);

  //3. The state secrets on live in the memory of cf worker until the timeout is reached.
  //   When the timeout is reached, the state is deleted from the memory.
  setTimeout(() => hasStateSecretOnce(secret), ttl);
  return secret;
}

//The state secret is a nonce.
//If it is read once, then it is also deleted from the state secret registry at the same time.
function hasStateSecretOnce(state) {
  const index = states.indexOf(state);
  return index >= 0 ? states.splice(index, 1) : false;
}

//CROSS REQUEST STATE SECRET end
