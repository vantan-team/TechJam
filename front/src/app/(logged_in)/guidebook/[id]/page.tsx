"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Calendar, User, Star, Utensils, Map } from "lucide-react";
import { Playfair_Display, Noto_Serif_JP } from "next/font/google";

// フォントはモジュールスコープで呼び出す必要がある
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const notoSerif = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

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

  const BRAND = "#A90017" as const; // ブランドカラー（アクセントのみ）

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
  // 目次用: 星の高い順→作成日の新しい順でフラット表示
  const sortedContents = useMemo(() => {
    return [...contents].sort((a, b) => {
      if (b.star !== a.star) return b.star - a.star;
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return tb - ta;
    });
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

  const goToMap = () => {
    if (!guidebook) return;
    
    // ガイドブック情報をURLパラメータとして渡してホームページに遷移
    const guidebookParams = new URLSearchParams({
      guidebook_id: guidebook.id.toString(),
      guidebook_title: guidebook.title,
      guidebook_geo: guidebook.geo || '',
      guidebook_author: guidebook.author?.name || '',
      from_guidebook: 'true'
    });
    router.push(`/home?${guidebookParams.toString()}`);
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
          <div className="h-full w-full bg-white p-6 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {guidebook?.title}
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                <User className="h-4 w-4" />
                <span className="text-sm">{guidebook?.author?.name}</span>
              </div>
              <div className="inline-flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#A90017]">{contents.length}</div>
                  <div className="text-xs text-gray-600">レストラン</div>
                </div>
                <div className="w-px h-8 bg-gray-300" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[3, 2, 1].map(star => grouped[star as 1 | 2 | 3].length > 0 && (
                      <div key={star} className="flex items-center gap-0.5">
                        {Array.from({ length: star }, (_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">評価</div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatYmd(guidebook?.created_at)}</span>
              </div>
            </div>
          </div>
        );
      case "toc":
        return (
          <div className="h-full w-full bg-white p-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 64px)" }}>
            {/* ヘッダー */}
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-900 mb-1">{guidebook?.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1"><User className="h-4 w-4" /><span>{guidebook?.author?.name}</span></div>
                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>{formatYmd(guidebook?.created_at)}</span></div>
                <span className="font-semibold text-[#A90017]">{contents.length}軒</span>
              </div>
            </div>
            {/* 目次（フラットリスト） */}
            {sortedContents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-1">まだレストランが追加されていません</p>
                <p className="text-xs text-gray-400">素敵なお店を追加してガイドブックを完成させましょう</p>
              </div>
            ) : (
              <div className="space-y-5 md:space-y-6">
                {sortedContents.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => scrollToPageKey(`r-${c.id}`)}
                    className="w-full text-left group p-4 md:p-5 rounded-xl bg-white border border-gray-200 hover:shadow-sm transition"
                    style={{ borderLeft: '3px solid #A90017' }}
                    aria-label={`${c.shop.name} を開く`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: c.star }, (_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <div className="text-base font-semibold text-gray-900 truncate group-hover:text-[#A90017]">
                        {c.shop.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate mt-0.5">
                        {c.shop.address}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case "star":
        return (
          <div className="h-full w-full p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: page.star! }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {page.star === 3 ? "三つ星" : page.star === 2 ? "二つ星" : "一つ星"}
              </div>
              <div className="text-sm text-gray-600">{grouped[page.star!].length} 件</div>
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
              {restaurantData.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={restaurantData.image_url} alt={restaurantData.shop.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : guidebook?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={guidebook.image_url} alt={restaurantData.shop.name} className="absolute inset-0 h-full w-full object-cover opacity-80" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {Array.from({ length: restaurantData.star }, (_, i) => (
                        <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {restaurantData.shop.category}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 下段 情報エリア */}
            <div className="flex-1 p-6 pt-12">
              {/* ヘッダー情報 */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: restaurantData.star }, (_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatYmd(restaurantData.created_at)}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {restaurantData.shop.name}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-[#A90017]" />
                    <span>{restaurantData.shop.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-[#A90017]">
                      {restaurantData.shop.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* コメント */}
              <div className="min-h-[120px] flex flex-col justify-center">
                {restaurantData.comment ? (
                  <div>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {restaurantData.comment}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-gray-400 mb-2">—</div>
                    <p className="text-sm">メモはまだありません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#A90017] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">ガイドブックを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!guidebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ガイドブックが見つかりませんでした</h3>
          <p className="text-gray-600 mb-4">指定されたガイドブックは存在しないか、削除されています。</p>
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-[#A90017] hover:bg-[#940014] text-white rounded-md font-medium transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="mx-auto max-w-[720px] px-4 flex justify-between items-start" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
              {/* 左側: 戻るボタン */}
              {isTOC ? (
                <button
                  aria-label="プロフィールへ"
                  onClick={goToProfile}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: BRAND }} />
                  <span className="font-medium">プロフィールへ</span>
                </button>
              ) : (
                <button
                  aria-label="目次へ"
                  onClick={() => scrollToIndex(0)}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: BRAND }} />
                  <span className="font-medium">目次</span>
                </button>
              )}

              {/* 右側: マップ表示ボタン（目次ページのみ表示） */}
              {isTOC && (
                <button
                  aria-label="マップで表示"
                  onClick={goToMap}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-white hover:border-[#A90017] hover:text-[#A90017] transition-colors"
                >
                  <Map className="h-4 w-4" style={{ color: BRAND }} />
                  <span className="font-medium">マップ表示</span>
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