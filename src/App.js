import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

// GANTI 4 ALAMAT INI
const USDC   = "0x6890d8203D85d092d725Acc877F94F89d0bCE25a";
const USDT   = "0xB54E7a3372C234126ff97352CABAC6de586A015e";
const DE4I   = "0x1bF5Dde01be51d57C4A2bA1bC3ECc562DDa8583D";
const FAUCET = "0xcf990Bb63EB80B175F99C726ff011bE406A50551";
const ROUTER = "0x36B069997640B5aEB9bBB1b20C75aC1dC5907D3f";

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function approve(address,uint256)", "function transfer(address,uint256)"];
const FAUCET_ABI = ["function claim()"];
const ROUTER_ABI = ["function addLiquidity(address,address,uint,uint) external", "function swapExactTokensForTokens(uint,address,address,address) external"];

function App() {
  const [acc, setAcc] = useState('');
  const [bal, setBal] = useState({u:0, t:0, d:0});
  const [pair, setPair] = useState('USDC/OPN');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
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
    setBal({
      u: Number(ethers.formatUnits(await u.balanceOf(acc),6)).toLocaleString(),
      t: Number(ethers.formatUnits(await t.balanceOf(acc),6)).toLocaleString(),
      d: Number(ethers.formatUnits(await d.balanceOf(acc),18)).toLocaleString()
    });
    // TVL simulasi
    setTvl(Math.random() * 1000000); // Ganti dengan call real pair reserves
  };

  const claim = async () => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const f = new ethers.Contract(FAUCET, FAUCET_ABI, s);
    await (await f.claim()).wait();
    alert("CLAIM BERHASIL!");
    refresh();
  };

  const calculateAmountB = async () => {
    if (!amountA) return;
    // Simulasi quote
    setAmountB(Number(amountA) * 1.0); // 1:1 ratio, ganti dengan real quote dari router.getAmountOut
  };

  const swap = async () => {
    if (!amountA) return alert("Masukkan jumlah!");
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const r = new ethers.Contract(ROUTER, ROUTER_ABI, s);
    const tokenA = pair.split('/')[0] === 'USDC' ? USDC : DE4I;
    const tokenB = pair.split('/')[1] === 'USDT' ? USDT : USDC;
    await (await r.swapExactTokensForTokens(ethers.parseUnits(amountA,6), tokenA, tokenB, acc)).wait();
    alert("SWAP BERHASIL!");
    refresh();
  };

  const addLiq = async () => {
    if (!amountA || !amountB) return alert("Masukkan jumlah!");
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const r = new ethers.Contract(ROUTER, ROUTER_ABI, s);
    const tokenA = USDC; // Misal USDC/OPN
    const tokenB = ethers.ZeroAddress; // OPN native
    await (await r.addLiquidity(tokenA, tokenB, ethers.parseUnits(amountA,6), ethers.parseUnits(amountB,18))).wait();
    alert("ADD LIQUIDITY MANUAL BERHASIL!");
    refresh();
  };

  return (
    <div className="App">
      <h1>IOPN DEX - Uniswap Style</h1>
      {!acc ? 
        <button onClick={connect}>CONNECT WALLET</button> :
        <>
          <p>Wallet: {acc.slice(0,10)}...</p>
          <div className="bal">
            <p>USDC: {bal.u} | USDT: {bal.t} | DE4I: {bal.d}</p>
          </div>
          <h2>TVL: ${tvl.toLocaleString()}</h2>

          <div className="card">
            <h2>Claim Faucet</h2>
            <button onClick={claim}>CLAIM 10K USDC + 10K USDT + 500 DE4I</button>
          </div>

          <div className="card">
            <h2>Swap</h2>
            <select value={pair} onChange={e => setPair(e.target.value)}>
              <option>DE4I/USDT</option>
              <option>IOPN/USDC</option>
              <option>USDC/OPN</option>
            </select>
            <input placeholder="Amount A" value={amountA} onChange={e => setAmountA(e.target.value)} onBlur={calculateAmountB} />
            <input placeholder="Amount B (auto)" value={amountB} disabled />
            <button onClick={swap}>SWAP</button>
          </div>

          <div className="card">
            <h2>Add Liquidity (Manual)</h2>
            <select>
              <option>USDC/OPN</option>
            </select>
            <input placeholder="Amount USDC" value={amountA} onChange={e => setAmountA(e.target.value)} onBlur={calculateAmountB} />
            <input placeholder="Amount OPN" value={amountB} onChange={e => setAmountB(e.target.value)} />
            <button onClick={addLiq}>ADD LIQUIDITY</button>
          </div>

          <button onClick={refresh}>Refresh</button>
        </>
      }
    </div>
  );
}
export default App;
