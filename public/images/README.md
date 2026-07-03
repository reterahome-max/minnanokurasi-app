# public/images — 実写真の置き場

`lib/images.ts` がここのファイルを参照します。**下記のファイル名で保存**してください（拡張子 `.jpg` 固定・小文字）。

| 保存ファイル名 | 内容 | 使われる場所 |
|---|---|---|
| `ba_ac_before.jpg` | エアコン内部（汚れ）Before | Before/After スライダー |
| `ba_ac_after.jpg`  | エアコン内部（清掃後）After | Before/After ＋ エアコンのサムネ |
| `ba_water_before.jpg` | 洗面化粧台（汚れ）Before | Before/After スライダー |
| `ba_water_after.jpg`  | 洗面化粧台（清掃後）After | Before/After ＋ 洗面所のサムネ |

## 追加していく場合
`lib/images.ts` の該当キーに `"/images/ファイル名.jpg"` を入れるだけで全画面に反映されます。
before/after は必ず「同じ画角・同じ構図」で before と after を揃えると比較がきれいに出ます。

推奨：横長（4:3〜16:9）、長辺 1600px 程度、JPG 80% 前後。
