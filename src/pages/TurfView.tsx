import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CircleSlash2, Loader2, Lock, Shield, Unlock } from "lucide-react";

const SLOT_TIMES = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
  "22:00 - 23:00",
  "23:00 - 00:00",
];

const normalizeSlotLabel = (slot: string) => slot.replace(/\s*[-\u2013\u2014]\s*/, " - ").trim();

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const safeJsonArray = (value: unknown): string[] => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed)
      ? parsed
          .map((item) => {
            if (typeof item === "string") return normalizeSlotLabel(item);
            if (item && typeof item === "object" && "slot" in item) {
              return normalizeSlotLabel(String((item as any).slot || ""));
            }
            return "";
          })
          .filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const safeOwnerBooked = (value: unknown): Array<{ slot: string; date: string; releaseAt: string }> => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        slot: normalizeSlotLabel(String(item?.slot || "")),
        date: String(item?.date || "").trim(),
        releaseAt: String(item?.releaseAt || "").trim(),
      }))
      .filter((item) => item.slot && item.date && item.releaseAt);
  } catch {
    return [];
  }
};

const safeSlotStates = (value: unknown): Array<{ slot: string; state: string; releaseAt?: string }> => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        slot: normalizeSlotLabel(String(item?.slot || "")),
        state: String(item?.state || "").toUpperCase(),
        releaseAt: item?.releaseAt ? String(item.releaseAt).trim() : undefined,
      }))
      .filter((item) => item.slot && ["OPEN", "BOOKED", "OWNER_BOOKED", "BLOCKED"].includes(item.state));
  } catch {
    return [];
  }
};

const money = (value: number | string | undefined) => {
  const num = Number(value || 0);
  return `₹${Number.isFinite(num) ? num.toLocaleString() : "0"}`;
};

