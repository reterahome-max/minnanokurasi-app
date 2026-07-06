import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, MapPin, Check, ChevronRight, Phone, Calculator, Sparkles, Wrench, Camera, Building2,
} from "lucide-react";
import Photo from "@/components/Photo";
import { getCity } from "../cities";
import { popularList, num } from "@/lib/pricing";
import { COMPANY } from "@/lib/company";

/**
 * RE:TERA HOME — エリア別LP（/area/koshigaya・/area/kasukabe）
 * 「市名×サービス」の地域検索の受け皿。実データ（lib/pricing）の料金つきで
 * サービス→詳細→予約へ流す。デザインは既存トンマナ（rt-*）準拠・サーバーコンポーネント。
 */
export default async function AreaPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();

  const services = popularList().slice(0, 6);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/" className="rt-back" aria-label="ホームへ戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">{c!.name}の対応サービス</div>
        </header>

        <h1 className="rt-area-h1">{c!.name}のハウスクリーニング・<br />リフォームは RE:TERA HOME へ</h1>
        <p className="rt-area-lead">{c!.lead}</p>

        <div className="rt-area-access">
          <MapPin size={16} strokeWidth={2.4} />
          <div><b>{c!.access}</b><span>対応地区の例：{c!.districts.join("・")} ほか市内全域</span></div>
        </div>

        <h2 className="rt-sec-h">料金（税込・追加料金なし）</h2>
        <p className="rt-sec-sub">{c!.name}も通常対応エリア。表示価格のみでお伺いします。</p>
        <div className="rt-area-cards">
          {services.map((s) => (
            <Link href={`/services/${s.id}`} className="rt-area-card" key={s.id}>
              <div className="rt-area-card-photo"><Photo srcKey={s.img} alt={`${c!.name}の${s.title}`} /></div>
              <div className="rt-area-card-body">
                <div className="rt-area-card-t">{s.title}</div>
                <div className="rt-area-card-p">{num(s.price)}<span>円〜</span></div>
              </div>
              <ChevronRight size={17} strokeWidth={2.6} className="rt-area-card-cv" />
            </Link>
          ))}
        </div>

        <div className="rt-area-more">
          <Link href="/reform" className="rt-area-more-row">
            <span className="rt-area-more-ico"><Wrench size={18} strokeWidth={2.2} /></span>
            <span className="rt-area-more-body"><b>リフォームも対応</b><i>クロス・床・網戸・トイレ交換など（税抜・概算あり）</i></span>
            <ChevronRight size={16} strokeWidth={2.6} />
          </Link>
          <Link href="/works" className="rt-area-more-row">
            <span className="rt-area-more-ico"><Camera size={18} strokeWidth={2.2} /></span>
            <span className="rt-area-more-body"><b>施工事例（ビフォーアフター）</b><i>{c!.name}エリアを含む実際の施工写真</i></span>
            <ChevronRight size={16} strokeWidth={2.6} />
          </Link>
          <Link href="/corporate" className="rt-area-more-row">
            <span className="rt-area-more-ico"><Building2 size={18} strokeWidth={2.2} /></span>
            <span className="rt-area-more-body"><b>管理会社・オーナー様へ</b><i>空室クリーニング・原状回復の一括対応（法人）</i></span>
            <ChevronRight size={16} strokeWidth={2.6} />
          </Link>
        </div>

        <h2 className="rt-sec-h">{c!.name}のお客様からよくあるご質問</h2>
        <div className="rt-area-faqs">
          {c!.faqs.map((f) => (
            <div className="rt-area-faq" key={f.q}>
              <div className="rt-area-faq-q"><span>Q</span>{f.q}</div>
              <div className="rt-area-faq-a"><span>A</span>{f.a}</div>
            </div>
          ))}
        </div>

        <div className="rt-area-cta">
          <div className="rt-area-cta-t"><Sparkles size={17} strokeWidth={2.4} />30秒で料金がわかります</div>
          <Link href="/simulator" className="rt-area-cta-btn"><Calculator size={18} strokeWidth={2.2} />料金シミュレーターを試す<ChevronRight size={17} strokeWidth={2.6} /></Link>
          {COMPANY.tel && (
            <a href={`tel:${COMPANY.tel.replace(/[^0-9+]/g, "")}`} className="rt-area-cta-tel"><Phone size={17} strokeWidth={2.2} />{COMPANY.tel}（{c!.name}対応）</a>
          )}
          <div className="rt-area-cta-notes">
            <span><Check size={12} strokeWidth={3} />税込・追加料金なし</span>
            <span><Check size={12} strokeWidth={3} />損害保険加入</span>
            <span><Check size={12} strokeWidth={3} />地域密着</span>
          </div>
        </div>

        <footer className="rt-area-foot">
          <div className="rt-area-foot-links">
            <Link href="/">ホーム</Link>
            <Link href="/services">サービス一覧</Link>
            <Link href="/guide">初めての方へ</Link>
            <Link href="/legal">利用規約・特商法</Link>
          </div>
          <div className="rt-area-foot-note">{COMPANY.name}｜{COMPANY.address}｜対応エリア：{COMPANY.area}</div>
        </footer>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-area-h1{font-size:23px;font-weight:900;line-height:1.4;margin:4px 0 10px;}
