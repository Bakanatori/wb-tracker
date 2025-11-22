let products = {};

async function loadProducts() {
  const result = await browser.storage.local.get(['products']);
  products = result.products || {};
  renderProducts();
}

function renderProducts() {
  const productsList = document.getElementById('productsList');
  
  if (Object.keys(products).length === 0) {
    productsList.innerHTML = '<p class="empty-state">Нет отслеживаемых товаров</p>';
    return;
  }
  
  productsList.innerHTML = '';
  
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
  
  const lastChecked = product.lastChecked 
    ? new Date(product.lastChecked).toLocaleString('ru-RU')
    : 'Никогда';
  
  const imageHtml = product.image 
    ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-image" onerror="this.style.display='none'">`
    : '';
  
  item.innerHTML = `
    <div class="product-header">
      <div class="product-name">${escapeHtml(product.name)}</div>
      <div class="product-actions">
        <button class="btn btn-small check-price-btn" data-id="${product.id}">
          Проверить
        </button>
        <button class="btn btn-danger remove-btn" data-id="${product.id}">
          Удалить
        </button>
      </div>
    </div>
    <div class="product-content">
      ${imageHtml}
      <div class="product-details">
        <a href="${product.url}" target="_blank" class="product-url">
          ${product.url}
        </a>
        <div class="price-info">
          <div>
            <span class="price-label">Изначальная цена:</span>
            <span class="price-value price-original">${originalPrice.toFixed(2)} ₽</span>
          </div>
        </div>
        <div class="price-info">
          <div>
            <span class="price-label">Текущая цена:</span>
            <span class="price-value price-current">${currentPrice.toFixed(2)} ₽</span>
            ${priceDrop > 0 ? `<span class="price-drop-badge">-${percentDrop}%</span>` : ''}
          </div>
        </div>
        ${minPrice < originalPrice ? `
          <div class="price-info">
            <span class="price-label">Минимальная цена:</span>
            <span class="price-value price-min">${minPrice.toFixed(2)} ₽</span>
          </div>
        ` : ''}
        ${priceDrop > 0 ? `
          <div class="price-info">
            <span class="price-drop">Экономия: ${priceDrop.toFixed(2)} ₽</span>
          </div>
        ` : ''}
        <div class="last-checked">Последняя проверка: ${lastChecked}</div>
        ${product.priceHistory && product.priceHistory.length > 1 ? `
          <button class="btn btn-chart show-chart-btn" data-id="${product.id}">
            📊 График цены
          </button>
        ` : ''}
      </div>
    </div>
  `;
  
  const removeBtn = item.querySelector('.remove-btn');
  removeBtn.addEventListener('click', () => removeProduct(product.id));
  
  const checkBtn = item.querySelector('.check-price-btn');
  checkBtn.addEventListener('click', () => checkPrice(product.id));
  
  const chartBtn = item.querySelector('.show-chart-btn');
  if (chartBtn) {
    chartBtn.addEventListener('click', () => showPriceChart(product));
  }
  
  return item;
}

function showPriceChart(product) {
  const modal = document.getElementById('chartModal');
  const canvas = document.getElementById('chartCanvas');
  const title = document.getElementById('chartModalTitle');
  const info = document.getElementById('chartInfo');
  
  if (!product.priceHistory || product.priceHistory.length < 2) {
    alert('Недостаточно данных для построения графика');
    return;
  }
  
  title.textContent = `График цены: ${escapeHtml(product.name)}`;
  
  drawPriceChart(canvas, product.priceHistory, parseFloat(product.originalPrice), parseFloat(product.minPrice || product.originalPrice));
  
  const originalPrice = parseFloat(product.originalPrice);
  const currentPrice = parseFloat(product.currentPrice || product.originalPrice);
  const minPrice = parseFloat(product.minPrice || product.originalPrice);
  const maxPrice = Math.max(...product.priceHistory.map(h => h.price));
  
  let infoHtml = `
    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Изначальная цена:</span>
        <span class="stat-value">${originalPrice.toFixed(2)} ₽</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Текущая цена:</span>
        <span class="stat-value">${currentPrice.toFixed(2)} ₽</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Минимальная цена:</span>
        <span class="stat-value price-min">${minPrice.toFixed(2)} ₽</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Максимальная цена:</span>
        <span class="stat-value">${maxPrice.toFixed(2)} ₽</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Изменение:</span>
        <span class="stat-value ${currentPrice < originalPrice ? 'price-drop' : ''}">
          ${currentPrice < originalPrice ? '-' : '+'}${Math.abs(currentPrice - originalPrice).toFixed(2)} ₽ 
          (${((Math.abs(currentPrice - originalPrice) / originalPrice) * 100).toFixed(1)}%)
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Всего проверок:</span>
        <span class="stat-value">${product.priceHistory.length}</span>
      </div>
    </div>
  `;
  
  info.innerHTML = infoHtml;
  
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
  ctx.fillText('Изначальная', width - padding - 80, originalY - 5);
  
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
      ctx.fillText(`Мин: ${minPrice.toFixed(0)} ₽`, minX, minY - 10);
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function removeProduct(productId) {
  if (confirm('Удалить этот товар из отслеживания?')) {
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
  checkBtn.textContent = 'Проверяю...';
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
    console.error('Ошибка при проверке цены:', error);
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
      alert('Не удалось получить информацию о странице. Попробуйте обновить страницу.');
      return;
    }
    
    const name = pageInfo.title || 'Товар';
    const url = pageInfo.url;
    const price = pageInfo.price;
    const image = pageInfo.image || '';
    
    if (!price || isNaN(price)) {
      alert('Не удалось автоматически определить цену. Пожалуйста, добавьте товар вручную.');
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
    console.error('Ошибка при добавлении товара:', error);
    alert('Ошибка при добавлении товара. Убедитесь, что страница полностью загружена.');
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
    alert('Заполните все поля');
    return;
  }
  
  if (isNaN(parseFloat(price))) {
    alert('Введите корректную цену');
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
    console.error('Ошибка при сохранении товара:', error);
    alert('Ошибка при сохранении товара');
  }
}

function closeChartModal() {
  const modal = document.getElementById('chartModal');
  modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  
  document.getElementById('addCurrentPage').addEventListener('click', addCurrentPage);
  document.getElementById('saveProduct').addEventListener('click', saveProduct);
  document.getElementById('cancelAdd').addEventListener('click', hideAddForm);
  
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

