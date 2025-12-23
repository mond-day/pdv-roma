"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function NotificationsBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/notificacoes?status=abertas&pageSize=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setCount(data.total);
          }
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Atualizar a cada 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => router.push("/notificacoes")}
      className="relative p-2 text-gray-600 hover:text-gray-900"
    >
      <span className="text-2xl">🔔</span>
      {count > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

