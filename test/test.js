'use strict';

const UIDGenerator = require('../index');

const crypto = require('crypto');
const should = require('should');

describe('UIDGenerator', () => {

  describe('new UIDGenerator(bitSize, baseEncoding, uidLength)', () => {

    it('accepts 0 parameters', () => {
      const uidgen = new UIDGenerator();
      uidgen.should.be.an.instanceOf(UIDGenerator);
      uidgen.bitSize.should.be.exactly(128);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE58);
      uidgen.uidLength.should.be.exactly(22);
      uidgen.base.should.be.exactly(58);
    });

    it('accepts just the bitSize parameter', () => {
      const uidgen = new UIDGenerator(256);
      uidgen.bitSize.should.be.exactly(256);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE58);
      uidgen.uidLength.should.be.exactly(44);
      uidgen.base.should.be.exactly(58);
    });

    it('accepts just the baseEncoding parameter', () => {
      const uidgen = new UIDGenerator(UIDGenerator.BASE16);
      uidgen.bitSize.should.be.exactly(128);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE16);
      uidgen.uidLength.should.be.exactly(32);
      uidgen.base.should.be.exactly(16);
    });

    it('accepts just the uidLength parameter', () => {
      const uidgen = new UIDGenerator(null, 10);
      uidgen.bitSize.should.be.exactly(59);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE58);
      uidgen.uidLength.should.be.exactly(10);
      uidgen.base.should.be.exactly(58);
    });

    it('accepts the bitSize and baseEncoding parameters', () => {
      const uidgen = new UIDGenerator(512, UIDGenerator.BASE62);
      uidgen.bitSize.should.be.exactly(512);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE62);
      uidgen.uidLength.should.be.exactly(86);
      uidgen.base.should.be.exactly(62);
    });

    it('accepts the baseEncoding and uidLength parameters', () => {
      const uidgen = new UIDGenerator(UIDGenerator.BASE62, 22);
      uidgen.bitSize.should.be.exactly(131);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE62);
      uidgen.uidLength.should.be.exactly(22);
      uidgen.base.should.be.exactly(62);
    });

    it('accepts a custom baseEncoding', () => {
      new UIDGenerator('123abc').baseEncoding.should.be.exactly('123abc');
      new UIDGenerator(512, 'abc123').baseEncoding.should.be.exactly('abc123');
      new UIDGenerator('01', 9).baseEncoding.should.be.exactly('01');
    });

    it('throws if bitSize is not a positive integer that is a multiple of 8', () => {
      should.throws(() => new UIDGenerator(0), TypeError);
      should.throws(() => new UIDGenerator(1), TypeError);
      should.throws(() => new UIDGenerator(-8), TypeError);
      should.throws(() => new UIDGenerator(-128), TypeError);
      should.throws(() => new UIDGenerator(127), TypeError);
      should.throws(() => new UIDGenerator(1.5), TypeError);
      should.throws(() => new UIDGenerator(Math.PI), TypeError);
      should.throws(() => new UIDGenerator(Infinity), TypeError);
      should.throws(() => new UIDGenerator(true), TypeError);
      should.throws(() => new UIDGenerator({}), TypeError);
      should.throws(() => new UIDGenerator([]), TypeError);
      should.throws(() => new UIDGenerator(/regex/), TypeError);
    });

    it('throws if baseEncoding is not a string', () => {
      should.throws(() => new UIDGenerator(128, true), TypeError);
      should.throws(() => new UIDGenerator(128, 256), TypeError);
      should.throws(() => new UIDGenerator(128, {}), TypeError);
      should.throws(() => new UIDGenerator(128, []), TypeError);
      should.throws(() => new UIDGenerator(128, /regex/), TypeError);
      should.throws(() => new UIDGenerator(128, new Date()), TypeError);
    });

    it('throws if uidLength is not a positive integer', () => {
      should.throws(() => new UIDGenerator('01', 0), TypeError);
      should.throws(() => new UIDGenerator('01', -1), TypeError);
      should.throws(() => new UIDGenerator('01', -128), TypeError);
      should.throws(() => new UIDGenerator('01', 1.5), TypeError);
      should.throws(() => new UIDGenerator('01', Math.PI), TypeError);
      should.throws(() => new UIDGenerator('01', Infinity), TypeError);
      should.throws(() => new UIDGenerator('01', true), TypeError);
      should.throws(() => new UIDGenerator('01', false), TypeError);
      should.throws(() => new UIDGenerator('01', {}), TypeError);
      should.throws(() => new UIDGenerator('01', []), TypeError);
      should.throws(() => new UIDGenerator('01', /regex/), TypeError);
    });

    it('throws if both bitSize and uidLength are specified', () => {
      should.throws(() => new UIDGenerator(24, 24), TypeError);
      should.throws(() => new UIDGenerator(16, UIDGenerator.BASE16, 2), TypeError);
    });

  });


  describe('#bitSize', () => {

    it('is the same value as is passed to the constructor or calculated from uidLength', () => {
      new UIDGenerator().bitSize.should.be.exactly(128);
      new UIDGenerator(256).bitSize.should.be.exactly(256);
      new UIDGenerator(null, 11).bitSize.should.be.exactly(65);
    });

  });


  describe('#baseEncoding', () => {

    it('is the same value as is passed to the constructor', () => {
      new UIDGenerator().baseEncoding.should.be.exactly(UIDGenerator.BASE58);
      new UIDGenerator(UIDGenerator.BASE62).baseEncoding.should.be.exactly(UIDGenerator.BASE62);
      new UIDGenerator(8, '01').baseEncoding.should.be.exactly('01');
    });

  });


  describe('#base', () => {

    it('is the encoding base number (which is the length of the baseEncoding)', () => {
      new UIDGenerator().base.should.be.exactly(58);
      new UIDGenerator(UIDGenerator.BASE62).base.should.be.exactly(62);
      new UIDGenerator(UIDGenerator.BASE16, 11).base.should.be.exactly(16);
      new UIDGenerator(256, '123abc').base.should.be.exactly(6);
    });

  });


  describe('#uidLength', () => {

    it('is the same value as passed to the constructor or the calculated UID length', () => {
      new UIDGenerator(null, 1).uidLength.should.be.exactly(1);
      new UIDGenerator('abc', 10).uidLength.should.be.exactly(10);
      new UIDGenerator().uidLength.should.be.exactly(22);
      new UIDGenerator(256, UIDGenerator.BASE62).uidLength.should.be.exactly(43);
      new UIDGenerator(512, '01').uidLength.should.be.exactly(512);
    });

  });


  describe('UIDGenerator instance', () => {

    it('generates UIDs asynchronously with a callback', (done) => {
      new UIDGenerator().generate((err, uid) => {
        uid.should.have.type('string');
        done(err);
      });
    });

    it('generates UIDs asynchronously with a promise', (done) => {
      new UIDGenerator().generate()
        .then((uid) => {
          uid.should.have.type('string');
          done();
        })
        .catch(done);
    });

    it('generates UIDs synchronously', () => {
      new UIDGenerator().generateSync().should.have.type('string');
    });

    it('generates UIDs with the specified baseEncoding and bitSize or uidLength', () => {
      let uidgen = new UIDGenerator();
      let uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator(UIDGenerator.BASE16);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator('01');
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator(256);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator(null, 20);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator(512, UIDGenerator.BASE62);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator(UIDGenerator.BASE16, 20);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));
    });

    it('produces UIDs of the correct length even if crypto.randomBytes() returns a Buffer with leading zeros', () => {
      const randomBytes = crypto.randomBytes;

      // Mock crypto.randomBytes
      crypto.randomBytes = function(size) {
        return Buffer.alloc(size, 1);
      };
      let uidgen = new UIDGenerator(256);
      let uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      crypto.randomBytes = function(size) {
        return Buffer.alloc(size);
      };
      uidgen = new UIDGenerator();
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      uidgen = new UIDGenerator('abc', 3);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      crypto.randomBytes = function(size) {
        const buffer = Buffer.alloc(size);
        buffer[size - 1] = 255;
        return buffer;
      };
      uidgen = new UIDGenerator(null, 20);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      // Restore crypto.randomBytes
      crypto.randomBytes = randomBytes;
    });

    it('base-encodes UIDs in a standard fasion', () => {
      const randomBytes = crypto.randomBytes;
      let buffer;

      // Mock crypto.randomBytes
      crypto.randomBytes = function(size) {
        return buffer = randomBytes(size);
      };

      new UIDGenerator(UIDGenerator.BASE16).generateSync().should.be.exactly(buffer.toString('hex'));

      // Restore crypto.randomBytes
      crypto.randomBytes = randomBytes;
    });

    it('correctly handles asynchronous errors', (done) => {
      const randomBytes = crypto.randomBytes;
      const error = new Error('Fake error');

      // Mock crypto.randomBytes
      crypto.randomBytes = function(size, cb) {
        process.nextTick(() => {
          cb(error);
        });
      };

      new UIDGenerator().generate()
        .catch((err) => {
          err.should.be.exactly(error);
        })
        .then(() => {
          new UIDGenerator().generate((err) => {
            err.should.be.exactly(error);
            // Restore crypto.randomBytes
            crypto.randomBytes = randomBytes;
            done();
          });
        });
    });

  });

});
