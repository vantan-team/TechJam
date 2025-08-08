"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles
} from "lucide-react";
import { getUserAuthStatus } from "@/requests/user";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/user";
import { useRouter, usePathname } from "next/navigation";


export default function Home() {
    const [user, setUser] = useAtom(userAtom);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      async function checkAuth() {
        try {
          const userStatus = await getUserAuthStatus();
          if (userStatus?.isLoggedIn) {
            setUser(userStatus.user);
            router.push('/home');
          }
        } catch (error) {
          console.error("認証チェックエラー:", error);
        }
      }
      checkAuth();
    }, [router, setUser, pathname]);
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 items-stretch overflow-hidden">
        {/* Decorative background */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-gray-100"
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[480px] h-[480px] md:w-[900px] md:h-[900px] rounded-full bg-[#A90017]/5 blur-3xl" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          {/* Text block */}
          <div className="space-y-7 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#A90017]/10 px-3 py-1 text-xs sm:text-sm font-medium text-[#A90017] w-fit">
              <Sparkles className="w-4 h-4" />
              新しい美食体験の記録へ
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              My Michelin
              <span className="block text-foreground text-base sm:text-lg md:text-xl font-medium mt-3 sm:mt-4">
                心に刻まれた至極の体験を、世界に
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              あなたが訪れたお店、残したい味、共有したいガイド。
              My Michelinは、美食との出会いと記録をシンプルに、そして美しく支援します。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Button
                asChild
                className="text-white font-semibold shadow-md hover:shadow-lg transition-all h-11 sm:h-12 text-sm sm:text-base"
                style={{ backgroundColor: "#A90017", borderColor: "#A90017" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#940014";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#A90017";
                }}
              >
                <Link href="/sign-up">無料で始める</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-semibold h-11 sm:h-12 text-sm sm:text-base"
              >
                <Link href="/login">ログイン</Link>
              </Button>
            </div>

            <p className="text-[10px] sm:text-xs text-muted-foreground">
              サインアップは1分。いつでも退会できます。
            </p>
          </div>
          </div>
      </section>


      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-muted-foreground">
          <p className="tracking-tight">&copy; {new Date().getFullYear()} My Michelin</p>
          <div className="flex items-center gap-5 sm:gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">
              ログイン
            </Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">
              新規登録
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
