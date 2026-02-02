"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const questions = [
  /* ...（11問のデータはそのまま）... */
];

export default function TrainingPage() {
  const [userName, setUserName] = useState(""); // 名前を保存する場所
  const [isStarted, setIsStarted] = useState(false); // スタートしたか
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // スタートボタンを押した時
  const handleStart = () => {
    if (!userName.trim()) return alert("名前を入力してください");
    setIsStarted(true);
    setIsActive(true);
  };

  const handleNext = async () => {
    setIsActive(false);
    // 保存するときに userName を使うように変更
    const { error } = await supabase.from("results").insert({
      user_name: userName, 
      problem_no: questions[currentIndex].no,
      time_spent_seconds: seconds,
    });

    if (error) {
      alert("保存エラー: " + error.message);
      setIsActive(true);
    } else {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSeconds(0);
        setIsActive(true);
      } else {
        alert(`${userName}さん、全問終了です！`);
      }
    }
  };

  // 最初に名前を入力する画面
  if (!isStarted) {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
        <h2>研修スタート</h2>
        <input 
          type="text" 
          placeholder="氏名を入力してください" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button onClick={handleStart} style={{ width: "100%", padding: "10px", background: "#0070f3", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
          テスト開始
        </button>
      </div>
    );
  }

  // 11問のテスト画面（以前の return 内容とほぼ同じ）
  return (
    <div style={{ /* ...以前のスタイル... */ }}>
      {/* ...省略... */}
      <div style={{ marginBottom: "10px", color: "#666" }}>回答者: {userName}</div>
      {/* ...以下、問題表示とボタン... */}
    </div>
  );
}
