import { describe, it, expect } from "vitest";
import { quote, REFORM_ITEMS } from "../lib/reformPricing";

describe("quote（リフォーム・税抜・諸経費15%内部上乗せ）", () => {
  it("量産クロス 30㎡ = 33,900円（980×30×1.15 → 100円切上げ）", () => {
    const r = quote("cloth_std", { area: 30 });
    expect(r.total).toBe(33900);
    expect(r.needsSurvey).toBe(true);
  });

  it("10㎡未満は最低施工料金 30,000円", () => {
    const r = quote("cloth_std", { area: 8 });
    expect(r.total).toBe(30000);
    expect(r.isMinimum).toBe(true);
  });

  it("CF洗面所 = 小空間一式 35,000円", () => {
    const r = quote("cf_washroom");
    expect(r.total).toBe(35000);
    expect(r.isSmallSpace).toBe(true);
  });

  it("フローリング居室 20㎡ = 230,000円", () => {
    expect(quote("fl_room", { area: 20 }).total).toBe(230000);
  });

  it("網戸窓 2枚 = 6,900円（bookable）", () => {
    const r = quote("net_window", { qty: 2 });
    expect(r.total).toBe(6900);
    expect(r.bookable).toBe(true);
  });

  it("トイレセット = 130,000円（上乗せなし）", () => {
    expect(quote("toilet_toto_qr").total).toBe(130000);
  });

  it("クロス穴補修は段階価格（1=15,000 / 2=23,000 / 3以上=30,000）", () => {
    expect(quote("cloth_patch", { qty: 1 }).total).toBe(15000);
    expect(quote("cloth_patch", { qty: 2 }).total).toBe(23000);
    expect(quote("cloth_patch", { qty: 5 }).total).toBe(30000);
  });

  it("面積0は算出不可（null）", () => {
    expect(quote("cloth_std", { area: 0 }).total).toBeNull();
  });

  it("不明IDは要現地調査", () => {
    const r = quote("nope");
    expect(r.total).toBeNull();
    expect(r.needsSurvey).toBe(true);
  });

  it("全マスターの total は 100円単位（set/tiered 含む）", () => {
    for (const it of REFORM_ITEMS) {
      const r = it.method === "area" ? quote(it.id, { area: 20 }) : quote(it.id, { qty: 2 });
      if (r.total != null) expect(r.total % 100).toBe(0);
    }
  });
});
