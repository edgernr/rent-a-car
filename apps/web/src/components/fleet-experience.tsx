'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Addon, Vehicle } from '@/lib/api';

const CATEGORY_KEY: Record<string, string> = {
  ECONOMY: 'economy',
  SEDAN: 'sedan',
  SUV: 'suv',
  SEVEN_SEATER: 'sevenSeater',
  ELECTRIC: 'electric',
};
const FILTERS = ['all', 'ECONOMY', 'SEDAN', 'SUV', 'SEVEN_SEATER', 'ELECTRIC'] as const;

export function FleetExperience({ vehicles, addons }: { vehicles: Vehicle[]; addons: Addon[] }) {
  const t = useTranslations();
  const [filter, setFilter] = useState<string>('all');
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState(5);
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [toast, setToast] = useState('');

  const catLabel = (cat: string) => t(`fleet.${CATEGORY_KEY[cat] ?? 'all'}`);
  const visible = filter === 'all' ? vehicles : vehicles.filter((v) => v.category === filter);
  const selected = vehicles.find((v) => v.id === selectedId) ?? null;
  const compared = compare.map((id) => vehicles.find((v) => v.id === id)!).filter(Boolean);

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));

  const openCar = (id: string) => {
    setSelectedId(id);
    setDays(5);
    setPicked([]);
    setConfirmed(false);
  };

  const addonSub = useMemo(
    () => addons.filter((a) => picked.includes(a.type)).reduce((s, a) => s + a.priceUsd * days, 0),
    [addons, picked, days],
  );
  const carSub = selected ? selected.dailyRateUsd * days : 0;

  const fireToast = () => {
    setConfirmed(true);
    setToast(t('drawer.done'));
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <>
      {/* filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${
                active ? 'border-gold bg-gold text-bg' : 'border-line bg-transparent text-cream'
              }`}
            >
              {f === 'all' ? t('fleet.all') : catLabel(f)}
            </button>
          );
        })}
      </div>

      {/* fleet grid */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((car) => {
          const inCmp = compare.includes(car.id);
          return (
            <article
              key={car.id}
              className={`flex flex-col overflow-hidden rounded-[16px] border bg-surf transition-colors ${
                inCmp ? 'border-gold' : 'border-line'
              }`}
            >
              <div className="srd-grid relative h-[152px] bg-[#143a44]">
                <div className="absolute inset-0 grid place-items-center">
                  <span className="h-[74px] w-[74px] rotate-45 rounded-[10px] border-[1.5px] border-cream/15" />
                </div>
                {car.popular && (
                  <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-bg">
                    {t('fleet.popular')}
                  </span>
                )}
              </div>
              <div className="p-[17px]">
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-display text-[18px] font-bold leading-tight">{car.name}</div>
                    <div className="mt-0.5 text-[12.5px] font-semibold text-teal">{catLabel(car.category)}</div>
                  </div>
                  <div className="whitespace-nowrap text-right">
                    <span className="font-display text-[22px] font-extrabold text-gold">${car.dailyRateUsd}</span>
                    <span className="text-[12px] text-muted"> {t('fleet.perDay')}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-3.5 text-[12.5px] text-muted">
                  <span>{car.seats} {t('fleet.seats')}</span>
                  <span className="text-line">·</span>
                  <span>{car.transmission === 'AUTOMATIC' ? t('fleet.automatic') : t('fleet.manual')}</span>
                  <span className="text-line">·</span>
                  <span>{car.bags} {t('fleet.bags')}</span>
                </div>
                <div className="mt-4 flex gap-2.5">
                  <button
                    onClick={() => openCar(car.id)}
                    className="flex-1 rounded-[10px] bg-cream py-2.5 text-[14px] font-bold text-bg"
                  >
                    {t('fleet.reserve')}
                  </button>
                  <button
                    onClick={() => toggleCompare(car.id)}
                    className={`whitespace-nowrap rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold ${
                      inCmp ? 'border-gold bg-gold/15 text-gold' : 'border-line text-muted'
                    }`}
                  >
                    {inCmp ? t('fleet.added') : t('fleet.compare')}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* compare bar */}
      {compare.length > 0 && !showCompare && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-lg">
          <div className="mx-auto flex max-w-[1220px] flex-wrap items-center gap-4 px-7 py-3.5">
            <span className="font-display text-[15px] font-bold">{t('compare.title')}</span>
            <div className="flex flex-wrap gap-2">
              {compared.map((c) => (
                <span key={c.id} className="flex items-center gap-2 rounded-full border border-line bg-surf px-3 py-1.5 text-[13px]">
                  {c.name}
                  <button onClick={() => toggleCompare(c.id)} className="text-muted">×</button>
                </span>
              ))}
            </div>
            <div className="ml-auto flex gap-2.5">
              <button onClick={() => setCompare([])} className="rounded-[10px] border border-line px-4 py-2.5 text-[14px] font-semibold text-muted">
                {t('compare.clear')}
              </button>
              <button onClick={() => setShowCompare(true)} className="rounded-[10px] bg-gold px-5 py-2.5 text-[14px] font-bold text-bg">
                {t('compare.view')} ({compare.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* compare modal */}
      {showCompare && (
        <div onClick={() => setShowCompare(false)} className="fixed inset-0 z-[60] grid place-items-center bg-[#06101280] p-6 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="max-h-[86vh] w-full max-w-[760px] overflow-auto rounded-[20px] border border-line bg-bg">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-bg px-6 py-5">
              <h3 className="font-display text-[22px] font-extrabold">{t('compare.title')}</h3>
              <button onClick={() => setShowCompare(false)} className="h-[34px] w-[34px] rounded-[9px] border border-line bg-surf">×</button>
            </div>
            <div className="px-6 py-2 pb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[12px] font-semibold uppercase text-muted">—</th>
                    {compared.map((c) => (
                      <th key={c.id} className="p-2 text-left font-display text-[16px] font-bold">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: t('compare.price'), val: (c: Vehicle) => `$${c.dailyRateUsd}` },
                    { label: t('compare.category'), val: (c: Vehicle) => catLabel(c.category) },
                    { label: t('compare.seats'), val: (c: Vehicle) => String(c.seats) },
                    { label: t('compare.transmission'), val: (c: Vehicle) => (c.transmission === 'AUTOMATIC' ? t('fleet.automatic') : t('fleet.manual')) },
                    { label: t('compare.bags'), val: (c: Vehicle) => String(c.bags) },
                  ].map((row) => (
                    <tr key={row.label} className="border-t border-line">
                      <td className="p-2 text-[13.5px] font-semibold text-muted">{row.label}</td>
                      {compared.map((c) => (
                        <td key={c.id} className="p-2 text-[15px] font-semibold">{row.val(c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* booking drawer */}
      {selected && (
        <div onClick={() => setSelectedId(null)} className="fixed inset-0 z-[70] bg-[#06101233] backdrop-blur-sm">
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-[min(440px,100%)] overflow-y-auto border-l border-line bg-bg"
          >
            <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-line bg-bg px-6 py-5">
              <span className="font-mono text-[12px] tracking-widest text-gold">{t('drawer.title')}</span>
              <button onClick={() => setSelectedId(null)} className="h-[34px] w-[34px] rounded-[9px] border border-line bg-surf">×</button>
            </div>

            {confirmed ? (
              <div className="px-7 py-12 text-center">
                <div className="mx-auto mb-6 grid h-16 w-16 rotate-45 place-items-center rounded-[14px] bg-teal">
                  <span className="-rotate-45 text-[30px] font-extrabold text-bg">✓</span>
                </div>
                <h3 className="font-display text-[24px] font-extrabold">{selected.name}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{t('drawer.done')}</p>
                <button onClick={() => setSelectedId(null)} className="mt-6 rounded-[11px] bg-gold px-7 py-3 text-[15px] font-bold text-bg">
                  {t('drawer.close')}
                </button>
              </div>
            ) : (
              <div className="px-6 py-5">
                <div className="flex items-center gap-3.5 rounded-[14px] border border-line bg-bg2 p-3.5">
                  <span className="grid h-[54px] w-[54px] place-items-center rounded-[11px] bg-[#143a44]">
                    <span className="h-[26px] w-[26px] rotate-45 border-[1.5px] border-cream/30" />
                  </span>
                  <div>
                    <div className="font-display text-[18px] font-bold">{selected.name}</div>
                    <div className="text-[13px] font-semibold text-teal">{catLabel(selected.category)} · ${selected.dailyRateUsd}{t('fleet.perDay')}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-muted">{t('drawer.days')}</div>
                  <div className="flex items-center gap-3.5">
                    <button onClick={() => setDays((d) => Math.max(1, d - 1))} className="h-[42px] w-[42px] rounded-[11px] border border-line bg-surf text-[22px]">−</button>
                    <span className="min-w-[2.4ch] text-center font-display text-[26px] font-extrabold">{days}</span>
                    <button onClick={() => setDays((d) => Math.min(60, d + 1))} className="h-[42px] w-[42px] rounded-[11px] border border-line bg-surf text-[22px]">+</button>
                    <span className="text-[14px] text-muted">{days === 1 ? t('drawer.day') : t('drawer.daysLabel')}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-muted">{t('drawer.addons')}</div>
                  <div className="flex flex-col gap-2">
                    {addons.map((a) => {
                      const on = picked.includes(a.type);
                      return (
                        <button
                          key={a.type}
                          onClick={() => setPicked((p) => (on ? p.filter((x) => x !== a.type) : [...p, a.type]))}
                          className={`flex items-center justify-between rounded-[11px] border px-3.5 py-3 text-left ${
                            on ? 'border-gold bg-gold/10' : 'border-line bg-bg2'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`grid h-[22px] w-[22px] place-items-center rounded-[6px] border-[1.5px] text-[14px] font-extrabold text-bg ${on ? 'border-gold bg-gold' : 'border-cream/30'}`}>
                              {on ? '✓' : ''}
                            </span>
                            <span className="text-[14.5px] font-semibold">{t(`addons.${a.type}`)}</span>
                          </span>
                          <span className="text-[14px] font-bold text-gold">${a.priceUsd}{t('fleet.perDay')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 border-t border-line pt-[18px]">
                  <div className="mb-2 flex justify-between text-[14.5px] text-muted"><span>{t('drawer.subtotal')}</span><span>${carSub}</span></div>
                  <div className="mb-3.5 flex justify-between text-[14.5px] text-muted"><span>{t('drawer.addonsSub')}</span><span>${addonSub}</span></div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[16px] font-bold">{t('drawer.total')}</span>
                    <span className="font-display text-[30px] font-extrabold text-gold">${carSub + addonSub}</span>
                  </div>
                  <button onClick={fireToast} className="mt-4 w-full rounded-[12px] bg-gold py-3.5 text-[16px] font-bold text-bg">
                    {t('drawer.confirm')}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* toast */}
      {toast && !selected && (
        <div className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-[12px] bg-teal px-5 py-3 text-[14px] font-bold text-bg shadow-2xl">
          {toast}
        </div>
      )}
    </>
  );
}
