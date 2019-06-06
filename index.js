'use strict';

const crypto = require('crypto');

class UIDGenerator {
  constructor(bitSize, baseEncoding) {
    if (bitSize === undefined) {
      bitSize = 128;
    } else if (typeof bitSize === 'string') {
      baseEncoding = bitSize;
      bitSize = 128;
    } else if (!Number.isInteger(bitSize) || bitSize <= 0 || bitSize % 8 !== 0) {
      throw new TypeError('bitSize must be a positive integer that is a multiple of 8');
    }

    if (baseEncoding === undefined) {
      baseEncoding = UIDGenerator.BASE58;
    } else {
      validateBaseEncoding(baseEncoding);
    }

    this.bitSize = bitSize;
    this.baseEncoding = baseEncoding;
    this.base = baseEncoding.length;
    this.uidLength = Math.ceil(bitSize / Math.log2(baseEncoding.length));

    this._byteSize = bitSize / 8;
  }

  generate(cb) {
    if (!cb) {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(this._byteSize, (err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(this._bufferToString(buffer));
          }
        });
      });
    }

    crypto.randomBytes(this._byteSize, (err, buffer) => {
      if (err) {
        cb(err);
      } else {
        cb(null, this._bufferToString(buffer));
      }
    });
  }

  generateSync() {
    return this._bufferToString(crypto.randomBytes(this._byteSize));
  }

  // Encoding algorithm based on the encode function in Daniel Cousens' base-x package
  // https://github.com/cryptocoinjs/base-x/blob/master/index.js
  _bufferToString(buffer) {
    const digits = [0];
    var i;
    var j;
    var carry;

    for (i = 0; i < buffer.length; ++i) {
      carry = buffer[i];

      for (j = 0; j < digits.length; ++j) {
        carry += digits[j] << 8;
        digits[j] = carry % this.base;
        carry = (carry / this.base) | 0;
      }

      while (carry > 0) {
        digits.push(carry % this.base);
        carry = (carry / this.base) | 0;
      }
    }

    // Convert digits to a string
    var str = digits.length < this.uidLength
      ? this.baseEncoding[0].repeat(this.uidLength - digits.length) // Handle leading zeros
      : '';

    for (i = digits.length - 1; i >= 0; --i) {
      str += this.baseEncoding[digits[i]];
    }

    return str;
  }
}

function validateBaseEncoding(baseEncoding) {
  if (typeof baseEncoding !== 'string') {
    throw new TypeError('baseEncoding must be a string');
  }

  switch (baseEncoding) {
    case UIDGenerator.BASE16:
    case UIDGenerator.BASE36:
    case UIDGenerator.BASE58:
    case UIDGenerator.BASE62:
    case UIDGenerator.BASE66:
    case UIDGenerator.BASE71:
      return;
  }

  for (var i = 0; i < baseEncoding.length - 1; i++) {
    if (baseEncoding.indexOf(baseEncoding[i], i + 1) >= 0) {
      throw new Error(
        `Invalid baseEncoding due to duplicated character: '${baseEncoding[i]}'`
      );
    }
  }
}

UIDGenerator.BASE16 = '0123456789abcdef';
UIDGenerator.BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
UIDGenerator.BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
UIDGenerator.BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
UIDGenerator.BASE66 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._~';
UIDGenerator.BASE71 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!'()*-._~";
UIDGenerator.BASE94 = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'; // eslint-disable-line max-len

module.exports = UIDGenerator;
