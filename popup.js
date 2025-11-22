let products = {};
let currentLang = 'en';

// Load language preference
async function loadLanguage() {
  const result = await browser.storage.local.get(['language']);
  currentLang = result.language || 'en';
  applyLanguage();
}

// Apply language to UI
function applyLanguage() {
  document.getElementById('headerTitle').textContent = `💰 ${t('title', currentLang)}`;
  document.getElementById('addProductTitle').textContent = t('addProduct', currentLang);
  document.getElementById('addCurrentPage').textContent = t('addCurrentPage', currentLang);
  document.getElementById('productName').placeholder = t('productName', currentLang);
  document.getElementById('productUrl').placeholder = t('productUrl', currentLang);
  document.getElementById('productPrice').placeholder = t('productPrice', currentLang);
  document.getElementById('saveProduct').textContent = t('save', currentLang);
  document.getElementById('cancelAdd').textContent = t('cancel', currentLang);
  document.getElementById('trackedProductsTitle').textContent = t('trackedProducts', currentLang);
  
  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    }
  });
  
  renderProducts();
}

// Change language
async function changeLanguage(lang) {
  currentLang = lang;
  await browser.storage.local.set({ language: lang });
  applyLanguage();
}

async function loadProducts() {
  const result = await browser.storage.local.get(['products']);
  products = result.products || {};
  renderProducts();
}

function renderProducts() {
  const productsList = document.getElementById('productsList');
  
  if (Object.keys(products).length === 0) {
    productsList.textContent = '';
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = t('noProducts', currentLang);
    productsList.appendChild(emptyState);
    return;
  }
  
  productsList.textContent = '';
  
  for (const productId in products) {
    const product = products[productId];
    const productItem = createProductItem(product);
    productsList.appendChild(productItem);
  }
}

