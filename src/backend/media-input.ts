const types = ["RADIO", "PODCAST", "VIDEO", "NEWSPAPER", "IMAGE"] as const;

export function readMediaInput(input: unknown) {
  const body = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const type = typeof body?.type === "string" ? body.type.toUpperCase() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const image = typeof body?.image === "string" ? body.image.trim() : "";
  const mediaUrl = typeof body?.mediaUrl === "string" ? body.mediaUrl.trim() : "";
  const duration = typeof body?.duration === "string" ? body.duration.trim() : "";
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
  const dateText = typeof body?.publishedAt === "string" ? body.publishedAt : "";
  const publishedAt = dateText ? new Date(dateText) : null;

  if (!types.includes(type as (typeof types)[number])) throw new Error("Choose a valid content type.");
  if (title.length < 3 || title.length > 200) throw new Error("Title must be between 3 and 200 characters.");
  if (description.length > 5000) throw new Error("Description must be 5,000 characters or fewer.");
  for (const value of [image, mediaUrl]) {
    if (!value) continue;
    if (value.startsWith("/")) continue;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      throw new Error("Image and media links must be valid HTTP or HTTPS URLs.");
    }
  }
  if (dateText && (!publishedAt || Number.isNaN(publishedAt.getTime()))) throw new Error("Enter a valid publication date.");

  return {
    type: type as (typeof types)[number], title, description,
    image: image || null, mediaUrl: mediaUrl || null, duration: duration || null,
    categoryId: categoryId || null, publishedAt, isPublished: body?.isPublished === true,
  };
}
