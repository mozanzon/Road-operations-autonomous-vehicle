import { ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ABOUT_CARDS = [
  {
    src: '/about-picture-1.png',
    title: 'Ministry of Defense',
    brief: 'Our sponsor',
    href: 'https://www.mod.gov.eg/modwebsite/Default.aspx',
  },
  {
    src: '/about-picture-2.png',
    title: 'Thebes Group',
    brief: 'Our sponsor',
    href: 'https://groupthebes.com/',
  },
  {
    src: '/about-picture-3.png',
    title: 'ASRT Egypt',
    brief: 'Our sponsor',
    href: 'https://www.facebook.com/ASRTEgypt/https://www.facebook.com/ASRTEgypt/',
  },
];

export function AboutTab() {
  const { isDark } = useTheme();
  const pageText = isDark ? 'text-slate-100' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-600';
  const card = isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white';

  return (
    <div className={`space-y-5 ${pageText}`}>
      <section>
        <h2 className="font-mono text-lg font-semibold">About Autonomous Vehicle for Road Operations</h2>
        <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>
          Autonomous Vehicle for Road Operations combines robot control, telemetry, camera inference, waypoint routing, and road-marking tools in one operator dashboard.
        </p>
      </section>

      <section>
        <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">Our Sponsors</h3>
        <p className={`mt-2 text-sm ${muted}`}>The organizations below are our sponsors.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {ABOUT_CARDS.map((item) => (
          <a
            key={item.src}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={`group flex flex-col items-center rounded-lg border p-4 text-center transition-colors hover:border-amber-500/60 ${card}`}
          >
            <div className="flex h-24 items-center justify-center overflow-hidden">
              <img
                src={item.src}
                alt={item.title}
                className="max-h-16 w-auto object-contain transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <div className={`flex items-center justify-center gap-2 text-sm font-semibold ${pageText}`}>
                {item.title}
                <ExternalLink className="h-4 w-4 text-amber-500" />
              </div>
              <p className={`mt-1 text-xs leading-5 ${muted}`}>{item.brief}</p>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
