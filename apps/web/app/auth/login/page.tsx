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
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f8fa] -mx-4 -my-8 px-4 py-16 sm:-mx-6 sm:px-6">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          <span className="text-[#fa2454]">m</span>oment-stock
        </h1>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="overflow-hidden rounded-lg border border-[#f0f0f0] bg-white">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[52px] border-b border-[#f0f0f0] px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
              placeholder="이메일"
              autoComplete="email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[52px] px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

          <div className="mt-4">
            <Button type="submit" size="lg" loading={loading} className="w-full h-[52px] rounded-lg text-base">
              로그인
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <Link href="#" className="hover:text-gray-700">
            비밀번호 재설정
          </Link>
          <Link href="/auth/signup" className="hover:text-gray-700">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
