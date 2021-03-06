'use strict';

const UIDGenerator = require('../index');

const crypto = require('crypto');
const should = require('should');

describe('UIDGenerator', () => {

  describe('new UIDGenerator(bitSize, baseEncoding)', () => {

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

    it('accepts the bitSize and baseEncoding parameters', () => {
      const uidgen = new UIDGenerator(512, UIDGenerator.BASE62);

      uidgen.bitSize.should.be.exactly(512);
      uidgen.baseEncoding.should.be.exactly(UIDGenerator.BASE62);
      uidgen.uidLength.should.be.exactly(86);
      uidgen.base.should.be.exactly(62);

      new UIDGenerator(undefined, UIDGenerator.BASE16)
        .should.deepEqual(new UIDGenerator(UIDGenerator.BASE16));
    });

    it('accepts a custom baseEncoding', () => {
      new UIDGenerator('123abc').baseEncoding.should.be.exactly('123abc');
      new UIDGenerator(512, 'abc123').baseEncoding.should.be.exactly('abc123');
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
      should.throws(() => new UIDGenerator(null), TypeError);
      should.throws(() => new UIDGenerator(true), TypeError);
      should.throws(() => new UIDGenerator({}), TypeError);
      should.throws(() => new UIDGenerator([]), TypeError);
      should.throws(() => new UIDGenerator(/regex/), TypeError);
    });

    it('throws if baseEncoding is not a string', () => {
      should.throws(() => new UIDGenerator(128, null), TypeError);
      should.throws(() => new UIDGenerator(128, false), TypeError);
      should.throws(() => new UIDGenerator(128, 256), TypeError);
      should.throws(() => new UIDGenerator(128, {}), TypeError);
      should.throws(() => new UIDGenerator(128, []), TypeError);
      should.throws(() => new UIDGenerator(128, /regex/), TypeError);
      should.throws(() => new UIDGenerator(128, new Date()), TypeError);
    });

    it('throws if baseEncoding is too short', () => {
      should.throws(() => new UIDGenerator(''), Error);
      should.throws(() => new UIDGenerator('1'), Error);
    });

    it('throws if baseEncoding contains non-unique characters', () => {
      should.throws(() => new UIDGenerator('11'), Error);
      should.throws(() => new UIDGenerator('011'), Error);
      should.throws(() => new UIDGenerator('110'), Error);
      should.throws(() => new UIDGenerator('101'), Error);
      should.throws(() => new UIDGenerator('0121'), Error);
      should.throws(() => new UIDGenerator('01213'), Error);
    });

  });


  describe('#bitSize', () => {

    it('is the same value as is passed to the constructor or calculated from uidLength', () => {
      new UIDGenerator().bitSize.should.be.exactly(128);
      new UIDGenerator(256).bitSize.should.be.exactly(256);
      new UIDGenerator(8, '01').bitSize.should.be.exactly(8);
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

    it('is the correct, calculated UID length', () => {
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

    it('generates UIDs asynchronously with a promise', () => {
      return new UIDGenerator().generate()
        .then((uid) => {
          uid.should.have.type('string');
        });
    });

    it('generates UIDs asynchronously with async/await', async () => {
      const uidgen = new UIDGenerator();
      const uid = await uidgen.generate();
      uid.should.have.type('string');
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

      uidgen = new UIDGenerator(512, UIDGenerator.BASE62);
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));
    });

    it('produces UIDs of the correct length even if crypto.randomBytes() returns a Buffer with leading zeros', () => {
      // Mock crypto.randomBytes
      const {randomBytes} = crypto;
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

      uidgen = new UIDGenerator('abc');
      uid = uidgen.generateSync();
      uid.should.match(new RegExp('^[' + uidgen.baseEncoding + ']{' + uidgen.uidLength + '}$'));

      crypto.randomBytes = function(size) {
        const buffer = Buffer.alloc(size);
        buffer[size - 1] = 255;
        return buffer;
      };

      crypto.randomBytes = randomBytes; // Restore original
    });

    it('base-encodes UIDs in a standard fashion', () => {
      let buffer;

      // Mock crypto.randomBytes
      const {randomBytes} = crypto;
      crypto.randomBytes = function(size) {
        buffer = randomBytes(size);
        return buffer;
      };

      new UIDGenerator(UIDGenerator.BASE16).generateSync()
        .should.equal(buffer.toString('hex'));

      new UIDGenerator(256, UIDGenerator.BASE16).generateSync()
        .should.equal(buffer.toString('hex'));

      crypto.randomBytes = randomBytes; // Restore original
    });

    it('correctly handles asynchronous errors', (done) => {
      const error = new Error('Fake error');

      // Mock crypto.randomBytes
      const {randomBytes} = crypto;
      crypto.randomBytes = function(size, cb) {
        process.nextTick(() => {
          cb(error);
        });
      };

      new UIDGenerator().generate()
        .then(
          () => {
            should.fail('generate() should have thrown');
          },
          (err) => {
            err.should.be.exactly(error);

            new UIDGenerator().generate((err) => {
              err.should.be.exactly(error);
              crypto.randomBytes = randomBytes; // Restore original
              done();
            });
          }
        );
    });

  });

});