.rt-area-lead{font-size:13px;color:var(--ink-2);font-weight:600;line-height:1.75;margin:0 0 16px;}
.rt-area-access{display:flex;align-items:flex-start;gap:9px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:13px;padding:13px 14px;margin-bottom:22px;}
.rt-area-access svg{color:var(--red);flex:none;margin-top:2px;}
.rt-area-access b{display:block;font-size:12.5px;font-weight:800;margin-bottom:3px;}
.rt-area-access span{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-sec-h{font-size:17px;font-weight:900;letter-spacing:.01em;margin:0 0 3px;}
.rt-sec-sub{font-size:12px;color:var(--ink-2);font-weight:600;margin:0 0 13px;line-height:1.5;}
.rt-area-cards{display:flex;flex-direction:column;gap:9px;margin-bottom:22px;}
.rt-area-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px;box-shadow:var(--shadow);text-decoration:none;color:inherit;}
.rt-area-card-photo{flex:none;width:64px;height:52px;border-radius:9px;overflow:hidden;position:relative;}
.rt-area-card-body{flex:1;min-width:0;}
.rt-area-card-t{font-size:13.5px;font-weight:800;line-height:1.35;}
.rt-area-card-p{font-size:17px;font-weight:900;color:var(--red);margin-top:2px;}
.rt-area-card-p span{font-size:11px;margin-left:1px;}
.rt-area-card-cv{color:var(--ink-3);flex:none;}
.rt-area-more{background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-area-more-row{display:flex;align-items:center;gap:11px;padding:13px 14px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;}
.rt-area-more-row:last-child{border-bottom:none;}
.rt-area-more-ico{flex:none;width:38px;height:38px;border-radius:10px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-area-more-body{flex:1;min-width:0;}
.rt-area-more-body b{display:block;font-size:13px;font-weight:800;}
.rt-area-more-body i{font-style:normal;font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-area-more-row>svg{color:var(--ink-3);flex:none;}
.rt-area-faqs{display:flex;flex-direction:column;gap:9px;margin-bottom:22px;}
.rt-area-faq{background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px 14px;box-shadow:var(--shadow);}
.rt-area-faq-q{display:flex;gap:8px;font-size:13px;font-weight:800;line-height:1.5;margin-bottom:7px;}
.rt-area-faq-q span{flex:none;color:var(--red);font-weight:900;}
.rt-area-faq-a{display:flex;gap:8px;font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.7;}
.rt-area-faq-a span{flex:none;width:18px;height:18px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:900;margin-top:1px;}
.rt-area-cta{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 15px;text-align:center;box-shadow:var(--shadow);margin-bottom:20px;}
.rt-area-cta-t{display:flex;align-items:center;justify-content:center;gap:6px;font-size:14.5px;font-weight:900;margin-bottom:13px;}
.rt-area-cta-t svg{color:var(--red);}
.rt-area-cta-btn{display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border-radius:12px;padding:15px;font-size:15px;font-weight:900;text-decoration:none;margin-bottom:9px;}
.rt-area-cta-btn:hover{background:var(--red-deep);}
.rt-area-cta-tel{display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;border:1.5px solid var(--red);color:var(--red);border-radius:12px;padding:13px;font-size:14px;font-weight:800;text-decoration:none;margin-bottom:12px;}
.rt-area-cta-notes{display:flex;flex-wrap:wrap;justify-content:center;gap:5px 13px;}
.rt-area-cta-notes span{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--ink-2);}
.rt-area-cta-notes svg{color:var(--red);}
.rt-area-foot{padding:18px 2px 6px;border-top:1px solid var(--line);}
.rt-area-foot-links{display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:10px;}
.rt-area-foot-links a{font-size:12px;font-weight:700;color:var(--ink-2);text-decoration:none;}
.rt-area-foot-note{font-size:10.5px;color:var(--ink-3);font-weight:600;line-height:1.6;}
`;
