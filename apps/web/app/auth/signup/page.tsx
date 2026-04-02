"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "../../_providers/supabase-provider";
import { Button } from "../../_components/atoms";

export default function SignupPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });

    if (authError) {
      setError("회원가입에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm font-bold text-gray-900">
          <span className="text-[#fa2454]">m</span>oment-stock
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-gray-300 pb-2 text-base text-gray-900 placeholder-gray-400 focus:border-[#fa2454] focus:outline-none transition-colors"
            placeholder="이메일"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900">비밀번호</label>
          <p className="mt-1 text-xs text-gray-500">
            영문, 숫자를 포함한 6자 이상의 비밀번호를 입력해주세요.
          </p>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-gray-300 pb-2 text-base text-gray-900 placeholder-gray-400 focus:border-[#fa2454] focus:outline-none transition-colors"
            placeholder="비밀번호"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900">닉네임</label>
          <p className="mt-1 text-xs text-gray-500">
            다른 유저와 겹치지 않도록 입력해주세요. (2~20자)
          </p>
          <input
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-2 w-full border-b border-gray-300 pb-2 text-base text-gray-900 placeholder-gray-400 focus:border-[#fa2454] focus:outline-none transition-colors"
            placeholder="별명 (2~20자)"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full h-[52px] rounded-lg text-base">
          회원가입하기
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 아이디가 있으신가요?{" "}
        <Link href="/auth/login" className="font-medium text-gray-900 underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
