async function checkProductPrice(productId) {
  try {
    const result = await browser.storage.local.get(['products']);
    const products = result.products || {};
    const product = products[productId];
    
    if (!product) return;
    
    const tab = await browser.tabs.create({
      url: product.url,
      active: false
    });
    
    await new Promise(resolve => {
      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      browser.tabs.onUpdated.addListener(listener);
    });
    
    const results = await browser.tabs.sendMessage(tab.id, {
      action: 'getPageInfo'
    });
    
    await browser.tabs.remove(tab.id);
    
    if (results && results.price !== null) {
      if (results.image && !product.image) {
        product.image = results.image;
      }
      const currentPrice = parseFloat(results.price);
      const originalPrice = parseFloat(product.originalPrice);
      const previousPrice = parseFloat(product.currentPrice || product.originalPrice);
      
      if (!isNaN(currentPrice) && !isNaN(originalPrice)) {
        const now = new Date().toISOString();
        
        if (!product.priceHistory) {
          product.priceHistory = [{
            price: originalPrice,
            date: product.addedDate || now
          }];
        }
        
        const lastHistoryPrice = product.priceHistory[product.priceHistory.length - 1].price;
        if (currentPrice !== lastHistoryPrice) {
          product.priceHistory.push({
            price: currentPrice,
            date: now
          });
          
          if (product.priceHistory.length > 100) {
            product.priceHistory = product.priceHistory.slice(-100);
          }
        }
        
        product.currentPrice = currentPrice;
        product.lastChecked = now;
        
        const minPrice = Math.min(...product.priceHistory.map(h => h.price));
        product.minPrice = minPrice;
        product.minPriceDate = product.priceHistory.find(h => h.price === minPrice).date;
        
        let shouldNotify = false;
        let notificationMessage = '';
        
        const isBelowOriginal = currentPrice < originalPrice;
        product.priceDropped = isBelowOriginal;
        
        if (isBelowOriginal) {
          const priceDropFromOriginal = originalPrice - currentPrice;
          product.priceDropAmount = priceDropFromOriginal;
          
          if (currentPrice < previousPrice) {
            const priceDrop = previousPrice - currentPrice;
            const percentDrop = ((priceDrop / previousPrice) * 100).toFixed(1);
            const totalDrop = originalPrice - currentPrice;
            const totalPercentDrop = ((totalDrop / originalPrice) * 100).toFixed(1);
            
            shouldNotify = true;
            notificationMessage = `${product.name}\nБыло: ${previousPrice.toFixed(2)} ₽\nСтало: ${currentPrice.toFixed(2)} ₽\nЭкономия: ${priceDrop.toFixed(2)} ₽ (${percentDrop}%)\nОт изначальной: -${totalDrop.toFixed(2)} ₽ (${totalPercentDrop}%)`;
          }
        } else {
          product.priceDropped = false;
        }
        
        if (shouldNotify) {
          browser.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Цена снизилась! 🎉',
            message: notificationMessage
          });
        }
        
        products[productId] = product;
        await browser.storage.local.set({ products });
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке цены:', error);
  }
}

async function checkAllProducts() {
  const result = await browser.storage.local.get(['products']);
  const products = result.products || {};
  
  for (const productId in products) {
    await checkProductPrice(productId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

let alarmName = 'dailyPriceCheck';

function getNextCheckTime() {
  const now = new Date();
  const morning = new Date(now);
  morning.setHours(9, 0, 0, 0);
  const evening = new Date(now);
  evening.setHours(21, 0, 0, 0);
  
  let nextCheck;
  if (now < morning) {
    nextCheck = morning;
  } else if (now < evening) {
    nextCheck = evening;
  } else {
    nextCheck = new Date(morning);
    nextCheck.setDate(nextCheck.getDate() + 1);
  }
  
  return nextCheck.getTime() - now.getTime();
}

function startPriceChecking() {
  checkAllProducts();
  
  browser.alarms.clear(alarmName).then(() => {
    const delay = getNextCheckTime();
    browser.alarms.create(alarmName, {
      delayInMinutes: Math.round(delay / 60000),
      periodInMinutes: 12 * 60
    });
  });
}

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === alarmName) {
    checkAllProducts();
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'addProduct') {
    const { url, name, price, image } = message;
    const productId = Date.now().toString();
    const now = new Date().toISOString();
    
    browser.storage.local.get(['products']).then(result => {
      const products = result.products || {};
      products[productId] = {
        id: productId,
        url: url,
        name: name,
        image: image || '',
        originalPrice: parseFloat(price),
        currentPrice: parseFloat(price),
        addedDate: now,
        lastChecked: now,
        priceDropped: false,
        priceHistory: [{
          price: parseFloat(price),
          date: now
        }],
        minPrice: parseFloat(price),
        minPriceDate: now
      };
      
      browser.storage.local.set({ products }).then(() => {
        sendResponse({ success: true, productId });
      });
    });
    
    return true;
  }
  
  if (message.action === 'removeProduct') {
    browser.storage.local.get(['products']).then(result => {
      const products = result.products || {};
      delete products[message.productId];
      browser.storage.local.set({ products }).then(() => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (message.action === 'checkPrice') {
    checkProductPrice(message.productId).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

browser.runtime.onInstalled.addListener(() => {
  startPriceChecking();
});

startPriceChecking();

