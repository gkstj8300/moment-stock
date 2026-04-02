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
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <h1 className="text-center text-2xl font-bold text-gray-900">로그인</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-gray-200 px-4 py-2.5 text-base transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            placeholder="email@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-gray-200 px-4 py-2.5 text-base transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            placeholder="비밀번호 입력"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          로그인
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{" "}
        <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
