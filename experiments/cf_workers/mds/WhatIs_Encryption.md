# WhatIs: encryption

## 1. What is  AES-GCM 

`AES-GCM` is an authenticated encryption mode that uses the AES block cipher in counter mode with a polynomial MAC based on Galois field multiplication.
  
 AES stands for `Advanced Encryption Standard` and is a symmetric block encryption algorithm. Symmetric encryption means that the key used for encryption and decryption is identical, as opposed to asymmetric encryption where there are two keys; a private key and a public key. The public key is used to encrypt data, and only someone with the private key can read the encrypted data. The block size of AES is 128 bits. This means that the algorithms work in chunks of 128 bits.
  >AES only includes three flavors of Rijndael: AES-128, AES-192, and AES-256. The difference between these flavors is the size of the key and the number of rounds used, but–and this is often overlooked–not the block size.

This algorithm converts one 128-bit block into another using a secret key that is needed for this conversion. A second conversion with the same secret key is used to decrypt the resulting 128-bit block. 
The block size is always 128 bits. The size of the key is also fixed. To encrypt any text with any password, you can do this:

  * derive a hash from a password
  * turn a hash into a key by the book 
  * as defined in AES
  * split the text into blocks of 128 bits
  * encrypt each block with cipher function

  The `Galois/Counter Mode`( GCM) is a widely used mode of operation of symmetric block ciphers, which has high efficiency and performance. It is an authenticated encryption mode (AEAD), providing both confidentiality and authentication of transferred data (guaranteeing its integrity).
  
   GCM mode is defined for block ciphers with block size of 128 bits. There is a variant of GCM called GMAC, providing only data authentication, it can be used as an incremental message authentication code. Both GCM and GMAC accept an initialization vector of any length as input.
      Due to the presence of a Message authentication code, this mode of authenticated encryption allows the recipient to easily detect any changes in the message (both encrypted and supplemented with information transmitted openly) before decrypting it, which greatly improves protection against distortion, active MITM attacks and oracle-based attacks.
 
   The `Galois/Counter Mode` (GCM) is an [AEAD](https://www.youtube.com/watch?v=od44W45sCQ4) mode of operation for block ciphers.  GCM uses Counter Mode to encrypt the data, an operation that can be efficiently pipelined.  Further, GCM authentication uses operations that are particularly well suited to efficient implementation in hardware, making it especially appealing for high-speed implementations, or for implementations in an efficient and compact circuit.
    
>Any AEAD algorithm provides an intrinsic authentication tag.  In many applications, the authentication tag is truncated to less than full length.  
   
## 2.  AES-GCM properties list

The AES-GCM object of the Web Crypto API represents `Object` that should be passed as the _`algorithm`_ parameter into `decrypt()`, `wrapKey()`, or `unwrapKey()`, using the AES-GCM algorithm. It includes next properties:

 1. `additional-data` - contains additional data (`Uint8Array`) that will not encrypted but will be authenticated along with the encrypted. If `additionalData` is given here then the same data must be given the corresponding call to `decrypt()`: if the data given to the call does not match the original data, the decryption will throw exception. 

    This gives you a way to authenticate associated data having to encrypt it. The bit length of `additionalData` must be `≤ 264-1`. The `additionalData` property is optional and may be omitted without the security of the encryption operation.

 2. `iv` — the initialization vector (`Uint8Array`). This must be unique every encryption operation carried out with a given key. Put way: never reuse an IV with the same key. The AES-GCM specification that the IV should be `96` bits long, and typically contains bits a random number generator. Don't re-use initialization vectors. It is neccessary to generate a new iv every time your encrypt. Recommended to use 12 bytes length. 
       > Note that the IV does not have to be secret, unique: so it is OK, for example, to transmit it in the clear the encrypted message.
 3. `name` - A `DOMString`/`UTF-16 String`.
 4. `tag-length` - This determines the size in bits (`Number`) of the authentication generated in the encryption operation and used for authentication the corresponding decryption. It is optional and defaults to 128 if it is not specified.
  According to the Web Crypto specification this must have one the following values: `32, 64, 96, 104, 112, 120, or 128`. 

The example below shows what an `AES-GCM` object looks like    
   ```javascript
    let algorithm = {name: 'AES-gcm', 
                     iv: new Uint8Array(16),
                     additionalData: new Uint8Array(1),
                     tagLength: 120}
   ``` 
 
## 3. How to make a key
 
The CryptoKey object is used as a reference to the key material that is managed by the user agent. CryptoKey objects may reference key material that has been generated and imported by the user agent or key material that has been derived from other keys by the user agent or made available to the user agent in some other ways. Also the CryptoKey object does not necessary directly interact with the underlying key storage mechanism, and may instead simply instruct the user agent how to obtain the key material when needed, for example when performing a cryptographic operation. CryptoKey object can hold reference to a asymmetric key, key-pair (public-key and/or private-key), or symmetric key (secret-key). 
    
The CryptoKey object also contains information about the algorithm and the settings that were used when generating the key(s). The specification does not explicitly provide any new storage mechanisms for CryptoKey objects. Instead it allows the CryptoKey objects to be used with any existing or future web storage mechanism that supports storing structured clonable objects. It is expected that in practice most developers will make use of the Indexed Database API (IndexedDB) which allows associative storage of key/value pairs, where the key can be used as an identifier for the key object and the value for storing the CryptoKey object.

Public-key cryptography or also known as asymmetric cryptography is a cryptography system in which a pair of keys, the public and private key, is used to encrypt and decrypt a message respectively. The public and private keys are mathematically related, but it is impossible to derive or deduce the private-key from the public-key. Public-key cryptography is used widely in the data communications and software used today. For example:

   * `HTTP Secure (HTTPS)` communications utilize TLS/SSL, which uses public-key cryptography to establish secure communication between two parties.
   * `Certificates` provide authenticity of web pages using public-key cryptography to establish trust between a web page and the certificate authority.
   * `Secure EMail protocol (S/MIME13) and PGP (Pretty Good Privacy)` uses asymmetric cryptography to protect email messages that are sent between two people.


In order to generate a key, `importKey()` is used. As parameters, it takes:

  * `format` - is a string describing the data format of the key to import. To make a secret key, the value "raw" is used. This is an unformatted byte sequence.
  * `keyData` -  object containing the key in the given format. It turns short strings with length 5 and long strings with length 500 into hash strings always `256` long.
  * `algorithm` - is a dictionary object defining the type of key to import and providing extra algorithm-specific parameters. Object properties described before.
  * `extractable` - is a Boolean indicating whether it will be possible to export the key using `SubtleCrypto.exportKey()` or `SubtleCrypto.wrapKey()`.
  * `keyUsages` -  is an Array indicating a type of operation that may be performed using a key. The recognized key usage values are "encrypt", "decrypt", "sign", "verify", "deriveKey", "deriveBits", "wrapKey" and "unwrapKey".


```javascript
(async function () {
      var format = 'raw';
      var keyData = await crypto.subtle.digest('SHA-256', new TextEncoder().encode("secret message"))
      var algorithm = {name: 'aes-gcm'};
      var extractable = false;
      var usages = ['encrypt', 'decrypt'];
      var key = crypto.subtle.importKey(format, keyData, algorithm, extractable, usages);
      return key;
})();
```

### 4. How to encrypt data
   Application performs the encryption by converting the input text to `Uint8Array` format (which is required format by subtle.encrypt method) and then encrypting the message using the `crypto.subtle.encrypt` method with the public-key from the CryptoKey object.  It returns Promise with data encrypted from the source text, the encryption algorithm and the key passed as arguments. If the `encrypt` method succeeds the resulting ArrayBuffer formatted data is converted to `Uint8Array` format and then stored in ciphertext variable

It takes next parameters:
 * `algorithm` - is an `AES-GCM object` (described above) specifying the algorithm to be used and any extra parameters if required.Its properties are desribed before.
 * `key` - is a `CryptoKey` containing the key to be used for encryption.
 * `data` - is a `BufferSource` containing the data to be encrypted (also known as the plaintext).

The example below demonstrates the implementation of the 'encrypt' method.
//todo remove it to async/await
```javascript
window.crypto.subtle.encrypt(
    {
        name: "AES-GCM",
        iv: window.crypto.getRandomValues(new Uint8Array(12)),
        additionalData: ArrayBuffer,
        tagLength: 128, 
    },
    key, 
    data
)
```

### 5. How to decrypt data

Application performs the decryption by using the `crypto.subtle.decrypt` method with the private-key from the CryptoKey object. If the `decrypt` method succeeds the resulting ArrayBuffer formatted data is converted to Uint8Array format and stored in plaintext variable
```javascript
window.crypto.subtle.encrypt(
    {
        name: "AES-GCM",
        iv: window.crypto.getRandomValues(new Uint8Array(12)),
        additionalData: ArrayBuffer,
        tagLength: 128, //can be 32, 64, 96, 104, 112, 120 or 128 (default)
    },
    key, //from generateKey or importKey above
    data //ArrayBuffer of data you want to encrypt
)
```

### 2.1 Why is aes-gcm the best alternative native in web crypto?

  For three variants of AES keys, a complete search requires 2^127, 191 2 or 2^255 operations respectively. Even the smallest of these numbers indicates that the key brute force attack has no practical meaning today. According to the developers' estimates, the cipher is stable against such kinds of cryptoanalysis attacks: 
  * differential cryptanalysis; 
  * linear cryptanalysis; 
  * cryptanalysis based on linked keys (no weak keys in the algorithm).
  In June 2003, the U.S. NSA announced that the AES cipher is strong enough to protect information that constitutes state secrets. Up to the SECRET level it was allowed to use keys 128 bits long, for the TOP SECRET level it was recommended to use keys 192 bits long and 256 bits long. After the introduction of the new encryption standard AES, attempts to open it significantly increased. The combination of the boomerang method and associated keys led Alex Biryukov and Dmitry Khovratovich to the opening of the AES-192 and AES-256 versions (all rounds) in July 2009. Both attacks were conducted under the assumption that the cryptanalyst intercepted pairs of "open text - ciphertext" obtained on different secret keys. Although the attack works against any algorithm key, it is now, and probably will remain forever theoretical, since the computational complexity of the 2^119 attack is outside our computers. It is interesting that the authors note the "incapacity" of the attack against AES-128, although, ironically, it is the 256-bit key that was intended to encrypt the most sensitive information, rather than the 128-bit key.

### Reference
* [AES-GCM](https://www.w3.org/TR/WebCryptoAPI/#aes-gcm)
* [MDN: encrypt()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt)
* [MDN: decrypt()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt)
* [MDN: CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)
* [Mika Luoma-aho: JavaScript Web Cryptography API](https://www.theseus.fi/bitstream/handle/10024/92960/Web_Cryptography_API_Luoma-aho.pdf)