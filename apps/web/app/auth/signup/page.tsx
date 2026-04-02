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
    <div className="mx-auto max-w-md py-16">
      <div>
        <Link href="/" className="inline-block text-xl font-bold tracking-tight text-[#0a0a0a]">
          <span className="text-[#fa2454]">m</span>oment
          <span className="font-medium text-[#0a0a0a]/40">stock</span>
        </Link>
      </div>

      <div className="mt-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#fa2454]">
          Sign Up
        </span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0a0a0a]">회원가입</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <div>
          <label className="block text-sm font-bold text-[#0a0a0a]">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-3 w-full border-b-2 border-[#e4e4e7] bg-transparent pb-3 text-base text-[#0a0a0a] placeholder-[#a1a1aa] spring-transition focus:border-[#fa2454] focus:outline-none"
            placeholder="이메일"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0a0a0a]">비밀번호</label>
          <p className="mt-1.5 text-xs text-[#a1a1aa]">
            영문, 숫자를 포함한 6자 이상의 비밀번호를 입력해주세요.
          </p>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-3 w-full border-b-2 border-[#e4e4e7] bg-transparent pb-3 text-base text-[#0a0a0a] placeholder-[#a1a1aa] spring-transition focus:border-[#fa2454] focus:outline-none"
            placeholder="비밀번호"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0a0a0a]">닉네임</label>
          <p className="mt-1.5 text-xs text-[#a1a1aa]">
            다른 유저와 겹치지 않도록 입력해주세요. (2~20자)
          </p>
          <input
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-3 w-full border-b-2 border-[#e4e4e7] bg-transparent pb-3 text-base text-[#0a0a0a] placeholder-[#a1a1aa] spring-transition focus:border-[#fa2454] focus:outline-none"
            placeholder="별명 (2~20자)"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-[#fde8ec] px-4 py-3 text-sm font-medium text-[#fa2454]" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full h-[56px] rounded-2xl text-base">
          회원가입하기
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[#a1a1aa]">
        이미 아이디가 있으신가요?{" "}
        <Link href="/auth/login" className="font-semibold text-[#0a0a0a] underline decoration-[#fa2454]/30 underline-offset-2 spring-transition hover:text-[#fa2454]">
          로그인
        </Link>
      </p>
    </div>
  );
}
