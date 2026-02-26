// Picsum photos seeded by era ID — unique, consistent, always loads.

export function getImageUrl(era) {
  return `https://picsum.photos/seed/${era.id}/1080/1920`
}
