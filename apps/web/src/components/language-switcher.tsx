'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALES = ['en', 'ru', 'uz'] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex overflow-hidden rounded-full border border-line">
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            onClick={() => router.replace(pathname, { locale: code })}
            className={`px-3 py-[7px] text-[12.5px] font-bold tracking-wide ${
              active ? 'bg-gold text-bg' : 'bg-transparent text-muted'
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
