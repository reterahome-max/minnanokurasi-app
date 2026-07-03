import { describe, it, expect } from "vitest";
import { calcBill, getService, optionsFor, serviceGroups, SERVICES } from "../lib/pricing";

describe("calcBill（クリーニング・税込）", () => {
  it("壁掛けエアコン 2台 = 19,800円", () => {
    const b = calcBill("ac_wall", 2);
    expect(b.totalIncl).toBe(19800);
    expect(b.net + b.tax).toBe(b.totalIncl);
  });

  it("壁掛け 2台 + 防カビ = 25,800円", () => {
    const b = calcBill("ac_wall", 2, ["anti_mold"]);
    expect(b.totalIncl).toBe(25800);
    expect(b.lines).toHaveLength(2);
  });

  it("浴室 1式 = 16,000円 / 2式 = 32,000円", () => {
    expect(calcBill("bath", 1).totalIncl).toBe(16000);
    expect(calcBill("bath", 2).totalIncl).toBe(32000);
  });

  it("定額系にエアコンのオプションを渡しても無視される", () => {
    expect(calcBill("bath", 1, ["anti_mold"]).totalIncl).toBe(16000);
  });

  it("不明なサービスIDは0円", () => {
    expect(calcBill("nope", 1).totalIncl).toBe(0);
  });

  it("税抜+消費税=税込が全サービスで成立", () => {
    for (const s of SERVICES) {
      const b = calcBill(s.id, 3);
      expect(b.net + b.tax).toBe(b.totalIncl);
    }
  });

  it("serviceGroups は ac 1グループ + flat 各1", () => {
    const g = serviceGroups();
    expect(g[0].type).toBe("ac");
    expect(g[0].variants).toHaveLength(3);
    expect(g.filter((x) => x.type === "flat")).toHaveLength(SERVICES.filter((s) => s.type === "flat").length);
  });

  it("optionsFor はエアコン系のみ3件", () => {
    expect(optionsFor("ac_wall")).toHaveLength(3);
    expect(optionsFor("bath")).toHaveLength(0);
    expect(getService("ac_wall")?.price).toBe(9900);
  });
});
