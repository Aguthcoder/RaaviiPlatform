export function getTopicImage(topic: string, seed = 1, width = 1200, height = 800) {
  const query = encodeURIComponent(topic);
  return `https://source.unsplash.com/${width}x${height}/?${query}&sig=${seed}`;
}
