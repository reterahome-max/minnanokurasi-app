import { describe, it, expect } from "vitest";
import {
  CORP_MENUS, getCorpMenu, lineSubtotal, wallpaperUnitPrice, estimate, CORP_MIN_CHARGE,
} from "../lib/corporatePricing";

// 仕様書の例で使う項目をID解決するヘルパー
const idByName = (name: string) => CORP_MENUS.find((m) => m.name.includes(name))!.id;

describe("法人 原状回復エンジン（税抜・独立）", () => {
  it("量産クロスは数量で単価が変わる（§17）", () => {
    expect(wallpaperUnitPrice(52)).toBe(980);
    expect(wallpaperUnitPrice(30)).toBe(1200);
    expect(wallpaperUnitPrice(8)).toBeNull();
  });

  it("量産クロス52㎡ = 50,960円 / 8㎡は算出不可(null)", () => {
    const cloth = getCorpMenu(idByName("量産クロス"))!;
    expect(lineSubtotal(cloth, 52)).toBe(50960);
    expect(lineSubtotal(cloth, 8)).toBeNull();
  });

  it("仕様§20の基本ケース：本体136,960 → 諸経費5%で税抜143,808 / 税込158,188（§19）", () => {
    const r = estimate({
      lines: [
        { menuId: idByName("空室クリーニング 1LDK・2DK（45㎡まで）"), qty: 1 }, // 40,000
        { menuId: idByName("量産クロス"), qty: 52 },                          // 50,960
        { menuId: idByName("CF張り替え（既存撤去込み）"), qty: 8 },            // 28,000
        { menuId: idByName("室内ドアハンドル交換"), qty: 2 },                 // 18,000
      ],
      adjustmentCodes: [],
    });
    expect(r.autoSubtotal).toBe(136960);
    expect(r.minAdjustment).toBe(0);
    expect(r.overhead).toBe(6848);
    expect(r.preTax).toBe(143808);
    expect(r.tax).toBe(14380);
    expect(r.total).toBe(158188);
  });

  it("最低施工料金：対象品で本体が3万円未満なら30,000円に補填", () => {
    // ソフト巾木 5m×1,200 = 6,000（最低料金対象／非exempt）
    const r = estimate({ lines: [{ menuId: idByName("ソフト巾木交換"), qty: 5 }], adjustmentCodes: [] });
    expect(r.autoSubtotal).toBe(6000);
    expect(r.minAdjustment).toBe(CORP_MIN_CHARGE - 6000); // 24,000
    expect(r.preTax).toBe(30000 + Math.round(6000 * 0.05)); // 本体+最低調整+諸経費
  });

  it("最低料金 対象外（エアコン等）は補填しない", () => {
    const r = estimate({ lines: [{ menuId: idByName("エアコン 壁掛け通常・1台目"), qty: 1 }], adjustmentCodes: [] });
    expect(r.autoSubtotal).toBe(9000);
    expect(r.minAdjustment).toBe(0);
  });

  it("写真確認は本体外・参考額として別掲、現地調査は件数のみ", () => {
    const r = estimate({
      lines: [
        { menuId: idByName("標準トイレ交換"), qty: 1 },        // photo 130,000
        { menuId: idByName("フローリング張り替え"), qty: 10 }, // site
      ],
      adjustmentCodes: [],
    });
    expect(r.autoSubtotal).toBe(0);
    expect(r.photoSubtotal).toBe(130000);
    expect(r.photoCount).toBe(1);
    expect(r.siteCount).toBe(1);
  });

  it("追加条件：夜間20%は（本体+最低調整）に対して加算", () => {
    // 空室2LDK 52,000（本体）＋夜間20% = 10,400
    const r = estimate({
      lines: [{ menuId: idByName("空室クリーニング 2LDK・3DK（65㎡まで）"), qty: 1 }],
      adjustmentCodes: ["night"],
    });
    expect(r.autoSubtotal).toBe(52000);
    expect(r.optionTotal).toBe(10400);
    expect(r.preTax).toBe(52000 + 0 + Math.round(52000 * 0.05) + 10400);
  });
});