export function TurfView() {
  const navigate = useNavigate();
  const { turfId } = useParams<{ turfId: string }>();

  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turf, setTurf] = useState<any>(null);
  const [availability, setAvailability] = useState<{
    activeSlots: string[];
    blockedSlots: string[];
    bookedSlots: string[];
    ownerBookedSlots: Array<{ slot: string; date: string; releaseAt: string }>;
    slotStates: Array<{ slot: string; state: string; releaseAt?: string }>;
  }>({
    activeSlots: [],
    blockedSlots: [],
    bookedSlots: [],
    ownerBookedSlots: [],
    slotStates: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!turfId) return;

      setLoading(true);
      setError(null);

      try {
        const [turfRes, availabilityRes] = await Promise.all([
          fetch(`http://localhost:5000/api/turfs/${turfId}`),
          fetch(`http://localhost:5000/api/turfs/${turfId}/availability?date=${selectedDate}`),
        ]);

        if (!turfRes.ok) {
          throw new Error("Failed to load turf");
        }

        const turfData = await turfRes.json();
        turfData.activeSlots = safeJsonArray(turfData.activeSlots);
        turfData.blockedSlots = safeJsonArray(turfData.blockedSlots);
        turfData.ownerBookedSlots = safeOwnerBooked(turfData.ownerBookedSlots);
        setTurf(turfData);

        if (availabilityRes.ok) {
          const av = await availabilityRes.json();
          setAvailability({
            activeSlots: safeJsonArray(av.activeSlots),
            blockedSlots: safeJsonArray(av.blockedSlots),
            bookedSlots: safeJsonArray(av.bookedSlots),
            ownerBookedSlots: safeOwnerBooked(av.ownerBookedSlots),
            slotStates: safeSlotStates(av.slotStates),
          });
        }
      } catch (e: any) {
        setError(e?.message || "Unable to load turf view");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [turfId, selectedDate]);

  const approvedSlots = availability.activeSlots.length > 0 ? availability.activeSlots : SLOT_TIMES;
  const slotStateMap = useMemo(
    () =>
      new Map(
        (availability.slotStates || [])
          .map((item) => ({
            slot: normalizeSlotLabel(item.slot),
            state: String(item.state || "").toUpperCase(),
            releaseAt: item.releaseAt,
          }))
          .filter((item) => item.slot)
          .map((item) => [item.slot, item] as const)
      ),
    [availability.slotStates]
  );

  const ownerBookedForDate = availability.ownerBookedSlots.filter((hold) => hold.date === selectedDate);
  const ownerBookedSet = new Set(ownerBookedForDate.map((hold) => normalizeSlotLabel(hold.slot)));
  const bookedCount = (availability.slotStates || []).filter((item) => String(item.state || "").toUpperCase() === "BOOKED").length;
  const blockedCount = (availability.slotStates || []).filter((item) => String(item.state || "").toUpperCase() === "BLOCKED").length;
  const openCount = approvedSlots.filter((slot) => {
    const normalized = normalizeSlotLabel(slot);
    const state = slotStateMap.get(normalized)?.state;
    return state !== "BLOCKED" && state !== "BOOKED" && state !== "OWNER_BOOKED";
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          type="button"
          onClick={() => navigate("/app/turfs")}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to turfs
        </button>

        <div className="bg-white rounded-[28px] shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-white/80 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-[0.18em] mb-4">
                <Shield className="w-3.5 h-3.5" />
                Read only
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                {turf?.name || "Turf slot viewer"}
              </h1>
              <p className="text-slate-500 mt-2 max-w-2xl">
                View the current booking state for each slot. This page is read only and does not allow edits.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  <CalendarDays className="w-4 h-4" />
                  {selectedDate}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {money(turf?.pricePerHour)}/hr
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[220px]">
              <Metric label="Open" value={String(openCount)} color="teal" />
              <Metric label="Owner booked" value={String(ownerBookedSet.size)} color="amber" />
              <Metric label="Booked" value={String(bookedCount)} color="slate" />
              <Metric label="Blocked" value={String(blockedCount)} color="rose" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-6">
          <div className="bg-white rounded-[28px] shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-white/80 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900">Approved slots</h2>
                <p className="text-sm text-slate-500">View the slot state for the selected date.</p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading slots...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-100 bg-rose-50 text-rose-700 p-4">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {approvedSlots.map((slot) => {
                  const normalized = normalizeSlotLabel(slot);
                  const slotState = slotStateMap.get(normalized)?.state;
                  const isBlocked = slotState === "BLOCKED";
                  const isBooked = slotState === "BOOKED";
                  const isOwnerBooked = ownerBookedSet.has(normalized);

                  return (
                    <button
                      key={normalized}
                      type="button"
                      disabled
                      className={`rounded-2xl border p-4 text-left transition-all cursor-default ${
                        isBooked
                          ? "bg-slate-900 border-slate-800 text-slate-400 line-through"
                          : isOwnerBooked
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : isBlocked
                              ? "bg-rose-50 border-rose-200 text-rose-700 line-through"
                              : "bg-teal-50/40 border-teal-100 text-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm">{normalized}</p>
                          <p className="mt-1 text-xs font-medium opacity-80">
                            {isBooked
                              ? "Sold to customer"
                              : isOwnerBooked
                                ? "Booked by owner"
                                : isBlocked
                                  ? "Blocked by owner"
                                  : "Available"}
                          </p>
                        </div>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isBooked
                            ? "bg-slate-800 text-slate-500"
                            : isOwnerBooked
                              ? "bg-amber-100 text-amber-700"
                              : isBlocked
                                ? "bg-rose-100 text-rose-600"
                                : "bg-white text-teal-600"
                        }`}>
                          {isBooked ? <CircleSlash2 className="w-4 h-4" /> : isOwnerBooked ? <Lock className="w-4 h-4" /> : isBlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="bg-white rounded-[28px] shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-white/80 p-6 sm:p-8 h-fit">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-4">Legend</h2>
            <div className="space-y-3 text-sm">
              <LegendRow label="Available" description="Customer can book this slot" colorClass="bg-teal-500" />
              <LegendRow label="Owner booked" description="Offline hold that auto-opens after the slot ends" colorClass="bg-amber-500" />
              <LegendRow label="Blocked" description="Owner has manually blocked this slot" colorClass="bg-rose-500" />
              <LegendRow label="Booked" description="Already sold to a customer" colorClass="bg-slate-900" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "teal" | "amber" | "slate" | "rose";
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className={`rounded-2xl border p-3 ${colors[color]}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-80">{label}</p>
      <p className="text-xl font-serif font-bold mt-1">{value}</p>
    </div>
  );
}

function LegendRow({
  label,
  description,
  colorClass,
}: {
  label: string;
  description: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 w-3 h-3 rounded-full ${colorClass}`} />
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-slate-500">{description}</p>
      </div>
    </div>
  );
}
