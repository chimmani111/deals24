const TelegramMessage = require('../models/TelegramMessage');
const { extractLinks } = require('../utils/messageParser');
const crypto = require('crypto');
const axios = require('axios');

// Hashes to store unique content (in-memory)
let contentHashes = [];

/**
 * Calculate hash of a message's content
 * @param {string} text - Message text
 * @returns {string} - Hash of the message content
 */
function calculateHash(text) {
  const normalizedText = normalizeMessage(text);
  return crypto.createHash('sha256').update(normalizedText).digest('hex');
}

/**
 * Normalize the message (removing links and extra formatting)
 * @param {string} text - Message text
 * @returns {string} - Normalized text
 */
function normalizeMessage(text) {
  return text
    .replace(/https?:\/\/\S+/g, '') // Remove links
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space
    .toLowerCase(); // Case-insensitive comparison
}

/**
 * Replace specific links and text
 * @param {string} text - Message text
 * @returns {string} - Text with replaced links and text
 */
function replaceLinksAndText(text) {
  return text
    .replace(
      /https:\/\/t.me\/\/nikhilfkm\/|https:\/\/t.me\/trtpremiumdeals/g,
      'https://t.me/deals24com'
    )
    .replace(/TRT Premium Deals/g, 'Deals24');
}

/**
 * Detect category based on message content
 * @param {string} text - Message text
 * @returns {string|undefined} - Detected category or undefined
 */
function detectCategory(text) {
  const categories = {
    'laptops': [
      'laptop', 'notebook', 'ultrabook', 'macbook', 'lenovo', 'hp', 'dell', 
      'acer', 'asus', 'msi', 'razer', 'apple macbook', 'chromebook', 
      'gaming laptop', 'surface laptop', 'thinkpad', 'ideapad', 'legion', 
      'vivobook', 'zenbook', 'spectre', 'pavilion', 'omen', 'inspiron', 
      'latitude', 'xps', 'rog', 'tuf', 'predator', 'swift', 'helios', 
      'nitro', 'blade', 'stealth', 'probook'
    ],
    'electronics-home': [
      'washing machine', 'tv', 'television', 'sofa', 'refrigerator', 
      'fridge', 'air conditioner', 'ac', 'microwave', 'oven', 'toaster', 
      'dishwasher', 'water purifier', 'home theatre', 'soundbar', 'geyser', 
      'cooler', 'vacuum cleaner', 'iron', 'induction cooktop', 'blender', 
      'mixer grinder', 'juicer', 'coffee maker', 'rice cooker', 'heater', 
      'fan', 'chimney', 'deep freezer', 'air fryer'
    ],
    'mobile-phones': [
      'iphone', 'android', 'smartphone', 'mobile phone', '5g phone', 
      'samsung', 'oneplus', 'xiaomi', 'redmi', 'oppo', 'vivo', 'realme', 
      'motorola', 'nokia', 'google pixel', 'sony xperia', 'huawei', 
      'asus rog phone', 'infinix', 'tecno', 'honor', 'iqoo', 'poco', 
      'foldable phone', 'flip phone', 'flagship phone', 'budget phone', 
      'mid-range phone', 'flagship killer'
    ],
    'gadgets-accessories': [
      'power bank', 'tws', 'earphones', 'earbuds', 'headphones', 
      'bluetooth earphones', 'neckband', 'chargers', 'fast charger', 
      'usb charger', 'wireless charger', 'cable', 'usb cable', 
      'type-c cable', 'lightning cable', 'hdmi cable', 'adapter', 
      'memory card', 'sd card', 'pendrive', 'usb drive', 'hdd', 
      'ssd', 'laptop bag', 'keyboard', 'mouse', 'gaming mouse', 
      'mouse pad', 'cooling pad', 'phone case', 'screen protector', 
      'smartwatch', 'fitness band', 'vr headset', 'gaming controller'
    ],
    'fashion': [
      'clothing', 't-shirt', 'shirt', 'jeans', 'trousers', 'pants', 
      'shorts', 'skirt', 'dress', 'jacket', 'blazer', 'sweater', 
      'hoodie', 'coat', 'suit', 'ethnic wear', 'kurta', 'saree', 
      'lehenga', 'salwar', 'leggings', 'innerwear', 'nightwear', 
      'sportswear', 'shoes', 'sneakers', 'heels', 'sandals', 
      'flip-flops', 'boots', 'formal shoes', 'loafers', 'running shoes', 
      'belts', 'wallets', 'watches', 'sunglasses', 'jewelry', 
      'rings', 'necklace', 'bracelet', 'earrings', 'bangles', 
      'handbag', 'clutch', 'backpack'
    ]
  };

  const lowerText = text.toLowerCase();

  for (let category in categories) {
    for (let keyword of categories[category]) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i'); // Ensure proper boundary matching
      if (regex.test(lowerText)) {
        console.log(`Matched category: ${category} with keyword: ${keyword}`); // Log the matched category and keyword
        return category;
      }
    }
  }
  
  return undefined; // Return undefined if no category matches
}

