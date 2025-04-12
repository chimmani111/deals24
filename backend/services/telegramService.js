const TelegramMessage = require('../models/TelegramMessage');
const { extractLinks } = require('../utils/messageParser');
const crypto = require('crypto');
const ClickStat = require('../models/clickStat.model');
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
  console.log('Detecting category for:', text);
  const categories = {
    "laptops": [
      "laptop", "notebook", "ultrabook", "macbook", "mac", "lenovo", "hp", "dell", "asus", "msi", "razer", "apple macbook", "chromebook", 
      "gaming laptop", "surface", "surface laptop", "thinkpad", "ideapad", 
      "legion", "vivobook", "zenbook", "spectre", "pavilion", "omen", 
      "inspiron", "latitude", "rog", "tuf", "predator", "swift", 
      "helios", "nitro", "blade", "stealth", "probook"
    ],
    "electronics-home": [
      "washing machine", "tv", "television", "smart tv", "4k", "uhd", "led", 
      "oled", "qled", "sofa", "refrigerator", "fridge", "air conditioner", "ac", 
      "microwave", "oven", "toaster", "dishwasher", "water purifier", "home theatre", 
      "home theater", "soundbar", "speaker", "audio", "geyser", "cooler", 
      "vacuum cleaner", "vacuum", "iron", "induction cooktop", "blender", 
      "mixer grinder", "juicer", "coffee maker", "rice cooker", "heater", 
      "fan", "chimney", "deep freezer", "air fryer", "smart home", 
      "alexa", "echo", "google home"
    ],
    "mobile-phones": [
      "iphone", "android", "smartphone", "mobile phone", "5g phone", 
      "samsung", "galaxy", "oneplus", "xiaomi", "redmi", "oppo", "vivo", 
      "realme", "motorola", "nokia", "google pixel", "pixel", "sony xperia", 
      "huawei", "asus rog phone", "infinix", "tecno", "honor", "iqoo", 
      "poco", "foldable phone", "flip phone", "flagship phone", "budget phone", 
      "mid-range phone", "flagship killer", "phone", "mobile", "tablet", 
      "ipad", "smartwatch", "earphones", "airpods"
    ],
    "gadgets-accessories": [
      "power bank", "tws", "earphones", "earbuds", "headphones", 
      "bluetooth earphones", "neckband", "chargers", "fast charger", 
      "usb charger", "wireless charger", "cable", "usb cable", 
      "type-c cable", "lightning cable", "hdmi cable", "adapter", 
      "moniter", "monitor", "memory card", "sd card", "pendrive", 
      "usb drive", "hdd", "ssd", "laptop bag", "keyboard", "mouse", 
      "gaming mouse", "mouse pad", "cooling pad", "phone case", 
      "screen protector", "smartwatch", "fitness band", "vr headset", 
      "gaming controller"
    ],
    "fashion": [
      "clothing", "t-shirt", "tshirt", "shirt", "jeans", "trousers", 
      "pants", "shorts", "skirt", "dress", "jacket", "blazer", "sweater", 
      "hoodie", "coat", "suit", "ethnic wear", "kurta", "saree", 
      "lehenga", "salwar", "leggings", "innerwear", "nightwear", 
      "sportswear", "shoes", "sneakers", "heels", "sandals", 
      "flip-flops", "boots", "formal shoes", "loafers", "running shoes", 
      "belts", "wallets", "watches", "watch", "sunglasses", "jewelry", 
      "rings", "necklace", "bracelet", "earrings", "bangles", 
      "handbag", "clutch", "backpack", "hat", "cap", "socks", 
      "underwear", "lingerie"
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
 * Save a new message from Telegram (incorporating core logic)
 * @param {Object} message - Telegram message object
 * @returns {Promise<Object>} - Saved message
 */
async function saveMessage(message) {
  try {
    // Extract message details
    const { message_id, chat, date, text: originalText, caption } = message;
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
    
    // Process the message (using your core logic)
    const processedText = replaceLinksAndText(textContent);
    const finalCaption = processedText + '\n\n#Deals24';
    
    // Extract link from text
    const link = extractLinks(textContent);
    
    // Determine category based on message content
    const category = detectCategory(textContent);
    
    // Add hash to processed list
    contentHashes.push(messageHash);
    if (contentHashes.length > 50) contentHashes.shift(); // Limit stored hashes to save memory
    
    // Create and save new message
    const newMessage = new TelegramMessage({
      messageId: message_id.toString(),
      text: finalCaption, // Use the processed text with hashtag
      date: new Date(date * 1000), // Convert Unix timestamp to Date
      link,
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
    // Enhanced search approach that excludes URL matches
    // This regex matches the search term only when it's not part of a URL pattern
    
    // Escape special regex characters in the search term
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a regex that excludes matches within URL patterns
    // This looks for the search term but not when it's part of http/https/www URLs or common URL shorteners
    query.$and = [
      { text: { $regex: escapedSearch, $options: 'i' } },  // Text contains the search term
      { 
        // Text doesn't have the search term ONLY inside URL patterns
        text: { 
          $not: {
            $regex: new RegExp(
              // Only match documents where the search term ONLY appears in URLs
              `^(?:(?!${escapedSearch}).)*(?:https?://|www\\.|[a-z0-9][-a-z0-9]*\\.[a-z0-9]+/).*(${escapedSearch}).*$`,
              'i'
            )
          }
        }
      }
    ];
  }
  
  const messages = await TelegramMessage.find(query)
    .sort({ _id: -1 })
    .limit(parseInt(limit) + 1)
    .lean();
  
  const hasMore = messages.length > limit;
  const data = hasMore ? messages.slice(0, limit) : messages;
  
  // Add MongoDB _id to id field for frontend compatibility
  const processedData = data.map(item => ({
    ...item,
    id: item._id.toString(), // Ensure id field exists for frontend
  }));
  
  return {
    data: processedData,
    hasMore,
    nextCursor: hasMore && data.length > 0 ? data[data.length - 1]._id : null
  };
}

// Helper function for click tracking logic
async function handleClickTracking(req, res) {
  const updatedMessage = await incrementClicks(req.params.id);

  if (!updatedMessage) {
    console.log(
      `Message with ID ${req.params.id} not found for click tracking`,
    );
    return res.status(404).json({ error: 'Message not found' });
  }

  // Also record in the click stats collection
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day

  await ClickStat.findOneAndUpdate(
    { date: today },
    { $inc: { clicks: 1 } },
    { upsert: true, new: true }
  );

  console.log('Successfully created/updated click for the day');
  res.json({ success: true, clicks: updatedMessage.clicks });
}

/**
 * Increment the click count for a message
 * @param {string} messageId - ID of the message
 * @returns {Promise<Object>} - Updated message
 */
async function incrementClicks(messageId) {
  if (!messageId) {
    console.error('Cannot increment clicks: message ID is missing');
    return null;
  }
  
  try {
    const updatedMessage = await TelegramMessage.findByIdAndUpdate(
      messageId, 
      { $inc: { clicks: 1 } },
      { new: true }
    );
    
    if (!updatedMessage) {
      console.log(`No message found with ID: ${messageId} for click tracking`);
    } else {
      console.log(`Updated clicks for message ID: ${messageId} to ${updatedMessage.clicks}`);
    }
    
    return updatedMessage;
  } catch (error) {
    console.error(`Error incrementing clicks for message ${messageId}:`, error);
    return null;
  }
}

module.exports = {
  saveMessage,
  getMessages,
  calculateHash,
  normalizeMessage,
  isRecentMessage,
  isLowContext,
  isProfitableProduct,
  replaceLinksAndText,
  detectCategory,
  handleClickTracking
};
