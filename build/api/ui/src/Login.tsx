import React, { useState, useEffect } from "react";
import { api } from "./rpc";
import useSWR from "swr";
import { EthdoWallets } from "./common/types";
import "./App.css";

// @ts-ignore
window.api = api;

const rootApp = "http://localhost:8080"; // "/" in production

async function apiFetch(route: string, options?: RequestInit) {
  const res = await fetch(`${rootApp}/api/${route}`, options);
  const body = await res.json();
  if (body.success === false) throw Error(body.message || res.statusText);
  if (body.success === true) return body.result;
}
const apiGet = (route: string) => apiFetch(route);
const apiPost = (route: string, data: any) =>
  apiFetch(route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export default function App() {
  const [input, setInput] = useState("");
  const [loginError, setLoginError] = useState<string>();
  const [sessionId, setSessionId] = useState<string>(); // Session ID

  function isLoggedIn() {
    apiGet("login").then(setSessionId, (e) =>
      console.error("Not logged in", e)
    );
  }

  function logIn() {
    setLoginError(undefined);
    apiPost("login", { password: input }).then(setSessionId, (e) =>
      setLoginError(e.message)
    );
  }

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {sessionId ? (
          <div>
            <h3>Logged in</h3>
            <Wallets />
          </div>
        ) : (
          <div>
            <h3>Log in</h3>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={logIn}>Log in</button>
            {loginError && <pre style={{ color: "red" }}>{loginError}</pre>}
          </div>
        )}
      </header>
    </div>
  );
}

function Wallets() {
  const wallets = useSWR<EthdoWallets[], Error>("wallets", apiGet);

  function handleAddAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //  @ts-ignore
    const name = e.target.name.value;
    apiPost("wallet", { name }).then(() => wallets.revalidate(), console.error);
  }
  function handleAddWallet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //  @ts-ignore
    const name = e.target.name.value;
    apiPost("account", { account: name, passphrase: "sample-password" }).then(
      () => wallets.revalidate(),
      console.error
    );
  }

  return (
    <div>
      <form onSubmit={handleAddWallet}>
        <input name="name" />
        <button type="submit">Add wallet</button>
      </form>

      <div className="wallets">
        {(wallets.data || []).map((wallet) => (
          <div key={wallet.name} className="wallet">
            <strong>{wallet.name}</strong>
            <form onSubmit={handleAddAccount}>
              <input name="name" />
              <button type="submit">Add account</button>
            </form>

            <ul>
              {wallet.accounts.map((account) => (
                <li key={account}>{account}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
