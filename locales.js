const translations = {
  en: {
    // UI Elements
    title: "Price Tracker",
    addProduct: "Add Product",
    addCurrentPage: "Add Current Page",
    trackedProducts: "Tracked Products",
    noProducts: "No tracked products",
    save: "Save",
    cancel: "Cancel",
    check: "Check",
    checking: "Checking...",
    remove: "Remove",
    chart: "📊 Price Chart",
    
    // Product fields
    productName: "Product Name",
    productUrl: "Product URL",
    productPrice: "Price (₽)",
    originalPrice: "Original Price:",
    currentPrice: "Current Price:",
    minPrice: "Minimum Price:",
    maxPrice: "Maximum Price:",
    savings: "Savings:",
    lastChecked: "Last Checked:",
    never: "Never",
    change: "Change:",
    totalChecks: "Total Checks:",
    
    // Chart
    priceChart: "Price Chart:",
    insufficientData: "Not enough data to build a chart",
    original: "Original",
    min: "Min:",
    
    // Messages
    removeConfirm: "Remove this product from tracking?",
    pageInfoError: "Failed to get page information. Please refresh the page.",
    productNameDefault: "Product",
    priceDetectionError: "Failed to automatically detect price. Please add the product manually.",
    addProductError: "Error adding product. Make sure the page is fully loaded.",
    checkPriceError: "Error checking price",
    fillAllFields: "Please fill in all fields",
    invalidPrice: "Please enter a valid price",
    saveProductError: "Error saving product",
    
    // Notifications
    priceDropped: "Price Dropped! 🎉",
    was: "Was:",
    became: "Became:",
    fromOriginal: "From original:",
    
    // Content script
    productTracked: "✓ Product is being tracked"
  },
  ru: {
    // UI Elements
    title: "Отслеживание цен",
    addProduct: "Добавить товар",
    addCurrentPage: "Добавить текущую страницу",
    trackedProducts: "Отслеживаемые товары",
    noProducts: "Нет отслеживаемых товаров",
    save: "Сохранить",
    cancel: "Отмена",
    check: "Проверить",
    checking: "Проверяю...",
    remove: "Удалить",
    chart: "📊 График цены",
    
    // Product fields
    productName: "Название товара",
    productUrl: "URL товара",
    productPrice: "Цена (₽)",
    originalPrice: "Изначальная цена:",
    currentPrice: "Текущая цена:",
    minPrice: "Минимальная цена:",
    maxPrice: "Максимальная цена:",
    savings: "Экономия:",
    lastChecked: "Последняя проверка:",
    never: "Никогда",
    change: "Изменение:",
    totalChecks: "Всего проверок:",
    
    // Chart
    priceChart: "График цены:",
    insufficientData: "Недостаточно данных для построения графика",
    original: "Изначальная",
    min: "Мин:",
    
    // Messages
    removeConfirm: "Удалить этот товар из отслеживания?",
    pageInfoError: "Не удалось получить информацию о странице. Попробуйте обновить страницу.",
    productNameDefault: "Товар",
    priceDetectionError: "Не удалось автоматически определить цену. Пожалуйста, добавьте товар вручную.",
    addProductError: "Ошибка при добавлении товара. Убедитесь, что страница полностью загружена.",
    checkPriceError: "Ошибка при проверке цены",
    fillAllFields: "Заполните все поля",
    invalidPrice: "Введите корректную цену",
    saveProductError: "Ошибка при сохранении товара",
    
    // Notifications
    priceDropped: "Цена снизилась! 🎉",
    was: "Было:",
    became: "Стало:",
    fromOriginal: "От изначальной:",
    
    // Content script
    productTracked: "✓ Товар отслеживается"
  }
};

// Get translation function
function t(key, lang = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key;
}

