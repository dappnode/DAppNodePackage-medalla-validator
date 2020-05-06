import React, { useState } from "react";
import { apiClient, useApi } from "./rpc";
import { EthdoWallets } from "./common/types";
import "./App.css";

function Wallet({
  wallet,
  fetchWallets,
}: {
  wallet: EthdoWallets;
  fetchWallets: () => void;
}) {
  const [input, setInput] = useState("");

  function addAccount() {
    apiClient
      .accountCreate(input, wallet.name)
      .then(fetchWallets)
      .catch(console.error);
  }

  return (
    <div key={wallet.name} className="wallet">
      <strong>{wallet.name}</strong>
      <div>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={addAccount}>Add account</button>
      </div>

      <ul>
        {wallet.accounts.map((account) => (
          <li key={account}>{account}</li>
        ))}
      </ul>
    </div>
  );
}

function Wallets() {
  const wallets = useApi.walletsGet();

  return (
    <div>
      {wallets.data ? (
        <div className="wallets">
          {wallets.data.map((wallet) => (
            <div key={wallet.name}>
              <Wallet wallet={wallet} fetchWallets={wallets.revalidate} />
            </div>
          ))}
        </div>
      ) : wallets.isValidating ? (
        "Loading..."
      ) : wallets.error ? (
        wallets.error.message
      ) : null}
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");

  return (
    <div className="App">
      <header className="App-header">
        <h1>Wallets</h1>
        <Wallets />
      </header>
    </div>
  );
}
