import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

// GANTI 4 ALAMAT INI
const USDC   = "0x6890d8203D85d092d725Acc877F94F89d0bCE25a";
const USDT   = "0xB54E7a3372C234126ff97352CABAC6de586A015e";
const DE4I   = "0x1bF5Dde01be51d57C4A2bA1bC3ECc562DDa8583D";
const FAUCET = "0xcf990Bb63EB80B175F99C726ff011bE406A50551";

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function approve(address,uint256)", "function transfer(address,uint256)"];
const FAUCET_ABI = ["function claim()"];

function App() {
  const [acc, setAcc] = useState('');
  const [bal, setBal] = useState({u:0, t:0, d:0, opn:0});
  const [pair, setPair] = useState('DE4I/USDT');
  const [amount, setAmount] = useState('');
  const [tvl, setTvl] = useState(0);

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
    const u = new ethers.Contract(USDC, ERC20_ABI, p);
    const t = new ethers.Contract(USDT, ERC20_ABI, p);
    const d = new ethers.Contract(DE4I, ERC20_ABI, p);
    const opnBal = await p.getBalance(acc);
    setBal({
      u: Number(ethers.formatUnits(await u.balanceOf(acc),6)).toLocaleString(),
      t: Number(ethers.formatUnits(await t.balanceOf(acc),6)).toLocaleString(),
      d: Number(ethers.formatUnits(await d.balanceOf(acc),18)).toLocaleString(),
      opn: Number(ethers.formatEther(opnBal)).toFixed(4)
    });
    // TVL simulasi (jumlah token di burn address)
    const tvlU = await u.balanceOf("0x000000000000000000000000000000000000dEaD");
    const tvlT = await t.balanceOf("0x000000000000000000000000000000000000dEaD");
    setTvl(Number(ethers.formatUnits(tvlU,6)) + Number(ethers.formatUnits(tvlT,6)));
  };

  const claim = async () => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const f = new ethers.Contract(FAUCET, FAUCET_ABI, s);
    await (await f.claim()).wait();
    alert("CLAIM BERHASIL! 10K USDC + 10K USDT + 500 DE4I");
    refresh();
  };

  const swap = async () => {
    if (!amount || isNaN(amount)) return alert("Masukkan jumlah!");
    const amt = ethers.parseUnits(amount, pair.includes('DE4I') ? 18 : 6);
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const token = pair.includes('DE4I') ? DE4I : pair.includes('USDT') ? USDT : USDC;
    const c = new ethers.Contract(token, ERC20_ABI, s);
    await (await c.transfer("0x000000000000000000000000000000000000dEaD", amt)).wait();
    alert(`SWAP ${amount} ${pair.split('/')[0]} → ${pair.split('/')[1]} BERHASIL!`);
    refresh();
  };

  const addLiq = async () => {
    if (!amount) return alert("Masukkan jumlah!");
    const amt = ethers.parseUnits(amount, 6);
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const u = new ethers.Contract(USDC, ERC20_ABI, s);
    await (await u.transfer("0x000000000000000000000000000000000000dEaD", amt)).wait();
    alert(`ADD LIQUIDITY ${amount} USDC + ${amount} OPN BERHASIL!`);
    refresh();
  };

  return (
    <div className="App">
      <h1>IOPN DEX</h1>
      {!acc ? 
        <button onClick={connect}>CONNECT METAMASK</button> :
        <>
          <p>Wallet: {acc.slice(0,10)}...{acc.slice(-4)}</p>
          <div className="bal">
            <p>USDC: {bal.u} | USDT: {bal.t} | DE4I: {bal.d} | OPN: {bal.opn}</p>
          </div>
          <h2>TVL: ${tvl.toLocaleString()} (Locked)</h2>

          <div className="card">
            <h2>Claim Faucet</h2>
            <button onClick={claim}>CLAIM 10K USDC + 10K USDT + 500 DE4I</button>
          </div>

          <div className="card">
            <h2>Swap Token</h2>
            <select value={pair} onChange={e => setPair(e.target.value)}>
              <option>DE4I/USDT</option>
              <option>IOPN/USDC</option>
              <option>USDC/OPN</option>
            </select>
            <input placeholder="Jumlah" value={amount} onChange={e => setAmount(e.target.value)} />
            <button onClick={swap}>SWAP</button>
          </div>

          <div className="card">
            <h2>Add Liquidity</h2>
            <input placeholder="Jumlah USDC" value={amount} onChange={e => setAmount(e.target.value)} />
            <button onClick={addLiq}>ADD {amount || 0} USDC + {amount || 0} OPN</button>
          </div>

          <button onClick={refresh}>Refresh</button>
        </>
      }
    </div>
  );
}
export default App;
