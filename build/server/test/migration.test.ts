import "mocha";
import assert from "assert";
import { decryptPrysmKeystore } from "../src/services/migratePrysmKeys";

describe("Import accounts controlled by validator to ethdo", () => {
  const cases: {
    id: string;
    password: string;
    keystore: string;
    privateKey: string;
  }[] = [
    {
      id: "Test validator",
      password: "password",
      keystore: `{"publickey":"8e4e4a890d62678e9d1695046eb8d6e32203e0aca21f10246f2ded447997ef1506b2d5f0588ebdf997adfe9bf946ac37","crypto":{"cipher":"aes-128-ctr","ciphertext":"57ba3910f06b85f8162f3aa8784daaa3235a5f8826875a4ddd1821fafc6e80f6","cipherparams":{"iv":"9b01f36cdfebcd95849494f0081be075"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"b3f31eee66a76a5e5cf6f9f4f47f5d0fc8002260ecf96d5e72d81981ad9050e2"},"mac":"072d3590e55046030b08db520cbc687c645f6dd292cc960a6f661e56dc4c9688"},"id":"6547def4-7170-4b08-aa53-c84ad0d93e99"}`,
      privateKey:
        "0x2ac2527e3ff205fd2f9212ff6dd2d51a9f1d45220451bfdf17eede2b829adfe3"
    },
    {
      id: "Test withdrawl",
      password: "password",
      keystore: `{"publickey":"b318b4d5fb94cae426ba5d0a47cbd45e1acd0b49d231c34c48c66674bb88788a75c7468484d74e2e98e9bd0f147b8971","crypto":{"cipher":"aes-128-ctr","ciphertext":"167483ea9a59a1af95f0c94e65bd89907bcc5bf307f9ed7877a7b71202c60cdc","cipherparams":{"iv":"38595537498bb9d95642164c3298b71c"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"3d768457015bd1cfc8226608f5fb4ee0829244850efa1d27c156f9eee69c3a16"},"mac":"e9851dcd50516823783958e0914366cde392fee85080f1f2e9496d03cb419732"},"id":"c5de97bb-6d50-4d06-a737-27f24bc5d147"}`,
      privateKey:
        "0x45d5fc258c53c4cbddbf86055a65eb488368f30c32bbf99192ba09c5a4e6cc48"
    },
    {
      id: "Edu validator",
      password: "0",
      keystore: `{"publickey":"abca1d06e3941d6459c8158ce86b0731cf52fd803dd3ffae73e4c5cc1e52de29bb3604db2eec018911c0852bcfabac48","crypto":{"cipher":"aes-128-ctr","ciphertext":"7e330c19a7e93b49d39e9351e99a95a0c6af04505b74ed31bcda4b240f47bf65","cipherparams":{"iv":"89dba2a086277d1170625cc00cd957f8"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"f4d1e34477f769a271f14697b1733a6708f4ee8d29cba2b8018ba015a6f1baac"},"mac":"38b43880b41f73b3a38e34d1c0219ab86c16dce8c56196a08550081c43fb1c30"},"id":"dd405089-d089-4c8a-87a8-4cba9d6abeb4"}`,
      privateKey:
        "0x66a07f2ffcaa8ddaafb26c433f258d13faa8d97272a074efb82c4732e4b08a51"
    },
    {
      id: "Edu withdrawl",
      password: "0",
      keystore: `{"publickey":"af49565e75d8c841a1df2031e3c87cbdb3a4aed89fabe6dfd2dfda13d205b8689e3dbf5801cfb32c2f5e3551597884dc","crypto":{"cipher":"aes-128-ctr","ciphertext":"9409f62e1fc076bfdb623ca620f6bcaeeeb65837d64bffa1b17ffca6c2f50527","cipherparams":{"iv":"9c0a76194e84fe1af033f828998deccd"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"71310264e0cd03af2f7e6a2619554aef0022713e024f022dbd2effbfab82d86d"},"mac":"d2c413d204cc66f71b86c4003582d8375eaf4e0d9276bc49ebea7dfdc79e2474"},"id":"9bb2d87d-a384-41e9-bca4-58541e63242a"}`,
      privateKey:
        "0x4e18cf98c9474443560ccf14c50438a5b4db8e696faabbc0cba99479fc6d1347"
    }
  ];

  for (const { id, password, keystore, privateKey } of cases) {
    it(`Decrypt keystore: ${id}`, async function() {
      this.timeout(10000);
      const privateKeyResult = await decryptPrysmKeystore(keystore, password);
      assert.equal(privateKeyResult, privateKey, "Wrong privateKey");
    });
  }
});
