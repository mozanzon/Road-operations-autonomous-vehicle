import { ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ABOUT_CARDS = [
  {
    src: '/about-picture-1.png',
    title: 'RoboScan Field Unit',
    brief: 'Road inspection platform prepared for live detection, mapping, and autonomous route trials.',
    href: 'https://example.com/roboscan-field-unit',
  },
  {
    src: '/about-picture-2.png',
    title: 'Detection Workflow',
    brief: 'Camera and model workflow for pothole and crack counting during manual, semi, and fully autonomous modes.',
    href: 'https://example.com/roboscan-detection',
  },
  {
    src: '/about-picture-3.png',
    title: 'Control And Routing',
    brief: 'Operator interface for sensor telemetry, scripted movement, waypoint routing, and road painting control.',
    href: 'https://example.com/roboscan-control',
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
        <h2 className="font-mono text-lg font-semibold">About RoboScanV3</h2>
        <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>
          RoboScanV3 combines robot control, telemetry, camera inference, waypoint routing, and road-marking tools in one operator dashboard.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {ABOUT_CARDS.map((item) => (
          <a
            key={item.src}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={`group relative block overflow-hidden rounded-lg border ${card}`}
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-950">
              <img
                src={item.src}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                {item.title}
                <ExternalLink className="h-4 w-4" />
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-200">{item.brief}</p>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
