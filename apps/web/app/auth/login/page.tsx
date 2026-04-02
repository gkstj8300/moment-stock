"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "../../_providers/supabase-provider";
import { Button } from "../../_components/atoms";

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("이메일 또는 비밀번호가 올바르지 않아요.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center -mx-4 -my-8 px-4 py-16 sm:-mx-6 sm:px-6">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <Link href="/" className="inline-block text-3xl font-bold tracking-tight text-[#0a0a0a]">
            <span className="text-[#fa2454]">m</span>oment
            <span className="font-medium text-[#0a0a0a]/40">stock</span>
          </Link>
          <p className="mt-2 text-sm text-[#a1a1aa]">계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[56px] border-b border-black/[0.04] px-5 text-base text-[#0a0a0a] placeholder-[#a1a1aa] spring-transition focus:bg-[#fafafa] focus:outline-none"
              placeholder="이메일"
              autoComplete="email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[56px] px-5 text-base text-[#0a0a0a] placeholder-[#a1a1aa] spring-transition focus:bg-[#fafafa] focus:outline-none"
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-[#fde8ec] px-4 py-3 text-sm font-medium text-[#fa2454]" role="alert">
              {error}
            </div>
          )}

          <div className="mt-5">
            <Button type="submit" size="lg" loading={loading} className="w-full h-[56px] rounded-2xl text-base">
              로그인
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="#" className="text-[#a1a1aa] spring-transition hover:text-[#0a0a0a]">
            비밀번호 재설정
          </Link>
          <span className="text-[#e4e4e7]">|</span>
          <Link href="/auth/signup" className="font-medium text-[#0a0a0a] spring-transition hover:text-[#fa2454]">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
