const fetch = require('node-fetch');
const fs = require('fs');

async function getTrades(symbol, fromId) {
    let accum = []
    let lastId = fromId
    let aggTrades = []
    do {
        try {
            const res = await fetch(`https://api.binance.com/api/v3/aggTrades?symbol=${symbol}&fromId=${lastId}&limit=1000`)
            aggTrades = await res.json()
            console.log(res.headers.get('x-mbx-used-weight-1m'))
            if (aggTrades.length === 0) break
            const { l, T }  = aggTrades[aggTrades.length - 1]
            console.log(new Date(T))
            lastId = l + 1
            accum = accum.concat(aggTrades)
        } catch (e) {
            console.error(e)
        } 
    } while (aggTrades.length >= 1000)

    let output = "Timestamp,Price,Quantity,TradeId,isBuyerMaker,BestPrice\n"
    for (i of accum) {
        let { T, p, q, a, m, M } = i;
        output += `${T},${p},${q},${a},${m},${M}\n`;
    }
    fs.writeFileSync(`binanceTrades-${symbol}-${fromId}-${lastId}.csv`, output)
}

getTrades('BTCUSDT', '25000')
