# ⚡ Quick Start - Blockchain Integration

## 🎯 Goal
Enable real blockchain staking in your yield farming platform.

---

## ✅ Pre-Flight Checklist

### 1. Get WalletConnect Project ID (5 minutes)
- [ ] Go to https://cloud.reown.com
- [ ] Sign up/login
- [ ] Create new project
- [ ] Copy Project ID

### 2. Configure Environment (2 minutes)
- [ ] Create `client/.env` file
- [ ] Add: `VITE_WALLETCONNECT_PROJECT_ID=your_project_id`
- [ ] Save file

### 3. Start Applications (1 minute)
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## 🧪 Test the Integration

### Demo Mode Test (No wallet needed)
1. [ ] Open http://localhost:5173
2. [ ] Browse pools (should show Base chain pools)
3. [ ] Try staking WITHOUT connecting wallet
4. [ ] Should see: "Demo mode - connect wallet for real staking"
5. [ ] ✅ Demo mode works!

### Blockchain Mode Test (Testnet - Safe to test)
1. [ ] Install MetaMask browser extension
2. [ ] Add Base Sepolia testnet:
   - Network: Base Sepolia
   - RPC: https://sepolia.base.org
   - Chain ID: 84532
3. [ ] Get testnet ETH: https://faucet.quicknode.com/base/sepolia
4. [ ] Get testnet USDC: https://staging.aave.com/faucet
5. [ ] Connect wallet in app
6. [ ] Switch to Base Sepolia when prompted
7. [ ] Find an Aave USDC pool
8. [ ] Click "Stake"
9. [ ] Approve in wallet (Step 1/2)
10. [ ] Stake in wallet (Step 2/2)
11. [ ] ✅ Blockchain mode works!

### Mainnet Test (REAL MONEY - Use small amounts!)
1. [ ] Have real ETH on Base mainnet (~$5-10 for gas)
2. [ ] Have real USDC on Base (~$10-50 to test)
3. [ ] Connect wallet
4. [ ] Switch to Base mainnet
5. [ ] Start with smallest pool
6. [ ] Stake $10-20 first
7. [ ] Verify transaction on BaseScan
8. [ ] ✅ Mainnet works!

---

## 📁 Files Created

New files added to your project:

```
client/src/
├── config/
│   ├── contracts.ts          # Contract addresses for Base
│   └── abis.ts               # Smart contract ABIs
├── services/
│   └── protocolAdapter.ts    # Protocol detection & config
└── hooks/
    └── useBlockchainStake.tsx # Blockchain transaction logic

Modified files:
├── hooks/useStake.tsx        # Added blockchain integration
├── components/stake/StakeModal.tsx
└── components/strategy/StrategyExecutionModal.tsx

Documentation:
└── BLOCKCHAIN_INTEGRATION_GUIDE.md  # Comprehensive guide
```

---

## 🎓 What You Can Do Now

### ✅ Available Features
- **Stake in Aave V3** (USDC, WETH, DAI on Base)
- **Stake in Moonwell** (USDC, WETH, DAI on Base)
- **Execute AI strategies** (real blockchain transactions)
- **Dual mode operation** (works with/without wallet)
- **Token approvals** (automatic handling)
- **Transaction tracking** (real-time status)

### ⏳ Coming Soon (Easy to add)
- Unstaking from protocols
- More protocols (Compound V3, Seamless, etc.)
- More tokens (USDT, wstETH, etc.)
- Gas estimation
- Transaction history on-chain

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Pool not supported" | Only Aave & Moonwell work now. Others show this message |
| Wallet won't connect | Check you have MetaMask/wallet installed |
| Wrong network | Click "Switch Network" when prompted |
| Transaction fails | Check you have ETH for gas |
| Nothing happens | Check browser console for errors |

---

## 💰 Cost Estimate

### Testnet (FREE)
- All tokens are free from faucets
- Perfect for unlimited testing

### Mainnet (Real costs)
- **Gas per transaction:** $0.50 - $2
- **Token approval:** $0.50 - $1 (one-time per token)
- **Staking:** $1 - $3
- **Strategy (5 pools):** ~$10-15 total gas

---

## 🔥 Pro Tips

1. **Always test on testnet first!**
2. **Start with $10-20 on mainnet**
3. **Keep $5-10 ETH for gas**
4. **Approve once, stake many times**
5. **Check BaseScan to verify transactions**
6. **Use demo mode for UI testing**

---

## 📞 Next Steps

### If Everything Works:
1. ✅ Test on testnet thoroughly
2. ✅ Test mainnet with small amount
3. ✅ Add more protocols (see guide)
4. ✅ Deploy to production

### If Something Doesn't Work:
1. Check browser console for errors
2. Read BLOCKCHAIN_INTEGRATION_GUIDE.md
3. Test each step individually
4. Check wallet is on correct network

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Wallet connects successfully
- ✅ Pools show "Real blockchain transaction" message
- ✅ Approval transaction appears in wallet
- ✅ Stake transaction appears in wallet
- ✅ Transaction shows on BaseScan
- ✅ Pool balance increases

---

**Time to complete setup:** 10-15 minutes
**Time to first blockchain transaction:** 20-30 minutes

Good luck! 🚀
