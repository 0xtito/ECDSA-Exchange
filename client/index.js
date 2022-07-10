import "./index.scss";

const server = "http://localhost:3042";

const SHA256 = require("crypto-js/sha256");
const secp = require("@noble/secp256k1");

document
  .getElementById("exchange-address")
  .addEventListener("input", ({ target: { value } }) => {
    if (value === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    fetch(`${server}/balance/${value}`)
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });

document
  .getElementById("transfer-amount")
  .addEventListener("click", async () => {
    const amount = document.getElementById("send-amount").value;
    const recipient = document.getElementById("recipient").value;
    const privKey = document.getElementById("private-key").value;
    const transaction = {
      amount,
      recipient,
    };

    // the corresponding public key to the private key provided
    const publicKey = secp.getPublicKey(privKey);
    const msgHash = SHA256(JSON.stringify(transaction)).toString();
    const signature = await secp.sign(msgHash, privKey);
    const isValid = secp.verify(
      Buffer.from(signature).toString("hex"),
      msgHash,
      publicKey
    );

    const body = JSON.stringify({
      transaction,
      publicKey: Buffer.from(publicKey).toString("hex"),
      isValid,
    });

    const request = new Request(`${server}/send`, { method: "POST", body });

    fetch(request, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });
