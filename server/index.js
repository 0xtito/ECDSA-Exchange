const express = require("express");
const SHA256 = require("crypto-js/sha256");
const secp = require("@noble/secp256k1");
const app = express();
const cors = require("cors");
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// bitcoin addresses
const originalPrivateKeys = {
  one: secp.utils.randomPrivateKey(),
  two: secp.utils.randomPrivateKey(),
  three: secp.utils.randomPrivateKey(),
};

const originalKeys = {
  one: {
    privateKey: originalPrivateKeys.one,
    publicKey: secp.getPublicKey(originalPrivateKeys.one),
  },
  two: {
    privateKey: originalPrivateKeys.two,
    publicKey: secp.getPublicKey(originalPrivateKeys.two),
  },
  three: {
    privateKey: originalPrivateKeys.three,
    publicKey: secp.getPublicKey(originalPrivateKeys.three),
  },
};

const reformatedKeys = {
  one: {
    privateKey: convertToPrivateKeyFormat(originalPrivateKeys.one),
    publicKey: convertToPublicKeyFormat(originalKeys.one.publicKey),
  },
  two: {
    privateKey: convertToPrivateKeyFormat(originalPrivateKeys.two),
    publicKey: convertToPublicKeyFormat(originalKeys.two.publicKey),
  },
  three: {
    privateKey: convertToPrivateKeyFormat(originalPrivateKeys.three),
    publicKey: convertToPublicKeyFormat(originalKeys.three.publicKey),
  },
};

const accounts = {
  one: {
    publicKey: reformatedKeys.one.publicKey,
    privateKey: reformatedKeys.one.privateKey,
    balance: 100,
  },
  two: {
    publicKey: reformatedKeys.two.publicKey,
    privateKey: reformatedKeys.two.privateKey,
    balance: 50,
  },
  three: {
    publicKey: reformatedKeys.three.publicKey,
    privateKey: reformatedKeys.three.privateKey,
    balance: 75,
  },
};

const newKeys = Object.keys(reformatedKeys);
const newValues = Object.values(reformatedKeys);

function convertToPublicKeyFormat(publicKey) {
  publicKey = Buffer.from(publicKey).toString("hex");
  return "0x" + publicKey.slice(publicKey.length - 40);
}

function convertToPrivateKeyFormat(privateKey) {
  return Buffer.from(privateKey).toString("hex");
}

console.log(accounts);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  let balance = 0;
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (address === Object.values(accounts)[i].publicKey) {
      balance = Object.values(accounts)[i].balance;
    }
  }
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { transaction, publicKey, isValid } = req.body;
  let thisAccount;
  let recipientAccount;
  const newPublicKey = "0x" + publicKey.slice(publicKey.length - 40);

  if (isValid) {
    for (let i = 0; i < Object.keys(accounts).length; i++) {
      if (newPublicKey === newValues[i].publicKey) {
        thisAccount = newKeys[i];
      }
      if (transaction.recipient === newValues[i].publicKey) {
        recipientAccount = newKeys[i];
      }
    }
    if (!thisAccount || !recipientAccount) {
      throw "invalid key";
    }
    if (thisAccount && recipientAccount) {
      accounts[thisAccount].balance -= transaction.amount;
      accounts[recipientAccount].balance =
        (accounts[recipientAccount].balance || 0) + +transaction.amount;
    }
  } else {
    res.sendStatus(400);
  }
  console.log(accounts);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
