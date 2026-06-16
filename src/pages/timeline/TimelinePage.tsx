import { useState } from "react";
import { Client } from "../../types";
import { useTimeline } from "../../hooks/useTimeline";
import { TimelineHeader } from "./components/TimelineHeader";
import { TimelineEmptyState } from "./components/TimelineEmptyState";
import { TimelineItem } from "./components/TimelineItem";

interface TimelinePageProps {
  cliente: Client;
  onBack: () => void;
}

export function TimelinePage({ cliente, onBack }: TimelinePageProps) {
  const { loading, timeline } = useTimeline(cliente);
  const [filter, setFilter] = useState("");

  const filteredItems = timeline.filter(item => {
    const search = filter.toLowerCase();
    const type = (item.type || "").toLowerCase();
    const name = (item.customName || "").toLowerCase();
    const year = String(item.displayYear);
    return type.includes(search) || name.includes(search) || year.includes(search);
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <TimelineHeader filter={filter} setFilter={setFilter} onBack={onBack} />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
        {loading || filteredItems.length === 0 ? (
          <TimelineEmptyState loading={loading} />
        ) : (
          <div className="max-w-4xl mx-auto relative pb-20">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-slate-300 to-transparent -translate-x-1/2"></div>

              {filteredItems.map((item, idx) => (
                <TimelineItem key={item.id} item={item} idx={idx} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}