function createProductItem(product) {
  const item = document.createElement('div');
  item.className = 'product-item';
  
  if (product.priceDropped) {
    item.classList.add('price-dropped');
  }
  
  const originalPrice = parseFloat(product.originalPrice);
  const currentPrice = parseFloat(product.currentPrice || product.originalPrice);
  const priceDrop = originalPrice - currentPrice;
  const percentDrop = ((priceDrop / originalPrice) * 100).toFixed(1);
  const minPrice = product.minPrice ? parseFloat(product.minPrice) : originalPrice;
  
  const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
  const lastChecked = product.lastChecked 
    ? new Date(product.lastChecked).toLocaleString(locale)
    : t('never', currentLang);
  
  // Create header
  const header = document.createElement('div');
  header.className = 'product-header';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'product-name';
  nameDiv.textContent = product.name;
  
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'product-actions';
  
  const checkBtn = document.createElement('button');
  checkBtn.className = 'btn btn-small check-price-btn';
  checkBtn.setAttribute('data-id', product.id);
  checkBtn.textContent = t('check', currentLang);
  checkBtn.addEventListener('click', () => checkPrice(product.id));
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger remove-btn';
  removeBtn.setAttribute('data-id', product.id);
  removeBtn.textContent = t('remove', currentLang);
  removeBtn.addEventListener('click', () => removeProduct(product.id));
  
  actionsDiv.appendChild(checkBtn);
  actionsDiv.appendChild(removeBtn);
  header.appendChild(nameDiv);
  header.appendChild(actionsDiv);
  
  // Create content
  const content = document.createElement('div');
  content.className = 'product-content';
  
  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.className = 'product-image';
    img.onerror = function() { this.style.display = 'none'; };
    content.appendChild(img);
  }
  
  const details = document.createElement('div');
  details.className = 'product-details';
  
  const urlLink = document.createElement('a');
  urlLink.href = product.url;
  urlLink.target = '_blank';
  urlLink.className = 'product-url';
  urlLink.textContent = product.url;
  details.appendChild(urlLink);
  
  // Original price
  const originalPriceInfo = document.createElement('div');
  originalPriceInfo.className = 'price-info';
  const originalPriceDiv = document.createElement('div');
  const originalPriceLabel = document.createElement('span');
  originalPriceLabel.className = 'price-label';
  originalPriceLabel.textContent = t('originalPrice', currentLang);
  const originalPriceValue = document.createElement('span');
  originalPriceValue.className = 'price-value price-original';
  originalPriceValue.textContent = `${originalPrice.toFixed(2)} ₽`;
  originalPriceDiv.appendChild(originalPriceLabel);
  originalPriceDiv.appendChild(originalPriceValue);
  originalPriceInfo.appendChild(originalPriceDiv);
  details.appendChild(originalPriceInfo);
  
  // Current price
  const currentPriceInfo = document.createElement('div');
  currentPriceInfo.className = 'price-info';
  const currentPriceDiv = document.createElement('div');
  const currentPriceLabel = document.createElement('span');
  currentPriceLabel.className = 'price-label';
  currentPriceLabel.textContent = t('currentPrice', currentLang);
  const currentPriceValue = document.createElement('span');
  currentPriceValue.className = 'price-value price-current';
  currentPriceValue.textContent = `${currentPrice.toFixed(2)} ₽`;
  currentPriceDiv.appendChild(currentPriceLabel);
  currentPriceDiv.appendChild(currentPriceValue);
  if (priceDrop > 0) {
    const priceDropBadge = document.createElement('span');
    priceDropBadge.className = 'price-drop-badge';
    priceDropBadge.textContent = `-${percentDrop}%`;
    currentPriceDiv.appendChild(priceDropBadge);
  }
  currentPriceInfo.appendChild(currentPriceDiv);
  details.appendChild(currentPriceInfo);
  
  // Minimum price
  if (minPrice < originalPrice) {
    const minPriceInfo = document.createElement('div');
    minPriceInfo.className = 'price-info';
    const minPriceLabel = document.createElement('span');
    minPriceLabel.className = 'price-label';
    minPriceLabel.textContent = t('minPrice', currentLang);
    const minPriceValue = document.createElement('span');
    minPriceValue.className = 'price-value price-min';
    minPriceValue.textContent = `${minPrice.toFixed(2)} ₽`;
    minPriceInfo.appendChild(minPriceLabel);
    minPriceInfo.appendChild(minPriceValue);
    details.appendChild(minPriceInfo);
  }
  
  // Savings
  if (priceDrop > 0) {
    const savingsInfo = document.createElement('div');
    savingsInfo.className = 'price-info';
    const savingsSpan = document.createElement('span');
    savingsSpan.className = 'price-drop';
    savingsSpan.textContent = `${t('savings', currentLang)} ${priceDrop.toFixed(2)} ₽`;
    savingsInfo.appendChild(savingsSpan);
    details.appendChild(savingsInfo);
  }
  
  // Last checked
  const lastCheckedDiv = document.createElement('div');
  lastCheckedDiv.className = 'last-checked';
  lastCheckedDiv.textContent = `${t('lastChecked', currentLang)} ${lastChecked}`;
  details.appendChild(lastCheckedDiv);
  
  // Chart button
  if (product.priceHistory && product.priceHistory.length > 1) {
    const chartBtn = document.createElement('button');
    chartBtn.className = 'btn btn-chart show-chart-btn';
    chartBtn.setAttribute('data-id', product.id);
    chartBtn.textContent = t('chart', currentLang);
    chartBtn.addEventListener('click', () => showPriceChart(product));
    details.appendChild(chartBtn);
  }
  
  content.appendChild(details);
  item.appendChild(header);
  item.appendChild(content);
  
  return item;
}

