const express = require("express");
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

const originalPublicKeys = {
  one: secp.getPublicKey(originalPrivateKeys.one),
  two: secp.getPublicKey(originalPrivateKeys.two),
  three: secp.getPublicKey(originalPrivateKeys.three),
};

const keys = {
  one: {
    privateKey: convertToPrivateKeyFormat(originalPrivateKeys.one),
    publicKey: convertToPublicKeyFormat(originalPublicKeys.one),
  },
  two: {
    privateKey: convertToPrivateKeyFormat(originalPrivateKeys.two),
    publicKey: convertToPublicKeyFormat(originalPublicKeys.two),
  },
  three: {
    privateKey: convertToPrivateKeyFormat(originalPrivateKeys.three),
    publicKey: convertToPublicKeyFormat(originalPublicKeys.three),
  },
};

const accounts = {
  one: {
    publicKey: keys.one.publicKey,
    privateKey: keys.one.privateKey,
    balance: 100,
  },
  two: {
    publicKey: keys.two.publicKey,
    privateKey: keys.two.privateKey,
    balance: 50,
  },
  three: {
    publicKey: keys.three.publicKey,
    privateKey: keys.three.privateKey,
    balance: 75,
  },
};

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
  const { sender, recipient, amount } = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
