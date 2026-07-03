/**
 * 郵便番号 → 住所検索（zipcloud API・キー不要）
 * 失敗・見つからない場合は null。
 */
export async function lookupAddress(zip: string): Promise<string | null> {
  const d = zip.replace(/[-\s]/g, "");
  if (!/^\d{7}$/.test(d)) return null;
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${d}`, { cache: "force-cache" });
    const json = (await res.json()) as {
      results?: { address1: string; address2: string; address3: string }[] | null;
    };
    const r = json.results?.[0];
    return r ? `${r.address1}${r.address2}${r.address3}` : null;
  } catch {
    return null;
  }
}