function showPriceChart(product) {
  const modal = document.getElementById('chartModal');
  const canvas = document.getElementById('chartCanvas');
  const title = document.getElementById('chartModalTitle');
  const info = document.getElementById('chartInfo');
  
  if (!product.priceHistory || product.priceHistory.length < 2) {
    alert(t('insufficientData', currentLang));
    return;
  }
  
  title.textContent = `${t('priceChart', currentLang)} ${product.name}`;
  
  drawPriceChart(canvas, product.priceHistory, parseFloat(product.originalPrice), parseFloat(product.minPrice || product.originalPrice));
  
  const originalPrice = parseFloat(product.originalPrice);
  const currentPrice = parseFloat(product.currentPrice || product.originalPrice);
  const minPrice = parseFloat(product.minPrice || product.originalPrice);
  const maxPrice = Math.max(...product.priceHistory.map(h => h.price));
  
  // Clear existing content
  info.textContent = '';
  
  const statsDiv = document.createElement('div');
  statsDiv.className = 'chart-stats';
  
  // Original price
  const originalStat = document.createElement('div');
  originalStat.className = 'stat-item';
  const originalLabel = document.createElement('span');
  originalLabel.className = 'stat-label';
  originalLabel.textContent = t('originalPrice', currentLang);
  const originalValue = document.createElement('span');
  originalValue.className = 'stat-value';
  originalValue.textContent = `${originalPrice.toFixed(2)} ₽`;
  originalStat.appendChild(originalLabel);
  originalStat.appendChild(originalValue);
  statsDiv.appendChild(originalStat);
  
  // Current price
  const currentStat = document.createElement('div');
  currentStat.className = 'stat-item';
  const currentLabel = document.createElement('span');
  currentLabel.className = 'stat-label';
  currentLabel.textContent = t('currentPrice', currentLang);
  const currentValue = document.createElement('span');
  currentValue.className = 'stat-value';
  currentValue.textContent = `${currentPrice.toFixed(2)} ₽`;
  currentStat.appendChild(currentLabel);
  currentStat.appendChild(currentValue);
  statsDiv.appendChild(currentStat);
  
  // Minimum price
  const minStat = document.createElement('div');
  minStat.className = 'stat-item';
  const minLabel = document.createElement('span');
  minLabel.className = 'stat-label';
  minLabel.textContent = t('minPrice', currentLang);
  const minValue = document.createElement('span');
  minValue.className = 'stat-value price-min';
  minValue.textContent = `${minPrice.toFixed(2)} ₽`;
  minStat.appendChild(minLabel);
  minStat.appendChild(minValue);
  statsDiv.appendChild(minStat);
  
  // Maximum price
  const maxStat = document.createElement('div');
  maxStat.className = 'stat-item';
  const maxLabel = document.createElement('span');
  maxLabel.className = 'stat-label';
  maxLabel.textContent = t('maxPrice', currentLang);
  const maxValue = document.createElement('span');
  maxValue.className = 'stat-value';
  maxValue.textContent = `${maxPrice.toFixed(2)} ₽`;
  maxStat.appendChild(maxLabel);
  maxStat.appendChild(maxValue);
  statsDiv.appendChild(maxStat);
  
  // Change
  const changeStat = document.createElement('div');
  changeStat.className = 'stat-item';
  const changeLabel = document.createElement('span');
  changeLabel.className = 'stat-label';
  changeLabel.textContent = t('change', currentLang);
  const changeValue = document.createElement('span');
  const priceChange = Math.abs(currentPrice - originalPrice);
  const percentChange = ((priceChange / originalPrice) * 100).toFixed(1);
  changeValue.className = currentPrice < originalPrice ? 'stat-value price-drop' : 'stat-value';
  changeValue.textContent = `${currentPrice < originalPrice ? '-' : '+'}${priceChange.toFixed(2)} ₽ (${percentChange}%)`;
  changeStat.appendChild(changeLabel);
  changeStat.appendChild(changeValue);
  statsDiv.appendChild(changeStat);
  
  // Total checks
  const checksStat = document.createElement('div');
  checksStat.className = 'stat-item';
  const checksLabel = document.createElement('span');
  checksLabel.className = 'stat-label';
  checksLabel.textContent = t('totalChecks', currentLang);
  const checksValue = document.createElement('span');
  checksValue.className = 'stat-value';
  checksValue.textContent = String(product.priceHistory.length);
  checksStat.appendChild(checksLabel);
  checksStat.appendChild(checksValue);
  statsDiv.appendChild(checksStat);
  
  info.appendChild(statsDiv);
  
  modal.style.display = 'block';
}

