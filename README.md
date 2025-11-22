# Product Price Tracker (Firefox Extension)

A Firefox extension that tracks product prices and notifies you when prices drop below the original price.

**[Русская версия](#russian-version)** | **[English Version](#english-version)**

---

<a name="english-version"></a>
## English Version

### Features

- ✅ Automatic product addition from current page
- ✅ Automatic price and product name detection
- ✅ Automatic product image extraction
- ✅ Automatic price checks twice daily (9:00 AM and 9:00 PM)
- ✅ Price drop notifications (compared to previous check)
- ✅ Price history with interactive charts
- ✅ Minimum price display for the entire tracking period
- ✅ Savings display in percentage and rubles
- ✅ Manual price check at any time
- ✅ Manage tracked products list

### Usage

#### Adding a Product

1. Open a product page in your browser
2. Click the extension icon in the toolbar
3. Click "Add Current Page"
4. The extension will automatically detect the product name and price

#### Manual Addition

1. Click the extension icon
2. Click "Add Current Page"
3. If the price wasn't detected automatically, fill in the form manually

#### Price Checking

- The extension automatically checks prices twice daily (at 9:00 AM and 9:00 PM)
- You can manually check prices by clicking the "Check" button next to a product
- You'll receive a notification when the price drops
- Price change history is displayed on a chart for each product
- The chart shows the minimum price for the entire tracking period

#### Removing a Product

Click the "Remove" button next to the product in the tracked products list.

### Project Structure

```
wb-tracker/
├── manifest.json      # Extension manifest
├── background.js      # Background script for price tracking
├── content.js         # Script for extracting prices from pages
├── popup.html         # Popup interface
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── icons/             # Extension icons
└── README.md          # This file
```

### Technical Details

- Uses Manifest V2 for Firefox compatibility
- Stores data in `browser.storage.local`
- Checks prices by opening pages in background tabs
- Uses various selectors to find prices on different websites

### Supported Websites

The extension works on most e-commerce websites, including:
- Wildberries
- Ozon
- Yandex Market
- AliExpress
- And other sites with prices

### Notes

- The extension requires access to product pages
- Notifications only work when the browser is open
- Price checks occur automatically every 12 hours (twice daily)

---

<a name="russian-version"></a>
## Русская версия

### Возможности

- ✅ Автоматическое добавление товаров с текущей страницы
- ✅ Автоматическое определение цены и названия товара
- ✅ Автоматическое извлечение изображения товара
- ✅ Автоматическая проверка цен 2 раза в день (утром и вечером)
- ✅ Уведомления при снижении цены (по сравнению с предыдущей проверкой)
- ✅ История изменения цен с графиком
- ✅ Отображение минимальной цены за весь период
- ✅ Отображение экономии в процентах и рублях
- ✅ Ручная проверка цены в любой момент
- ✅ Управление списком отслеживаемых товаров

### Использование

#### Добавление товара

1. Откройте страницу товара в браузере
2. Нажмите на иконку расширения в панели инструментов
3. Нажмите "Добавить текущую страницу"
4. Расширение автоматически определит название и цену товара

#### Ручное добавление

1. Нажмите на иконку расширения
2. Нажмите "Добавить текущую страницу"
3. Если цена не определилась автоматически, заполните форму вручную

#### Проверка цен

- Расширение автоматически проверяет цены 2 раза в день (в 9:00 и 21:00)
- Вы можете вручную проверить цену, нажав кнопку "Проверить" рядом с товаром
- При снижении цены вы получите уведомление
- История изменения цен отображается на графике для каждого товара
- На графике отмечена минимальная цена за весь период отслеживания

#### Удаление товара

Нажмите кнопку "Удалить" рядом с товаром в списке отслеживаемых товаров.

### Структура проекта

```
wb-tracker/
├── manifest.json      # Манифест расширения
├── background.js      # Фоновый скрипт для отслеживания цен
├── content.js         # Скрипт для извлечения цен со страниц
├── popup.html         # Интерфейс popup
├── popup.css          # Стили popup
├── popup.js           # Логика popup
├── icons/             # Иконки расширения
└── README.md          # Этот файл
```

### Технические детали

- Использует Manifest V2 для совместимости с Firefox
- Хранит данные в `browser.storage.local`
- Проверяет цены, открывая страницы в фоновых вкладках
- Использует различные селекторы для поиска цен на разных сайтах

### Поддерживаемые сайты

Расширение работает на большинстве интернет-магазинов, включая:
- Wildberries
- Ozon
- Яндекс.Маркет
- AliExpress
- И другие сайты с ценами

### Примечания

- Для работы расширения требуется доступ к страницам товаров
- Уведомления работают только когда браузер открыт
- Проверка цен происходит автоматически каждые 12 часов (2 раза в день)

---

**[↑ Back to Top](#product-price-tracker-firefox-extension)**
