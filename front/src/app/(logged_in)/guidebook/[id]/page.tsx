"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Calendar, User } from "lucide-react";
import { Playfair_Display, Noto_Serif_JP } from "next/font/google";

// フォントはモジュールスコープで呼び出す必要がある
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"] });
const notoSerif = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "600", "700"] });

type Shop = {
    id: number;
    name: string;
    address: string;
    category: string;
  };

type Content = {
  id: number;
  star: 1 | 2 | 3;
  comment: string;
  shop: Shop;
  created_at: string;
  image_url?: string;
};

type Guidebook = {
  id: number;
  title: string;
  image_url?: string | null;
  geo?: string | null;
  genre?: string | null;
  contents_count: number;
  author?: { id: number; name: string };
  created_at: string;
};

type Page = {
  key: string;
  type: "cover" | "toc" | "star" | "restaurant";
  star?: 1 | 2 | 3;
  data?: Content;
};

export default function GuidebookFlipPage() {
  const router = useRouter();
  const params = useParams();
  const guidebookId = params?.id as string;

  const BRAND = "#A90017" as const; // 深い赤（アクセント）
  const PAPER = "#FFF9F2" as const; // クリーム色の紙（やや温かみ）

  const [loading, setLoading] = useState(true);
  const [guidebook, setGuidebook] = useState<Guidebook | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isProgrammaticScroll = useRef<boolean>(false);
  const programmaticTimerRef = useRef<number | null>(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [gbRes, ctRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/guidebooks/${guidebookId}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/guidebooks/${guidebookId}/contents`, { headers }),
        ]);

        if (!gbRes.ok) throw new Error("ガイドブック取得に失敗しました");
        if (!ctRes.ok) throw new Error("コンテンツ取得に失敗しました");

        const gbJson = await gbRes.json();
        const ctJson = await ctRes.json();
        console.log('API Response - Guidebook:', gbJson.guidebook);
        console.log('API Response - Contents:', ctJson.contents);
        setGuidebook(gbJson.guidebook);
        setContents(ctJson.contents ?? []);
      } catch (e) {
        console.error(e);
    } finally {
      setLoading(false);
    }
  };

    if (guidebookId) fetchData();
  }, [guidebookId]);

  const grouped = useMemo(() => {
    return {
      3: contents.filter((c) => c.star === 3),
      2: contents.filter((c) => c.star === 2),
      1: contents.filter((c) => c.star === 1),
    } as Record<1 | 2 | 3, Content[]>;
  }, [contents]);

  const pages = useMemo<Page[]>(() => {
    const p: Page[] = [];
    p.push({ key: "toc", type: "toc" });
    ([3, 2, 1] as const).forEach((star) => {
      grouped[star].forEach((c) => {
        p.push({ key: `r-${c.id}`, type: "restaurant", star, data: c });
      });
    });
    return p;
  }, [grouped]);

  const total = pages.length;

  // 横スクロール制御
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[current] as HTMLElement | undefined;
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [current]);

  // 実画面高（px）を安定取得（iOSアドレスバー対策）
  useEffect(() => {
    const measure = () => {
      const vv = typeof window !== "undefined" && (window.visualViewport?.height || window.innerHeight);
      if (vv) {
        document.documentElement.style.setProperty("--app-vh", `${Math.round(vv)}px`);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  const onScroll = () => {
    if (isProgrammaticScroll.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width || 1;
    const idx = Math.round(el.scrollLeft / w);
    if (idx !== current) setCurrent(Math.max(0, Math.min(total - 1, idx)));
  };

  const turnLeft = () => setCurrent((c) => Math.max(0, c - 1));
  const turnRight = () => setCurrent((c) => Math.min(total - 1, c + 1));

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const key = pages[index]?.key;
    if (programmaticTimerRef.current) {
      window.clearTimeout(programmaticTimerRef.current);
      programmaticTimerRef.current = null;
    }
    isProgrammaticScroll.current = true;
    // 可能なら対象のページ要素へスクロール（スナップと相性が良い）
    if (key) {
      const target = pageRefs.current[key];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        programmaticTimerRef.current = window.setTimeout(() => {
          isProgrammaticScroll.current = false;
          setCurrent(Math.max(0, Math.min(total - 1, index)));
        }, 500);
        return;
      }
    }
    // フォールバック: コンテナ幅で位置指定
    const w = el.getBoundingClientRect().width || 0;
    el.scrollTo({ left: index * w, behavior: "smooth" });
    programmaticTimerRef.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
      setCurrent(Math.max(0, Math.min(total - 1, index)));
    }, 500);
  };

  const scrollToPageKey = (key: string) => {
    const idx = pages.findIndex((p) => p.key === key);
    if (idx >= 0) scrollToIndex(idx);
  };

  const isTOC = current === 0;

  const goToProfile = () => {
    const authorId = guidebook?.author?.id;
    if (authorId) {
      router.push(`/user/${authorId}`);
    } else {
      router.back();
    }
  };

  // 表示用 日付フォーマッタ（APIの "YYYY-MM-DD" / "YYYY-MM-DD hh:mm:ss" などを想定）
  const formatYearMonth = (dateString?: string): string => {
    if (!dateString) return "";
    const m = dateString.match(/(\d{4})-(\d{1,2})/);
    if (m) return `${parseInt(m[1], 10)}年${parseInt(m[2], 10)}月`;
    const d = new Date(dateString);
    if (!Number.isNaN(d.getTime())) return `${d.getFullYear()}年${d.getMonth() + 1}月`;
    return dateString;
  };

  const formatYmd = (dateString?: string): string => {
    if (!dateString) return "";
    const m = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${parseInt(m[1], 10)}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
    const d = new Date(dateString);
    if (!Number.isNaN(d.getTime())) return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return dateString;
  };

  const renderPage = (page: Page) => {
    switch (page.type) {
      case "cover":
        return (
          <div className="h-full w-full bg-white flex flex-col">
            <div className="px-6 pt-9 pb-6 flex-1 flex flex-col justify-center">
              <h2 className={`${playfair.className} text-[22px] tracking-[.08em] text-center text-[#1A1A1A]`}>
                  {guidebook?.title}
              </h2>
              <div className="mx-auto mt-3 h-0.5 w-18" style={{ backgroundColor: BRAND }} />
              <div className="mt-3 flex items-center justify-center gap-2 text-neutral-600">
                <User className="h-4 w-4" />
                <span className={`${notoSerif.className} text-sm`}>{guidebook?.author?.name}</span>
              </div>
                </div>
            <div className="px-6 py-4 flex items-center justify-between text-[12px] text-neutral-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                    {guidebook?.created_at}
              </div>
              <div className={`${playfair.className}`}>Guide</div>
            </div>
                </div>
        );
      case "toc":
        

        return (
          <div className={`${notoSerif.className} h-full w-full p-6 bg-white`} style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 64px)" }}>
            {/* ヘッダー（左寄せ・ミニマル） */}
            <div className="mb-6">
              <div className="text-[11px] tracking-wide text-neutral-400">目次</div>
              <h1 className={`${notoSerif.className} mt-1 text-[21px] font-semibold text-[#2c1810]`}>
                {guidebook?.title}
              </h1>
              <div className="mt-2 text-[12px] text-[#8b7355] flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{guidebook?.author?.name}</span>
                <span className="text-neutral-300">・</span>
                <Calendar className="h-3 w-3" />
                <span>{formatYmd(guidebook?.created_at)}</span>
                <span className="text-neutral-300">・</span>
                <span>{contents.length}軒</span>
              </div>
              <div className="mt-3 h-px w-12 bg-neutral-200" />
            </div>
            
            <div className="space-y-8">
              {contents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-neutral-400 mb-2">—</div>
                  <div className="text-sm text-neutral-500 mb-1">まだレストランが追加されていません</div>
                  <div className="text-xs text-neutral-400">素敵なお店を追加してガイドブックを完成させましょう</div>
                </div>
              ) : (
                ([3, 2, 1] as const).map((star) => {
                  if (grouped[star].length === 0) return null;
                    return (
                      <div key={star}>
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className={`${notoSerif.className} text-[17px] font-semibold text-[#2c1810]`}>
                          {star === 3 ? '三つ星' : star === 2 ? '二つ星' : '一つ星'}
                        </h3>
                        <div className="text-[12px] text-neutral-400">
                          {grouped[star].length}店舗
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {grouped[star].map((c) => {
                          return (
                            <div 
                              key={c.id} 
                              role="button"
                              className="cursor-pointer group border-l-2 pl-4 py-3 pr-6 relative transition-all duration-200 hover:pl-5 hover:bg-neutral-50"
                              style={{ borderColor: BRAND }}
                              onClick={() => scrollToPageKey(`r-${c.id}`)}
                            >
                              <div className="flex items-center justify-start mb-1">
                                <div className="text-[15px] text-neutral-900 group-hover:text-[#1A1A1A] font-medium transition-colors">
                                  {c.shop.name}
                                </div>
                              </div>
                              <div className="text-[12px] text-neutral-500 flex items-center gap-2">
                                <span className="truncate">{c.shop.address}</span>
                              </div>
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-300 group-hover:text-[#A90017] transition-colors pointer-events-none">
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                      </div>
                    );
                  })}
                </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      case "star":
        return (
          <div className="h-full w-full p-6 flex items-center justify-center">
            <div className="text-center">
              <div className={`${playfair.className} text-[22px] tracking-[.14em] text-[#1A1A1A] mb-1`}>
                {page.star === 3 ? "三つ星" : page.star === 2 ? "二つ星" : "一つ星"}
              </div>
              <div className="text-[12px] text-neutral-600">{grouped[page.star!].length} 件</div>
            </div>
          </div>
        );
      case "restaurant":
        const restaurantData = page.data!;
        console.log('Restaurant Data:', restaurantData);
        console.log('Restaurant Image URL:', restaurantData.image_url);
          

        
        return (
          <div className="h-full w-full flex flex-col bg-white">
            {/* 上段 画像エリア */}
            <div className="relative w-full" style={{ height: "42%" }}>
              {/* レストラン固有の画像または代替画像 */}
               {restaurantData.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={restaurantData.image_url} alt={restaurantData.shop.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : guidebook?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={guidebook.image_url} alt={restaurantData.shop.name} className="absolute inset-0 h-full w-full object-cover opacity-80" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="text-center">
                    <div className={`${playfair.className} text-2xl tracking-[.2em] mb-2 text-neutral-600`}>
                      {restaurantData.star === 3 ? '★★★' : restaurantData.star === 2 ? '★★' : '★'}
                    </div>
                    <span className="text-xs text-neutral-500">
                      {restaurantData.shop.category}
                      </span>
                  </div>
                </div>
              )}
            </div>

            {/* 下段 情報エリア */}
            <div className="flex-1 p-8">
              {/* ヘッダー情報 */}
              <div className="border-b border-neutral-100 pb-6 mb-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: restaurantData.star }, (_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                      </div>
                    <div className="text-[11px] text-neutral-400">
                      {formatYmd(restaurantData.created_at)}
                    </div>
                  </div>
                  <h2 className={`${playfair.className} text-[22px] tracking-[.02em] text-[#1A1A1A] font-bold leading-tight`}>
                    {restaurantData.shop.name}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4 text-[12px] text-neutral-600 mb-3">
                  <span className="inline-flex items-center gap-1.5 flex-1 min-w-0">
                    <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: BRAND }} />
                    <span>{restaurantData.shop.address}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-[11px] text-neutral-600">
                  <span 
                    className="px-3 py-1 rounded-full text-[10px] font-medium text-white whitespace-nowrap"
                    style={{ backgroundColor: BRAND }}
                  >
                    {restaurantData.shop.category}
                  </span>
                </div>
              </div>

              {/* コメント */}
              {restaurantData.comment ? (
                <div>
                  <div className="text-[11px] mb-2 text-neutral-500">メモ</div>
                  <p className={`${notoSerif.className} text-[14px] leading-relaxed text-neutral-800`}>
                    {restaurantData.comment}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400">
                  <div className="text-neutral-300 mb-2">—</div>
                  <p className="text-[11px]">メモはまだありません</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f7]">
        <div className="text-neutral-600">読み込み中...</div>
      </div>
    );
  }

  if (!guidebook) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PAPER }}>
        <div className="text-center">
          <p className="mb-4 text-neutral-700">ガイドブックが見つかりませんでした</p>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: BRAND }}>戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoSerif.className} min-h-screen`} style={{ backgroundColor: PAPER }}>
      {/* 余白をなくし、紙面が画面いっぱいになるように */}
      <main className="px-0 py-0">
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-none"
            style={{ height: `var(--app-vh, 100dvh)` }}
          >
            {pages.map((page) => (
              <div ref={(el) => { pageRefs.current[page.key] = el; }} key={page.key} className="h-full w-full flex-none snap-start bg-white flex">
                <div className="h-full w-full mx-auto max-w-[720px]">
                  {renderPage(page)}
                </div>
              </div>
            ))}
      </div>

          {/* フローティング戻るボタン（TOCと詳細でUI切替） */}
          {/* 上部オーバーレイ（max-wに揃えて配置） */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
            <div className="mx-auto max-w-[720px] px-6" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)" }}>
              {isTOC ? (
                <button
                  aria-label="プロフィールへ"
                  onClick={goToProfile}
                  className="pointer-events-auto inline-flex items-center gap-2 p-0 text-[#2c1810]"
                >
                  <ChevronLeft className="h-5 w-5" style={{ color: BRAND }} />
                  <span className={`${notoSerif.className} text-[12px]`}>プロフィールに戻る</span>
                </button>
              ) : (
                <button
                  aria-label="目次へ"
                  onClick={() => scrollToIndex(0)}
                  className="pointer-events-auto p-0"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-neutral-200 shadow-sm backdrop-blur-sm aspect-square">
                    <ChevronLeft className="h-5 w-5" style={{ color: BRAND }} />
                  </span>
                </button>
              )}
            </div>
          </div>
        
          {/* 左右タップでページ移動 */}
          <button aria-label="prev" onClick={turnLeft} className="absolute left-0 top-0 w-1/6" style={{ height: `var(--app-vh, 100dvh)` }} />
          <button aria-label="next" onClick={turnRight} className="absolute right-0 top-0 w-1/6" style={{ height: `var(--app-vh, 100dvh)` }} />

          {/* ページナンバー */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <span className={`${playfair.className} text-[10px] tracking-[.2em] text-neutral-400`}>
              {current + 1} / {total}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}