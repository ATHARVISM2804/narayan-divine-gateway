import { describe, expect, it } from "vitest";
import { averageRating, reviewsFor, roundedCount, youTubeId, type Review } from "./proof";
import { timeLeft } from "./countdown";

const review = (over: Partial<Review>): Review => ({
  id: "r", name: "Ram", city: null, city_hi: null, rating: 5, text: "Good", text_hi: null,
  puja_id: null, chadhava_id: null, review_date: "2026-10-01", video_url: null, photo_url: null,
  featured: false, sort_order: 0, status: "active", created_at: "2026-10-01", ...over,
});

describe("youTubeId", () => {
  it("reads the id from watch, short, embed and shorts links", () => {
    expect(youTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youTubeId("https://youtu.be/dQw4w9WgXcQ?t=3")).toBe("dQw4w9WgXcQ");
    expect(youTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youTubeId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youTubeId("https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("returns null for other links", () => {
    expect(youTubeId("https://example.com/video.mp4")).toBeNull();
    expect(youTubeId(null)).toBeNull();
  });
});

describe("roundedCount", () => {
  it("rounds down to a friendly figure", () => {
    expect(roundedCount(462)).toBe("460+");
    expect(roundedCount(37)).toBe("37+");
    expect(roundedCount(1287)).toBe("1,200+");
    expect(roundedCount(25480)).toBe("25,000+");
  });
});

describe("reviewsFor", () => {
  it("puts reviews for this puja first, then the rest, without repeats", () => {
    const all = [review({ id: "a" }), review({ id: "b", puja_id: "p1" }), review({ id: "c", chadhava_id: "c1" })];
    expect(reviewsFor(all, { pujaId: "p1" }).map((r) => r.id)).toEqual(["b", "a", "c"]);
    expect(reviewsFor(null, { pujaId: "p1" })).toEqual([]);
  });
});

describe("averageRating", () => {
  it("averages to one decimal and is null when there are no reviews", () => {
    expect(averageRating([review({ rating: 5 }), review({ rating: 4 }), review({ rating: 4 })])).toEqual({ avg: 4.3, count: 3 });
    expect(averageRating([])).toBeNull();
  });
});

describe("timeLeft", () => {
  it("splits the remaining time and flags expiry", () => {
    const now = Date.UTC(2026, 9, 11, 0, 0, 0);
    expect(timeLeft(new Date(now + 90061000), now)).toEqual({ days: 1, hours: 1, mins: 1, secs: 1, expired: false });
    expect(timeLeft(new Date(now - 1), now).expired).toBe(true);
  });
});
