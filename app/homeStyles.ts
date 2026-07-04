/**
 * ホーム（/）の共通スタイル。一般ホームと法人ホーム（/corporate）で共有する。
 * 法人側は <div className="theme-navy"> でラップし var(--red) 系をネイビーに上書きするだけで、
 * まったく同じレイアウト・余白・影のまま色味だけ淡ネイビーに切り替わる（デザイン非改変）。
 */
export const homeStyles = `
/* shared CTA */
.rt-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border:none;
  border-radius:12px;padding:15px;font-size:16px;font-weight:900;letter-spacing:.04em;cursor:pointer;box-shadow:var(--shadow-md);transition:background .15s;text-decoration:none;}
.rt-cta:hover{background:var(--red-deep);}
.rt-sec-h{font-size:21px;font-weight:900;letter-spacing:.01em;margin:0 0 3px;}
.rt-sec-sub{font-size:12px;color:var(--ink-2);font-weight:600;margin:0 0 14px;line-height:1.5;}

/* area */
.rt-area-row{display:flex;gap:9px;margin-bottom:12px;}
.rt-area-btn{display:flex;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12.5px;font-weight:800;border-radius:12px;padding:0 12px;height:46px;white-space:nowrap;cursor:pointer;}
.rt-area-cv{margin-left:2px;}
.rt-zip{flex:1;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);border-radius:12px;padding-left:11px;height:46px;overflow:hidden;}
.rt-zip-ico{color:var(--ink-3);flex:none;}
.rt-zip-input{flex:1;min-width:0;border:none;outline:none;background:none;font-size:12.5px;color:var(--ink);font-family:inherit;}
.rt-zip-input::placeholder{color:var(--ink-3);}
.rt-zip-btn{flex:none;height:100%;border:none;background:var(--red);color:#fff;font-size:14px;font-weight:800;padding:0 18px;cursor:pointer;letter-spacing:.08em;}
.rt-zip-btn:hover{background:var(--red-deep);}
.rt-zip-msg{display:flex;align-items:flex-start;gap:6px;font-size:12px;font-weight:700;color:var(--ink-2);background:#fff;border:1px solid var(--line);border-radius:11px;padding:11px 12px;margin:-4px 0 12px;line-height:1.5;}
.rt-zip-msg svg{flex:none;margin-top:2px;color:var(--ink-3);}
.rt-zip-msg.ok{color:var(--green);background:var(--green-soft);border-color:var(--green-soft);}
.rt-zip-msg.ok svg{color:var(--green);}

/* hero */
.rt-hero{position:relative;border-radius:18px;overflow:hidden;background:#fff;border:1px solid var(--line);margin-bottom:14px;box-shadow:var(--shadow);}
.rt-hero-photo{position:absolute;top:0;right:0;width:52%;height:100%;z-index:1;}
.rt-hero-photo::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(100deg,#fff 4%,rgba(255,255,255,0) 46%);pointer-events:none;}
.rt-hero-photo .rt-photo{object-position:62% 16%;}
.rt-hero-inner{position:relative;z-index:2;padding:18px 16px 16px;}
.rt-hero-ribbon{font-size:11.5px;font-weight:700;color:var(--ink-2);margin-bottom:8px;}
.rt-hero-h1{font-size:33px;font-weight:900;line-height:1.15;margin:0 0 10px;letter-spacing:.01em;}
.rt-hero-red{color:var(--red);}
.rt-hero-sub{font-size:12.5px;line-height:1.6;color:var(--ink-2);font-weight:600;margin:0 0 12px;}
.rt-hero-cats{display:flex;gap:16px;margin:2px 0 15px;}
.rt-hero-cat{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:10.5px;font-weight:800;color:var(--ink);text-decoration:none;}
.rt-hero-cat-img{width:52px;height:52px;border-radius:50%;overflow:hidden;border:2px solid #fff;box-shadow:var(--shadow-md);position:relative;display:block;}
.rt-trust{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
.rt-trust-card{background:rgba(255,255,255,.96);border-radius:12px;padding:10px 9px;display:flex;flex-direction:column;gap:6px;box-shadow:var(--shadow);}
.rt-trust-ico{width:34px;height:34px;border-radius:50%;border:2px dotted var(--gold);color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;}
.rt-trust-t{font-size:11.5px;font-weight:800;line-height:1.25;}
.rt-trust-d{font-size:9.5px;color:var(--ink-2);line-height:1.4;font-weight:600;}
.rt-trust-pct{font-size:19px;font-weight:900;line-height:1;}
.rt-trust-pct span{font-size:11px;margin-left:1px;}
.rt-stars{display:flex;align-items:center;gap:1px;color:var(--gold);margin-top:2px;}
.rt-star-half{position:relative;width:5.5px;overflow:hidden;display:inline-flex;}

/* simulator */
.rt-sim{background:linear-gradient(180deg,var(--red-soft-2),var(--red-soft));border:1px solid #F5DAD8;border-radius:18px;padding:15px 14px;margin-bottom:14px;}
.rt-sim-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:13px;}
.rt-sim-left{display:flex;align-items:center;gap:10px;}
.rt-sim-ico{width:42px;height:42px;border-radius:11px;background:#fff;color:var(--red);display:flex;align-items:center;justify-content:center;flex:none;box-shadow:var(--shadow);}
.rt-sim-title{font-size:15.5px;font-weight:900;margin:0;}
.rt-sim-note{font-size:11px;font-weight:800;color:var(--red);margin-top:2px;}
.rt-sim-total{text-align:right;flex:none;}
.rt-sim-total-l{font-size:10.5px;color:var(--ink-2);font-weight:700;}
.rt-sim-total-v{font-size:27px;font-weight:900;color:var(--red);line-height:1.05;letter-spacing:-.01em;}
.rt-sim-total-v span{font-size:15px;margin-left:1px;}
.rt-selects{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px;}
.rt-select{display:flex;flex-direction:column;gap:4px;}
.rt-select:nth-child(1){grid-column:1/2;}.rt-select:nth-child(2){grid-column:2/3;}.rt-select:nth-child(3){grid-column:1/3;}
.rt-select-l{font-size:10.5px;font-weight:700;color:var(--ink-2);padding-left:2px;}
.rt-select-box{position:relative;display:flex;align-items:center;}
.rt-select-box select{appearance:none;-webkit-appearance:none;width:100%;background:#fff;border:1px solid #E7D3D2;border-radius:10px;padding:11px 30px 11px 12px;font-size:13.5px;font-weight:700;color:var(--ink);font-family:inherit;cursor:pointer;}
.rt-select-box svg{position:absolute;right:10px;color:var(--ink-3);pointer-events:none;}
.rt-sim-checks{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;margin-top:12px;}
.rt-sim-checks span{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--ink-2);}
.rt-sim-checks svg{color:var(--red);}

/* slot */
.rt-slot{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-slot-ico{width:46px;height:46px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;flex:none;}
.rt-slot-body{flex:1;min-width:0;}
.rt-slot-t{font-size:13px;font-weight:900;margin-bottom:2px;}
.rt-slot-big{font-size:15px;font-weight:700;line-height:1.3;}
.rt-slot-big b{color:var(--red);font-weight:900;}
.rt-slot-sub{font-size:11px;color:var(--ink-2);font-weight:600;margin-top:3px;}
.rt-slot-sub b{color:var(--red);font-size:14px;}
.rt-slot-sub span{color:var(--ink-3);}
.rt-slot-btn{flex:none;display:flex;align-items:center;gap:2px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:11.5px;font-weight:800;border-radius:10px;padding:8px 10px;cursor:pointer;line-height:1.25;text-align:left;text-decoration:none;}

/* categories */
.rt-cats-h{font-size:17px;font-weight:900;letter-spacing:.01em;margin:4px 0 4px;}
.rt-cats-sub{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.5;margin:0 0 11px;}
.rt-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:18px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.rt-cats::-webkit-scrollbar{display:none;}
.rt-cat{flex:none;width:62px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--ink-2);font-size:11px;font-weight:700;padding:6px 2px;border-bottom:2.5px solid transparent;}
.rt-cat-on{color:var(--red);border-bottom-color:var(--red);}

/* popular */
.rt-pop{margin-bottom:22px;}
.rt-pop-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.rt-pop-title{display:flex;align-items:center;gap:7px;font-size:17px;font-weight:900;margin:0;}
.rt-crown{color:#F0B400;}
.rt-pop-all{display:flex;align-items:center;gap:2px;background:none;border:none;color:var(--ink-2);font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;}
.rt-cards{display:flex;gap:11px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.rt-cards::-webkit-scrollbar{display:none;}
.rt-card{flex:none;width:208px;background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;scroll-snap-align:start;box-shadow:var(--shadow);}
.rt-card-photo{position:relative;height:118px;overflow:hidden;}
.rt-card-rank{position:absolute;top:8px;left:8px;z-index:2;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:6px;}
.rt-card-body{padding:11px 12px 12px;}
.rt-card-title{font-size:14px;font-weight:800;line-height:1.35;margin-bottom:4px;}
.rt-card-desc{font-size:11px;color:var(--ink-3);font-weight:600;margin-bottom:9px;}
.rt-card-foot{display:flex;align-items:flex-end;justify-content:space-between;}
.rt-card-price{font-size:21px;font-weight:900;color:var(--red);line-height:1;}
.rt-card-price span{font-size:13px;margin-left:1px;}
.rt-card-go{width:30px;height:30px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;}
.rt-dots{display:flex;justify-content:center;gap:6px;margin-top:12px;}
.rt-dot{width:7px;height:7px;border-radius:50%;background:#D7DADE;}
.rt-dot-on{background:var(--red);width:18px;border-radius:4px;}

/* before/after */
.rt-ba-sec{margin-bottom:22px;}
.rt-ba-tabs{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;padding-bottom:2px;}
.rt-ba-tabs::-webkit-scrollbar{display:none;}
.rt-ba-tab{flex:none;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:10px 18px;font-size:13px;font-weight:800;color:var(--ink-2);cursor:pointer;}
.rt-ba-tab-on{background:var(--red);border-color:var(--red);color:#fff;}
.rt-ba-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px;box-shadow:var(--shadow);}
.rt-ba-title{font-size:15px;font-weight:900;margin-bottom:6px;}
.rt-ba-desc{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.5;margin-bottom:10px;}
.rt-ba-checks{list-style:none;margin:0 0 13px;padding:0;display:flex;flex-direction:column;gap:6px;}
.rt-ba-checks li{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--ink);}
.rt-ba-checks svg{color:var(--red);flex:none;}
.rt-ba-imgs{margin-bottom:8px;}
.rt-cmp{position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;user-select:none;touch-action:pan-y;cursor:ew-resize;background:#EDF1F3;}
.rt-cmp-layer{position:absolute;inset:0;}
.rt-cmp-badge{position:absolute;top:9px;left:9px;z-index:3;font-size:10.5px;font-weight:800;color:#fff;padding:3px 9px;border-radius:6px;}
.rt-cmp-badge-r{left:auto;right:9px;}
.rt-cmp-handle{position:absolute;top:0;bottom:0;width:3px;background:#fff;transform:translateX(-1.5px);z-index:4;box-shadow:0 0 0 1px rgba(0,0,0,.1);}
.rt-cmp-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:none;display:flex;align-items:center;justify-content:center;color:var(--red);box-shadow:0 3px 12px rgba(0,0,0,.28);cursor:ew-resize;}
.rt-cmp-hint{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;font-weight:700;color:var(--ink-3);margin-bottom:13px;}
.rt-cmp-hint svg{color:var(--red);}
.rt-ba-arrow{color:var(--ink-3);flex:none;}
.rt-ba-before{background:rgba(40,44,48,.82);}
.rt-ba-after{background:var(--red);}
.rt-ba-link{display:inline-flex;align-items:center;gap:3px;background:none;border:none;color:var(--red);font-size:13px;font-weight:800;cursor:pointer;padding:0;text-decoration:none;}
.rt-ba-more{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:12px;background:#fff;border:1.5px solid var(--red);border-radius:12px;padding:13px;font-size:13.5px;font-weight:800;color:var(--red);text-decoration:none;}
.rt-ba-more:hover{background:var(--red-soft);}

/* flow */
.rt-flow-sec{margin-bottom:20px;}
.rt-flow{display:flex;flex-direction:column;gap:11px;margin-bottom:14px;}
.rt-flow-row{display:flex;align-items:stretch;gap:10px;}
.rt-flow-num{flex:none;width:30px;height:30px;border-radius:50%;border:2px solid var(--red);color:var(--red);
  display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;background:#fff;margin-top:14px;}
.rt-flow-card{flex:1;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:13px;box-shadow:var(--shadow);}
.rt-flow-ico{flex:none;width:48px;height:48px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-flow-body{flex:1;min-width:0;}
.rt-flow-t{font-size:15px;font-weight:900;margin-bottom:3px;}
.rt-flow-d{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.55;}
.rt-speed{display:flex;align-items:center;gap:11px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:14px;padding:14px;}
.rt-speed-ico{flex:none;width:40px;height:40px;border-radius:50%;border:1.5px solid var(--ink-3);color:var(--ink-2);display:flex;align-items:center;justify-content:center;}
.rt-speed-body{flex:1;min-width:0;}
.rt-speed-t{font-size:13.5px;font-weight:900;color:var(--red);margin-bottom:3px;line-height:1.3;}
.rt-speed-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-speed-badge{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;border:1.5px solid var(--red);color:var(--red);border-radius:10px;padding:8px 10px;font-size:10.5px;font-weight:800;text-align:center;line-height:1.3;}
.rt-flow-guide{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:12px;background:#fff;border:1.5px solid var(--red);border-radius:12px;padding:13px;font-size:13.5px;font-weight:800;color:var(--red);text-decoration:none;}
.rt-flow-guide:hover{background:var(--red-soft);}

/* faq */
.rt-faq-sec{margin-bottom:20px;}
.rt-faq-search{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:0 13px;height:48px;margin-bottom:12px;box-shadow:var(--shadow);}
.rt-faq-sico{color:var(--ink-3);flex:none;}
.rt-faq-input{flex:1;min-width:0;border:none;outline:none;background:none;font-size:13px;color:var(--ink);font-family:inherit;}
.rt-faq-input::placeholder{color:var(--ink-3);}
.rt-faq-chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;padding-bottom:2px;}
.rt-faq-chips::-webkit-scrollbar{display:none;}
.rt-faq-chip{flex:none;background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:8px 16px;font-size:12.5px;font-weight:700;color:var(--ink-2);cursor:pointer;}
.rt-faq-chip-on{border-color:var(--red);color:var(--red);background:var(--red-soft);}
.rt-faq-list{display:flex;flex-direction:column;gap:9px;}
.rt-faq-item{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:border-color .2s;}
.rt-faq-item[data-open="true"]{border-color:var(--red);}
.rt-faq-q{width:100%;display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:15px 14px;text-align:left;}
.rt-faq-mark{flex:none;color:var(--red);font-size:17px;font-weight:900;}
.rt-faq-qt{flex:1;font-size:14px;font-weight:800;line-height:1.4;}
.rt-faq-cv{flex:none;color:var(--ink-3);transition:transform .25s;}
.rt-faq-a{overflow:hidden;transition:max-height .28s ease;}
.rt-faq-a-in{display:flex;gap:9px;padding:0 14px 15px 14px;}
.rt-faq-amark{flex:none;width:20px;height:20px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;margin-top:1px;}
.rt-faq-a-in p{margin:0;font-size:12.5px;line-height:1.7;color:var(--ink-2);font-weight:500;}

/* message */
.rt-msg{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px 14px;box-shadow:var(--shadow);}
.rt-msg-ico{flex:none;width:48px;height:48px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-msg-body{flex:1;min-width:0;}
.rt-msg-t{font-size:14px;font-weight:900;margin-bottom:3px;line-height:1.3;}
.rt-msg-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-msg-btn{flex:none;display:flex;align-items:center;gap:2px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12px;font-weight:800;border-radius:10px;padding:10px 12px;cursor:pointer;text-decoration:none;}

/* footer */
.rt-footer{padding:22px 2px 8px;border-top:1px solid var(--line);margin-top:22px;}
.rt-footer-links{display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:12px;}
.rt-footer-links a{font-size:12px;font-weight:700;color:var(--ink-2);text-decoration:none;}
.rt-footer-links a:hover{color:var(--red);}
.rt-footer-note{font-size:11px;color:var(--ink-3);font-weight:600;line-height:1.6;margin-bottom:6px;}
.rt-footer-copy{font-size:10.5px;color:var(--ink-3);font-weight:600;}

/* bottom CTA（電話 / 予約 の2分割） */
.rt-cta2{display:grid;grid-template-columns:1fr 1fr;box-shadow:0 -3px 14px rgba(20,28,38,.08);}
.rt-cta2 a{display:flex;align-items:center;justify-content:center;gap:6px;padding:15px 8px;font-size:15px;font-weight:900;letter-spacing:.02em;text-decoration:none;}
.rt-cta2 a svg{flex:none;}
.rt-cta2-tel{background:#3A5876;color:#fff;}
.rt-cta2-tel:hover{background:#324c66;}
.rt-cta2-book{background:var(--red);color:#fff;}
.rt-cta2-book:hover{background:var(--red-deep);}
`;