function drawPriceChart(canvas, priceHistory, originalPrice, minPrice) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  ctx.clearRect(0, 0, width, height);
  
  if (priceHistory.length < 2) return;
  
  const prices = priceHistory.map(h => h.price);
  const minPriceValue = Math.min(...prices, originalPrice);
  const maxPriceValue = Math.max(...prices, originalPrice);
  const priceRange = maxPriceValue - minPriceValue || 1;
  
  const scaleX = chartWidth / (priceHistory.length - 1);
  const scaleY = chartHeight / priceRange;
  
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(padding, padding, chartWidth, chartHeight);
  
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    
    const price = maxPriceValue - (priceRange / 5) * i;
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(price.toFixed(0) + ' ₽', padding - 10, y + 4);
  }
  
  const dateStep = Math.max(1, Math.floor(priceHistory.length / 5));
  for (let i = 0; i < priceHistory.length; i += dateStep) {
    const x = padding + i * scaleX;
    if (x <= width - padding) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      
      const date = new Date(priceHistory[i].date);
      const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      ctx.fillStyle = '#999';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x, height - padding + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(dateStr, 0, 0);
      ctx.restore();
    }
  }
  
  const originalY = padding + (maxPriceValue - originalPrice) * scaleY;
  ctx.strokeStyle = '#999';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding, originalY);
  ctx.lineTo(width - padding, originalY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = '#999';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(t('original', currentLang), width - padding - 80, originalY - 5);
  
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  priceHistory.forEach((point, index) => {
    const x = padding + index * scaleX;
    const y = padding + (maxPriceValue - point.price) * scaleY;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  ctx.fillStyle = '#007bff';
  priceHistory.forEach((point, index) => {
    const x = padding + index * scaleX;
    const y = padding + (maxPriceValue - point.price) * scaleY;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    if (point.price === minPrice) {
      ctx.fillStyle = '#28a745';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#007bff';
    }
  });
  
  if (minPrice < originalPrice) {
    const minIndex = priceHistory.findIndex(h => h.price === minPrice);
    if (minIndex !== -1) {
      const minX = padding + minIndex * scaleX;
      const minY = padding + (maxPriceValue - minPrice) * scaleY;
      ctx.fillStyle = '#28a745';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${t('min', currentLang)} ${minPrice.toFixed(0)} ₽`, minX, minY - 10);
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function removeProduct(productId) {
  if (confirm(t('removeConfirm', currentLang))) {
    const result = await browser.storage.local.get(['products']);
    const products = result.products || {};
    delete products[productId];
    await browser.storage.local.set({ products });
    await loadProducts();
  }
}

async function checkPrice(productId) {
  const checkBtn = document.querySelector(`.check-price-btn[data-id="${productId}"]`);
  const originalText = checkBtn.textContent;
  checkBtn.textContent = t('checking', currentLang);
  checkBtn.disabled = true;
  
  try {
    await browser.runtime.sendMessage({
      action: 'checkPrice',
      productId: productId
    });
    
    setTimeout(async () => {
      await loadProducts();
      checkBtn.textContent = originalText;
      checkBtn.disabled = false;
    }, 3000);
  } catch (error) {
    console.error(t('checkPriceError', currentLang), error);
    checkBtn.textContent = originalText;
    checkBtn.disabled = false;
  }
}

async function addCurrentPage() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    const pageInfo = await browser.tabs.sendMessage(tab.id, {
      action: 'getPageInfo'
    });
    
    if (!pageInfo) {
      alert(t('pageInfoError', currentLang));
      return;
    }
    
    const name = pageInfo.title || t('productNameDefault', currentLang);
    const url = pageInfo.url;
    const price = pageInfo.price;
    const image = pageInfo.image || '';
    
    if (!price || isNaN(price)) {
      alert(t('priceDetectionError', currentLang));
      showAddForm(name, url, '');
      return;
    }
    
    await browser.runtime.sendMessage({
      action: 'addProduct',
      url: url,
      name: name,
      price: price,
      image: image
    });
    
    await loadProducts();
    hideAddForm();
  } catch (error) {
    console.error(t('addProductError', currentLang), error);
    alert(t('addProductError', currentLang));
  }
}

function showAddForm(name = '', url = '', price = '') {
  document.getElementById('productName').value = name;
  document.getElementById('productUrl').value = url;
  document.getElementById('productPrice').value = price;
  document.getElementById('addProductForm').style.display = 'block';
}

function hideAddForm() {
  document.getElementById('addProductForm').style.display = 'none';
  document.getElementById('productName').value = '';
  document.getElementById('productUrl').value = '';
  document.getElementById('productPrice').value = '';
}

async function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const url = document.getElementById('productUrl').value.trim();
  const price = document.getElementById('productPrice').value.trim();
  
  if (!name || !url || !price) {
    alert(t('fillAllFields', currentLang));
    return;
  }
  
  if (isNaN(parseFloat(price))) {
    alert(t('invalidPrice', currentLang));
    return;
  }
  
  try {
    await browser.runtime.sendMessage({
      action: 'addProduct',
      url: url,
      name: name,
      price: parseFloat(price),
      image: ''
    });
    
    await loadProducts();
    hideAddForm();
  } catch (error) {
    console.error(t('saveProductError', currentLang), error);
    alert(t('saveProductError', currentLang));
  }
}

function closeChartModal() {
  const modal = document.getElementById('chartModal');
  modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  await loadProducts();
  
  document.getElementById('addCurrentPage').addEventListener('click', addCurrentPage);
  document.getElementById('saveProduct').addEventListener('click', saveProduct);
  document.getElementById('cancelAdd').addEventListener('click', hideAddForm);
  
  // Language switcher
  document.getElementById('langEn').addEventListener('click', () => changeLanguage('en'));
  document.getElementById('langRu').addEventListener('click', () => changeLanguage('ru'));
  
  const modal = document.getElementById('chartModal');
  const closeBtn = document.querySelector('.modal-close');
  
  closeBtn.addEventListener('click', closeChartModal);
  
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeChartModal();
    }
  });
  
  browser.storage.onChanged.addListener(() => {
    loadProducts();
  });
});

