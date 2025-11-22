function findPriceOnPage() {
  const priceSelectors = [
    '[class*="price"]',
    '[id*="price"]',
    '[data-price]',
    '[itemprop="price"]',
    '.price',
    '#price',
    '.price-block__final-price',
    '.price-block__content',
    '[data-testid="price"]',
    '.tsHeadline500',
    '[data-test-id="price-current"]',
    '[data-zone-name="price"]',
    '.price-current',
    '.notranslate',
    'span:contains("₽")',
    'span:contains("руб")',
    'span:contains("RUB")'
  ];
  
  let price = null;
  let priceText = null;
  
  for (const selector of priceSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent || element.innerText || '';
        const priceMatch = text.match(/(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)/);
        if (priceMatch) {
          priceText = priceMatch[1];
          price = parseFloat(priceText.replace(/\s/g, '').replace(',', '.'));
          if (!isNaN(price) && price > 0) {
            return { price, priceText: priceMatch[0] };
          }
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  const bodyText = document.body.innerText || document.body.textContent || '';
  const priceRegex = /(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)\s*(?:₽|руб|RUB)/gi;
  const matches = bodyText.match(priceRegex);
  
  if (matches && matches.length > 0) {
    const priceStr = matches[0].replace(/[^\d,.]/g, '').replace(',', '.');
    price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      return { price, priceText: matches[0] };
    }
  }
  
  return { price: null, priceText: null };
}

function findImageOnPage() {
  const imageSelectors = [
    '.product-page__img img',
    '.slide__content img',
    '[data-testid="product-image"] img',
    '.product-card__img img',
    '.tsBodyL img',
    '[data-test-id="main-image"] img',
    '.product-image img',
    '[data-zone-name="product-image"] img',
    '.images-view img',
    'img[itemprop="image"]',
    '.product-photo img',
    'main img',
    'article img'
  ];
  
  for (const selector of imageSelectors) {
    try {
      const img = document.querySelector(selector);
      if (img && img.src) {
        const cleanUrl = img.src.split('?')[0];
        if (cleanUrl && !cleanUrl.includes('data:image')) {
          return cleanUrl;
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  const allImages = document.querySelectorAll('img');
  for (const img of allImages) {
    if (img.src && img.naturalWidth > 200 && img.naturalHeight > 200) {
      const cleanUrl = img.src.split('?')[0];
      if (cleanUrl && !cleanUrl.includes('data:image')) {
        return cleanUrl;
      }
    }
  }
  
  return null;
}

function findProductNameOnPage() {
  const specificSelectors = [
    'h3.productTitle--J2W7I',
    'h3[class*="productTitle"]',
    '.product-title',
    '[data-testid="product-title"]',
    'h1.product-title',
    'h1[itemprop="name"]'
  ];
  
  for (const selector of specificSelectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.innerText || '';
        if (text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  return document.title || 'Product';
}

function cleanProductName(title) {
  if (!title) return 'Product';
  
  let cleanName = title;
  cleanName = cleanName.replace(/\s*купить\s+за\s+[\d\s.,]+?\s*[₽рубRUB]?/gi, '');
  cleanName = cleanName.replace(/\s*в\s+интернет[‑-]?магазине\s+[^\s]+/gi, '');
  cleanName = cleanName.replace(/\s+\d{6,}\s*$/g, '');
  cleanName = cleanName.replace(/\s+купить\s*$/gi, '');
  cleanName = cleanName.trim();
  
  if (!cleanName || cleanName.length < 3) {
    return title;
  }
  
  return cleanName;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPrice') {
    const result = findPriceOnPage();
    sendResponse(result);
  }
  
  if (message.action === 'getPageInfo') {
    const priceInfo = findPriceOnPage();
    const imageUrl = findImageOnPage();
    const productNameFromPage = findProductNameOnPage();
    const cleanName = cleanProductName(productNameFromPage);
    
    sendResponse({
      url: window.location.href,
      title: cleanName,
      originalTitle: document.title,
      price: priceInfo.price,
      priceText: priceInfo.priceText,
      image: imageUrl
    });
  }
});

async function checkIfTracked() {
  const result = await browser.storage.local.get(['products']);
  const products = result.products || {};
  const currentUrl = window.location.href;
  
  for (const productId in products) {
    if (products[productId].url === currentUrl) {
      await showTrackingIndicator();
      break;
    }
  }
}

async function showTrackingIndicator() {
  const result = await browser.storage.local.get(['language']);
  const lang = result.language || 'en';
  const translations = {
    en: '✓ Product is being tracked',
    ru: '✓ Товар отслеживается'
  };
  const text = translations[lang] || translations.en;
  
  const indicator = document.createElement('div');
  indicator.id = 'price-tracker-indicator';
  indicator.textContent = text;
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkIfTracked);
} else {
  checkIfTracked();
}

