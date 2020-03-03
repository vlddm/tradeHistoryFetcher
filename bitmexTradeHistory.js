const fetch = require('node-fetch');
const fs = require('fs');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTrades(symbol, fromId) {
    const count = 1000
    let accum = []
    let lastId = fromId
    let start = lastId
    let trades = []
    let i = 0
    do {
        try {
            const res = await fetch(`https://www.bitmex.com/api/v1/trade?symbol=${symbol}&count=${count}&start=${lastId}&reverse=false`)
            trades = await res.json()
            const remainingLimit = res.headers.get('x-ratelimit-remaining')
            console.log(remainingLimit)
            
            if (trades.length === 0) break
            console.log(trades[trades.length-1].timestamp)
            accum = accum.concat(trades)
            lastId = lastId + count
            await sleep(1300)
            i++;
            if (i>=100) {
                storeCSV(accum, start, lastId)
                start = lastId
            }
        } catch (e) {
            console.error(e)
            console.log(trades)
        } 
    } while (trades.length >= count)
}

function storeCSV(data, start, end) {
    let output = "Timestamp,Price,Quantity,TradeId,Side\n"
    for (i of data) {
        let { timestamp, price, size, trdMatchID, side } = i;
        output += `${timestamp},${price},${size},${trdMatchID},${side}\n`;
    }
    fs.writeFileSync(`binanceTrades-${symbol}-${start}-${end}.csv`, output)
}

getTrades('XBTUSD', 9000000)
