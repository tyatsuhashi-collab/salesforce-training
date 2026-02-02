"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase接続設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const questions = [
  { no: 1, text: "商談毎に8桁の固有番号を管理したい。この番号は入力するのではなく自動で発番されるようにしてください。", time: 15 },
  { no: 2, text: "商談の全額項目には税抜金額を入れるため、税込金額がわかるような項目が欲しい（税率は10%とする）。", time: 20 },
  { no: 3, text: "商談の完了予定日に日付を入れるときに過去の日付は入れられないようにしたい。", time: 30 },
  { no: 4, text: "取引先の年間売上に応じてランクABCを分類する項目が欲しい。 (5億円以上:A, 5億円未満:B, 1億円以下:C)", time: 30 },
  { no: 5, text: "取引先を登録する際、年間売上が重要であるため、入れないと作成できないようにしたい（いじわる問題：ページレイアウトで設定）。", time: 40 },
  { no: 6, text: "商談という名前が合わない。案件という名前に変更したい（タブと表示ラベルの名称変更）。", time: 15 },
  { no: 7, text: "現状取引先にはお客様と競合企業の情報が管理されているが、今後管理したい項目が分かれるため、取引先の中で「お客様」と「競合」でタイプを分けたい。", time: 15 },
  { no: 8, text: "競合情報のカスタムオブジェクト作成。項目：情報（リッチテキスト）、元記事（URL）、取引先での件数集計（主従関係）。", time: 30 },
  { no: 9, text: "競合情報に関連するファイルがある場合があるため、ページレイアウトにファイル関連リストを追加してください。", time: 15 },
  { no: 10, text: "営業ではない社員も使うため、社名を冠した「エンミッシュ」アプリを作成し、取引先、取引先責任者、案件、競合情報のタブを表示してください。", time: 20 },
  { no: 11, text: "失注理由の選択リスト連動設定。1段階目：競合負け/時期尚早・計画変更。2段階目：それぞれの詳細理由を選択できるようにしてください。", time: 20 },
];

export default function TrainingPage() {
  const [userName, setUserName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = () => {
    if (!userName.trim()) return alert("名前を入力してください");
    setIsStarted(true);
    setIsActive(true);
  };

  const handleNext = async () => {
    setIsActive(false);
    
    const { error } = await supabase.from("results").insert({
      user_name: userName,
      problem_no: currentQuestion.no,
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
        alert(`${userName}さん、全11問完了しました！お疲れ様でした。`);
      }
    }
  };

  // 1. 名前入力画面（まだ開始していない時）
  if (!isStarted) {
    return (
      <div style={{ maxWidth: "500px", margin: "100px auto", padding: "40px", border: "1px solid #eee", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", textAlign: "center", backgroundColor: "#fff", fontFamily: "sans-serif" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Salesforce構築検定</h2>
        <input 
          type="text" 
          placeholder="氏名を入力してください" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: "100%", padding: "15px", marginBottom: "20px", borderRadius: "8px", border: "2px solid #eee", fontSize: "1.1rem", boxSizing: "border-box" }}
        />
        <button onClick={handleStart} style={{ width: "100%", padding: "15px", background: "#0070f3", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }}>
          テストを開始する
        </button>
      </div>
    );
  }

  // 2. メインのテスト画面（開始した後に表示される）
  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "30px", fontFamily: "sans-serif", border: "1px solid #eee", borderRadius: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid #0070f3", marginBottom: "20px", paddingBottom: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#333" }}>問題 No.{currentQuestion.no}</h2>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>回答者: {userName}</div>
        </div>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: isActive ? "#2ecc71" : "#e74c3c", fontFamily: "monospace" }}>
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
        </div>
      </div>
      
      <div style={{ background: "#f8f9fa", padding: "25px", borderRadius: "10px", marginBottom: "30px", minHeight: "150px" }}>
        <p style={{ fontSize: "1.25rem", lineHeight: "1.6", color: "#444", margin: 0 }}>{currentQuestion.text}</p>
        <div style={{ marginTop: "15px", fontSize: "0.9rem", color: "#888" }}>目安時間: {currentQuestion.time}分</div>
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button onClick={() => setIsActive(!isActive)} style={{ flex: 1, padding: "15px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "bold" }}>
          {isActive ? "⏸ 一時停止" : "▶️ 再開"}
        </button>
        <button onClick={handleNext} style={{ flex: 2, padding: "15px", borderRadius: "8px", background: "#0070f3", color: "white", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }}>
          {currentIndex === questions.length - 1 ? "全ての課題を提出して終了" : "正解・次へ進む"}
        </button>
      </div>
    </div>
  );
}
