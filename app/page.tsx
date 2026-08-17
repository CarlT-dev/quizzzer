"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [status, setStatus] = useState("Testing connection...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase
        .from("quizzes")
        .select("id")
        .limit(1);

      if (error) {
        console.error(error);
        setStatus("Database connection failed");
        return;
      }

      setStatus("Database connected successfully!");
    }

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">
        {status}
      </h1>
    </main>
  );
}