/**
 * Check if the message is recent (within 5 minutes)
 * @param {number} messageDate - Message date in Unix timestamp
 * @returns {boolean} - Whether the message is recent
 */
function isRecentMessage(messageDate) {
  const messageTimestamp = messageDate * 1000; // Convert Telegram timestamp (seconds) to milliseconds
  const currentTimestamp = Date.now();
  return currentTimestamp - messageTimestamp <= 5 * 60 * 1000; // 5 minutes threshold
}

/**
 * Check if the message is low context
 * @param {string} text - Message text
 * @returns {boolean} - Whether the message is low context
 */
function isLowContext(text) {
  const meaningfulText = text.replace(/https?:\/\/\S+/g, '').trim(); // Remove links
  if (meaningfulText.length < 30) return true; // Too short
  const lowContextKeywords = ['loot', 'deal', 'link', 'fast', 'price drop'];
  const keywordMatch = lowContextKeywords.some((keyword) =>
    meaningfulText.toLowerCase().includes(keyword)
  );
  return keywordMatch && meaningfulText.length < 60; // Keywords but no big context
}

/**
 * Check if the product is profitable
 * @param {string} text - Message text
 * @returns {boolean} - Whether the product is profitable
 */
function isProfitableProduct(text) {
  const profitableKeywords = [
    'tv', 'tvs', '4ktvs', '4k', 'laptop', 'washing machine', 'ai',
    'kg', '12 kg', '9 kg', '7 kg', '8 kg', '6.5 kg', '10 kg', '8.5 kg',
    'front load', 'top load', 'air conditioner', 'ac', 'acs', 'ton',
    'refrigerator', '653 l', 'single door', 'double door', 'triple door',
    'side by side', 'intel', 'core', 'ryzen', 'bravia',
  ];

  for (let keyword of profitableKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i'); // Ensure proper boundary matching
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the highest quality photo from a photo array
 * @param {Array} photos - Array of Telegram photo objects
 * @returns {Object|null} - Highest quality photo or null
 */
function getHighestQualityPhoto(photos) {
  if (!photos || photos.length === 0) return null;
  return photos.reduce(
    (max, p) => (p.file_size > max.file_size ? p : max),
    photos[0]
  );
}

/**
 * Download Telegram file and get URL
 * @param {string} fileId - Telegram file ID
 * @param {string} botToken - Telegram bot token
 * @returns {Promise<string|null>} - File URL or null
 */
async function getTelegramFileUrl(fileId, botToken) {
  try {
    if (!botToken) {
      console.log('Bot token not available for file URL');
      return null;
    }
    
    const fileInfoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    console.log('Requesting file info from:', fileInfoUrl);
    
    const response = await axios.get(fileInfoUrl);
    
    if (!response.data || !response.data.ok || !response.data.result || !response.data.result.file_path) {
      console.error('Invalid response from Telegram getFile API:', response.data);
      return null;
    }
    
    const filePath = response.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    console.log('Generated file URL:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error getting Telegram file URL:', error);
    return null;
  }
}

/**
 * Save a new message from Telegram (incorporating core logic)
 * @param {Object} message - Telegram message object
 * @returns {Promise<Object>} - Saved message
 */
async function saveMessage(message) {
  try {
    // Extract message details
    const { message_id, chat, date, text: originalText, photo, caption } = message;
    const textContent = originalText || caption || '';
    const channelId = chat.id.toString();
    
    // Skip if the message is not recent (more than 5 minutes old)
    if (!isRecentMessage(date)) {
      console.log('Skipping message older than 5 minutes');
      return null;
    }
    
    // Check if the message content is duplicate based on hash
    const messageHash = calculateHash(textContent);
    if (contentHashes.includes(messageHash)) {
      console.log('Skipping duplicate content');
      return null;
    }
    
    // Skip low-context messages
    if (isLowContext(textContent)) {
      console.log('Skipping low-context message');
      return null;
    }
    
    // Check if it's a profitable product if in sale mode
    const IS_SALE_MODE = process.env.IS_SALE_MODE === 'true';
    if (IS_SALE_MODE && !isProfitableProduct(textContent)) {
      console.log('Skipping non-profitable product in sale mode');
      return null;
    }
    
    // Check if message already exists in database
    const existingMessage = await TelegramMessage.findOne({
      messageId: message_id.toString(),
      channelId
    });
    
    if (existingMessage) {
      console.log('Message already exists in database');
      return existingMessage;
    }
    
    // Process the message (using your core logic)
    const processedText = replaceLinksAndText(textContent);
    const finalCaption = processedText + '\n\n#Deals24';
    
    // Extract link from text
    const link = extractLinks(textContent);
    
    // Determine category based on message content
    const category = detectCategory(textContent);
    
    // Get image URL if available
    let imageUrl = null;
    if (photo && photo.length > 0) {
      // Use the largest photo available
      const bestPhoto = getHighestQualityPhoto(photo);
      
      // Log photo information for reference
      console.log('Photo information:', JSON.stringify(bestPhoto));
      
      // Get file URL using Telegram API
      if (process.env.TELEGRAM_BOT_TOKEN) {
        imageUrl = await getTelegramFileUrl(bestPhoto.file_id, process.env.TELEGRAM_BOT_TOKEN);
      }
    }
    
    // Add hash to processed list
    contentHashes.push(messageHash);
    if (contentHashes.length > 50) contentHashes.shift(); // Limit stored hashes to save memory
    
    // Create and save new message
    const newMessage = new TelegramMessage({
      messageId: message_id.toString(),
      text: finalCaption, // Use the processed text with hashtag
      date: new Date(date * 1000), // Convert Unix timestamp to Date
      link,
      imageUrl,
      category,
      clicks: 0,
      channelId
    });
    
    console.log('Saving new message with category:', category);
    return await newMessage.save();
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

/**
 * Get messages with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Paginated messages
 */
async function getMessages(options = {}) {
  const { limit = 10, cursor, channelId, category, search } = options;
  
  let query = {};
  if (channelId) {
    query.channelId = channelId;
  }
  
  if (cursor) {
    query._id = { $lt: cursor };
  }
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.text = { $regex: search, $options: 'i' };
  }
  
  const messages = await TelegramMessage.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();
  
  const hasMore = messages.length > limit;
  const data = hasMore ? messages.slice(0, limit) : messages;
  
  return {
    data,
    hasMore,
    nextCursor: hasMore && data.length > 0 ? data[data.length - 1]._id : null
  };
}

/**
 * Increment the click count for a message
 * @param {string} messageId - ID of the message
 * @returns {Promise<Object>} - Updated message
 */
async function incrementClicks(messageId) {
  return await TelegramMessage.findByIdAndUpdate(
    messageId, 
    { $inc: { clicks: 1 } },
    { new: true }
  );
}

module.exports = {
  saveMessage,
  getMessages,
  incrementClicks,
  calculateHash,
  normalizeMessage,
  isRecentMessage,
  isLowContext,
  isProfitableProduct,
  replaceLinksAndText,
  detectCategory,
  getHighestQualityPhoto,
  getTelegramFileUrl
};
