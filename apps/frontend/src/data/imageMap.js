// Picsum photos seeded by era ID — unique, consistent, always loads.
// Swap in real curated photography later using the era's image_query field.

export function getImageUrl(era) {
  return `https://picsum.photos/seed/${era.id}/1080/1920`
}
