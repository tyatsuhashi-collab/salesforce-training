"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("未挑戦"); // ステータス管理用

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = async () => {
    if (!userName.trim()) return alert("名前を入力してください");
    setIsLoading(true);
    const { data, error } = await supabase
      .from("results")
      .select("problem_no")
      .eq("user_name", userName)
      .order("problem_no", { ascending: false })
      .limit(1);

    if (error) {
      alert("エラーが発生しました: " + error.message);
      setIsLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const lastSolvedNo = data[0].problem_no;
      if (lastSolvedNo >= questions.length) {
        alert(`${userName}さんは、すでに全問完了しています！`);
        setIsLoading(false);
        return;
      }
      setCurrentIndex(lastSolvedNo); 
      alert(`${userName}さん、お帰りなさい！第${lastSolvedNo + 1}問目から再開します。`);
    }

    setIsStarted(true);
    setIsActive(true);
    setIsLoading(false);
  };

  const handleNext = async () => {
    setIsActive(false);
    
    // Supabaseへ保存（ステータス情報も含めたい場合はDB側の設定も必要ですが、まずはプログラム側で送ります）
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
        setStatus("未挑戦"); // 次の問題ではステータスを戻す
        setIsActive(true);
      } else {
        alert(`${userName}さん、全問完了です！お疲れ様でした。`);
      }
    }
  };

  // ★ 前の問題に戻る処理
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSeconds(0);
      setStatus("未挑戦");
      setIsActive(true);
    }
  };

  if (!isStarted) {
    return (
      <div style={{ maxWidth: "500px", margin: "100px auto", padding: "40px", border: "1px solid #eee", borderRadius: "15px", textAlign: "center", backgroundColor: "#fff", fontFamily: "sans-serif" }}>
        <h2 style={{ marginBottom: "20px" }}>Salesforce 構築検定</h2>
        <input 
          type="text" 
          placeholder="氏名を入力してください" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isLoading}
          style={{ width: "100%", padding: "15px", marginBottom: "20px", borderRadius: "8px", border: "2px solid #eee", fontSize: "1.1rem", boxSizing: "border-box" }}
        />
        <button onClick={handleStart} disabled={isLoading} style={{ width: "100%", padding: "15px", background: isLoading ? "#ccc" : "#0070f3", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }}>
          {isLoading ? "確認中..." : "テストを開始（または再開）"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "30px", fontFamily: "sans-serif", border: "1px solid #eee", borderRadius: "15px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid #0070f3", marginBottom: "20px", paddingBottom: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#333" }}>問題 No.{currentQuestion.no}</h2>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "5px" }}>回答者: {userName}</div>
        </div>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#444", fontFamily: "monospace" }}>
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
        </div>
      </div>
      
      <div style={{ background: "#f8f9fa", padding: "25px", borderRadius: "10px", marginBottom: "20px", minHeight: "120px" }}>
        <p style={{ fontSize: "1.2rem", lineHeight: "1.6", margin: 0, color: "#333" }}>{currentQuestion.text}</p>
      </div>

      {/* ステータス選択プルダウン */}
      <div style={{ marginBottom: "30px", padding: "15px", background: "#f0f7ff", borderRadius: "8px", display: "flex", alignItems: "center", gap: "15px" }}>
        <span style={{ fontWeight: "bold", color: "#0070f3" }}>現在のステータス:</span>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #0070f3", backgroundColor: "#fff", cursor: "pointer", fontSize: "1rem" }}
        >
          <option value="未挑戦">未挑戦</option>
          <option value="挑戦予定">挑戦予定</option>
          <option value="OK！">OK！</option>
          <option value="もう一度！">もう一度！</option>
          <option value="失敗">失敗</option>
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <button onClick={handleBack} disabled={currentIndex === 0} style={{ flex: 1, padding: "15px", borderRadius: "8px", border: "1px solid #ddd", background: currentIndex === 0 ? "#eee" : "#fff", cursor: currentIndex === 0 ? "default" : "pointer", color: "#666" }}>
          ← 前の問題へ
        </button>
        <button onClick={() => setIsActive(!isActive)} style={{ flex: 1, padding: "15px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
          {isActive ? "⏸ 一時停止" : "▶️ 再開"}
        </button>
        <button onClick={handleNext} style={{ flex: 2, padding: "15px", borderRadius: "8px", background: "#0070f3", color: "white", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }}>
          {currentIndex === questions.length - 1 ? "完了して提出" : "正解・次へ進む"}
        </button>
      </div>
    </div>
  );
}
