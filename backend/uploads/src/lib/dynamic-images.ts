/**
 * تصاویر داینامیک برای رویدادها بر اساس دسته‌بندی و موضوع
 * از Unsplash استفاده می‌شود (مشابه صفحه اصلی)
 */

const EVENT_CATEGORY_IMAGES: Record<string, string[]> = {
  hambazi: [
    'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800&q=80',
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  ],
  hamneshin: [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
  ],
  hamsohbat: [
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
    'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=800&q=80',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
  ],
  hampa: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
  ],
  hamamooz: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
  ],
  hamkar: [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
  ],
  hamfekr: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
    'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    'https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?w=800&q=80',
  ],
  hamteymi: [
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
  ],
  hamghesse: [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80',
  ],
};

/**
 * دریافت تصویر داینامیک برای رویداد بر اساس دسته‌بندی و ID
 * از seed برای ثبات تصویر در هر بار لود استفاده می‌شود
 */
export function getEventImage(
  category?: string,
  eventId?: string,
  fallback?: string,
): string {
  if (fallback && !fallback.includes('/categories/')) return fallback;

  const cat = category?.toLowerCase() || 'default';
  const images = EVENT_CATEGORY_IMAGES[cat] || EVENT_CATEGORY_IMAGES['default'];

  // تولید index ثابت بر اساس eventId
  let seed = 0;
  if (eventId) {
    for (let i = 0; i < eventId.length; i++) {
      seed = (seed + eventId.charCodeAt(i)) % images.length;
    }
  } else {
    seed = Math.floor(Math.random() * images.length);
  }

  return images[seed % images.length];
}

/**
 * تصویر موضوع‌محور برای کارت‌ها
 */
export function getTopicImage(topic: string, seed = 1, width = 1200, height = 800): string {
  const query = encodeURIComponent(topic);
  return `https://images.unsplash.com/${width}x${height}/?${query}&sig=${seed}`;
}

/**
 * تصویر fallback برای خطا در لود تصویر
 */
export function getEventImageFallback(category?: string): string {
  return getEventImage(category, 'fallback');
}
