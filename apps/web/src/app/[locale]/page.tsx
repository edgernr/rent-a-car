import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AccountMenu } from '@/components/account-menu';
import { FleetExperience } from '@/components/fleet-experience';
import { getVehicles, getRoutes, getAddons, type Route } from '@/lib/api';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [vehicles, routes, addons] = await Promise.all([getVehicles(), getRoutes(), getAddons()]);

  const stats = [
    { num: '240+', label: t('stats.fleet') },
    { num: t('stats.free'), label: t('stats.airport') },
    { num: '18k+', label: t('stats.travelers') },
    { num: '4.9★', label: t('stats.rating') },
  ];
  const reviews = [
    { text: t('reviews.r1'), name: t('reviews.r1name'), meta: t('reviews.r1meta'), tint: '#1F7FBF' },
    { text: t('reviews.r2'), name: t('reviews.r2name'), meta: t('reviews.r2meta'), tint: '#2BB8AD' },
    { text: t('reviews.r3'), name: t('reviews.r3name'), meta: t('reviews.r3meta'), tint: '#E0A93B' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1220px] items-center gap-6 px-7 py-3.5">
          <a href="#top" className="flex items-center gap-3 text-cream">
            <span className="relative inline-block h-[26px] w-[26px] rotate-45 rounded-[5px] bg-gold">
              <span className="absolute inset-[6px] rounded-[2px] border-[1.5px] border-bg/60" />
            </span>
            <span className="font-display text-[18px] font-extrabold leading-none tracking-tight">
              SILK&nbsp;ROAD
              <br />
              <span className="text-[11px] font-bold tracking-[0.22em] text-gold">D&nbsp;R&nbsp;I&nbsp;V&nbsp;E</span>
            </span>
          </a>
          <nav className="ml-4 hidden gap-6 md:flex">
            <a href="#fleet" className="text-[14.5px] font-semibold text-muted">{t('nav.fleet')}</a>
            <a href="#routes" className="text-[14.5px] font-semibold text-muted">{t('nav.routes')}</a>
            <a href="#addons" className="text-[14.5px] font-semibold text-muted">{t('nav.addons')}</a>
            <a href="#reviews" className="text-[14.5px] font-semibold text-muted">{t('nav.reviews')}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <AccountMenu />
            <a href="#fleet" className="hidden rounded-full bg-gold px-[18px] py-2.5 text-[14px] font-bold text-bg sm:inline-block">{t('nav.book')}</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="mx-auto max-w-[1220px] px-7 pb-8 pt-14">
        <div className="grid items-center gap-11 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.12em] text-gold">
              <span className="inline-block h-[7px] w-[7px] rotate-45 bg-teal" />
              {t('hero.eyebrow')}
            </div>
            <h1 className="mb-5 font-display text-[clamp(40px,5.4vw,68px)] font-extrabold leading-[0.98] tracking-tight text-balance">
              {t('hero.title')}
            </h1>
            <p className="max-w-[30em] text-[18px] leading-relaxed text-muted text-pretty">{t('hero.sub')}</p>
          </div>
          <div className="srd-grid relative aspect-[4/3.2] overflow-hidden rounded-[18px] border border-line bg-[#123845]">
            <div className="absolute inset-0 grid place-items-center">
              <span className="h-[120px] w-[120px] rotate-45 rounded-[14px] border-[1.5px] border-cream/20" />
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-2.5 rounded-[12px] border border-line bg-bg/70 px-3.5 py-2.5 backdrop-blur">
              <span className="font-display text-[22px] font-extrabold text-gold">4.9</span>
              <span className="text-[12px] leading-tight text-muted">★★★★★<br />{t('hero.rating')}</span>
            </div>
          </div>
        </div>

        {/* SEARCH WIDGET */}
        <div className="mt-8 grid grid-cols-1 items-end gap-3 rounded-[18px] border border-line bg-gradient-to-b from-surf to-bg2 p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          {[
            { label: t('search.pickup'), val: 'Tashkent' },
            { label: t('search.drop'), val: 'Tashkent' },
            { label: t('search.dates'), val: t('search.datesVal') },
            { label: t('search.type'), val: t('fleet.all') },
          ].map((f, i) => (
            <label key={i} className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">{f.label}</span>
              <div className="rounded-[11px] border border-line bg-bg px-3.5 py-3 text-[15px] text-cream">{f.val}</div>
            </label>
          ))}
          <a href="#fleet" className="whitespace-nowrap rounded-[11px] bg-gold px-6 py-3.5 text-center text-[15px] font-bold text-bg">{t('search.submit')}</a>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-[1220px] px-7 pb-10 pt-2">
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-[14px] border border-line bg-bg2 p-5">
              <div className="font-display text-[34px] font-extrabold leading-none text-gold">{s.num}</div>
              <div className="mt-1.5 text-[14px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FLEET (interactive) */}
      <section id="fleet" className="mx-auto max-w-[1220px] scroll-mt-20 px-7 pb-8 pt-6">
        <h2 className="font-display text-[clamp(30px,3.6vw,44px)] font-extrabold leading-none tracking-tight">{t('fleet.title')}</h2>
        <p className="mb-6 mt-2.5 max-w-[40em] text-[16px] text-muted text-pretty">{t('fleet.sub')}</p>
        <FleetExperience vehicles={vehicles} addons={addons} />
      </section>

      {/* ROUTES */}
      <section id="routes" className="mt-8 scroll-mt-[70px] border-y border-line bg-bg2">
        <div className="mx-auto max-w-[1220px] px-7 py-14">
          <h2 className="font-display text-[clamp(30px,3.6vw,44px)] font-extrabold leading-none tracking-tight">{t('routes.title')}</h2>
          <p className="mt-2.5 max-w-[42em] text-[16px] text-muted text-pretty">{t('routes.sub')}</p>
          <div className="mt-7 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((r: Route) => (
              <div key={r.id} className="srd-grid relative flex min-h-[230px] flex-col justify-end overflow-hidden rounded-[16px] border border-line bg-[#143a44]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/85" />
                <div className="relative p-5">
                  <div className="font-display text-[25px] font-extrabold tracking-tight">{r.nameI18n[locale] ?? r.nameI18n.en}</div>
                  <div className="mt-1 text-[14px] text-cream/80">{r.taglineI18n[locale] ?? r.taglineI18n.en}</div>
                  <div className="mt-3.5 flex gap-4 font-mono text-[12px] text-teal">
                    <span>{r.km} km · {t('routes.fromTashkent')}</span>
                    <span className="text-gold">{r.durationHrs}h {t('routes.drive')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section id="addons" className="mx-auto max-w-[1220px] scroll-mt-[70px] px-7 py-14">
        <h2 className="font-display text-[clamp(30px,3.6vw,44px)] font-extrabold leading-none tracking-tight">{t('addons.title')}</h2>
        <p className="mt-2.5 max-w-[42em] text-[16px] text-muted text-pretty">{t('addons.sub')}</p>
        <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {addons.map((a) => (
            <div key={a.type} className="flex items-center justify-between gap-3.5 rounded-[14px] border border-line bg-bg2 p-5">
              <div className="flex items-center gap-3.5">
                <span className="inline-block h-[38px] w-[38px] shrink-0 rotate-45 rounded-[9px] border-[1.5px] border-teal" />
                <span className="text-[15.5px] font-semibold">{t(`addons.${a.type}`)}</span>
              </div>
              <span className="whitespace-nowrap font-display text-[18px] font-extrabold text-gold">${a.priceUsd}{t('fleet.perDay')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="scroll-mt-[70px] border-t border-line bg-bg2">
        <div className="mx-auto max-w-[1220px] px-7 py-14">
          <h2 className="font-display text-[clamp(30px,3.6vw,44px)] font-extrabold leading-none tracking-tight">{t('reviews.title')}</h2>
          <p className="mt-2.5 text-[16px] text-muted">{t('reviews.sub')}</p>
          <div className="mt-7 grid grid-cols-1 gap-[18px] md:grid-cols-3">
            {reviews.map((rv, i) => (
              <div key={i} className="rounded-[16px] border border-line bg-surf p-6">
                <div className="tracking-[2px] text-[15px] text-gold">★★★★★</div>
                <p className="mt-3.5 text-[15.5px] leading-relaxed text-pretty">“{rv.text}”</p>
                <div className="mt-[18px] flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full font-display font-bold text-cream" style={{ background: rv.tint }}>
                    {rv.name.charAt(0)}
                  </span>
                  <div>
                    <div className="text-[14.5px] font-bold">{rv.name}</div>
                    <div className="text-[12.5px] text-muted">{rv.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1220px] px-7 py-16">
        <div className="srd-grid relative overflow-hidden rounded-[22px] border border-line bg-gradient-to-br from-[#0f3a3f] to-[#143845] px-10 py-14 text-center">
          <div className="relative">
            <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(30px,4.2vw,50px)] font-extrabold leading-tight tracking-tight text-balance">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-[17px] text-cream/80">{t('cta.sub')}</p>
            <a href="#fleet" className="mt-6 inline-block rounded-full bg-gold px-9 py-4 text-[16px] font-bold text-bg">{t('cta.btn')}</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line bg-bg2">
        <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-between gap-5 px-7 py-9">
          <div className="flex items-center gap-3">
            <span className="inline-block h-[22px] w-[22px] rotate-45 rounded-[4px] bg-gold" />
            <span className="font-display text-[15px] font-extrabold tracking-wide">SILK ROAD DRIVE</span>
          </div>
          <div className="text-[13.5px] text-muted">{t('footer')}</div>
        </div>
      </footer>
    </div>
  );
}
