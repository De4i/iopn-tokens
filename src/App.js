import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

// GANTI 4 ALAMAT INI
const USDC   = "0xGANTI_USDC";
const USDT   = "0xGANTI_USDT";
const DE4I   = "0xGANTI_DE4I";
const FAUCET = "0xGANTI_FAUCET";

const ERC20 = ["function balanceOf(address) view returns (uint256)"];
const FAUCET_ABI = ["function claim()"];

function App() {
  const [acc, setAcc] = useState('');
  const [bal, setBal] = useState({u:'0', t:'0', d:'0'});

  const connect = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x3d8' }] });
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    setAcc(await s.getAddress());
    refresh();
  };

  const refresh = async () => {
    if (!acc) return;
    const p = new ethers.BrowserProvider(window.ethereum);
    const u = new ethers.Contract(USDC, ERC20, p);
    const t = new ethers.Contract(USDT, ERC20, p);
    const d = new ethers.Contract(DE4I, ERC20, p);
    setBal({
      u: Number(ethers.formatUnits(await u.balanceOf(acc),6)).toLocaleString(),
      t: Number(ethers.formatUnits(await t.balanceOf(acc),6)).toLocaleString(),
      d: Number(ethers.formatUnits(await d.balanceOf(acc),18)).toLocaleString()
    });
  };

  const claim = async () => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const f = new ethers.Contract(FAUCET, FAUCET_ABI, s);
    await (await f.claim()).wait();
    alert("10.000 USDC + 10.000 USDT + 500 DE4I MASUK!");
    refresh();
  };

  return (
    <div className="App">
      <h1>IOPN DEX</h1>
      {!acc ? 
        <button onClick={connect}>CONNECT METAMASK</button> :
        <>
          <p>Wallet: {acc.slice(0,10)}...</p>
          <div className="bal">
            <p>USDC: {bal.u}</p>
            <p>USDT: {bal.t}</p>
            <p>DE4I: {bal.d}</p>
          </div>

          <div className="card">
            <h2>Claim Faucet</h2>
            <button onClick={claim}>CLAIM 10.000 USDC + 10.000 USDT + 500 DE4I</button>
          </div>

          <div className="card">
            <h2>Swap</h2>
            <button>SWAP USDC → OPN (Coming Soon)</button>
          </div>

          <button onClick={refresh}>Refresh Saldo</button>
        </>
      }
    </div>
  );
}
export default App;
