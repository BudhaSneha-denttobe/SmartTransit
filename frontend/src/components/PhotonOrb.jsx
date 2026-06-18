const photonThemes = {
  user: {
    label: 'U',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.95), rgba(6,95,212,0.95) 45%, rgba(0,112,244,1) 100%)',
    shadow: '0 0 30px rgba(56,189,248,0.35)',
  },
  admin: {
    label: 'A',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(251,191,36,0.95), rgba(249,115,22,0.95) 45%, rgba(234,88,12,1) 100%)',
    shadow: '0 0 30px rgba(249,115,22,0.35)',
  },
  compass: {
    label: 'C',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.95), rgba(59,130,246,0.95) 45%, rgba(37,99,235,1) 100%)',
    shadow: '0 0 28px rgba(59,130,246,0.28)',
  },
  mappin: {
    label: 'P',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(168,85,247,0.95), rgba(125,58,237,0.95) 45%, rgba(99,102,241,1) 100%)',
    shadow: '0 0 28px rgba(168,85,247,0.28)',
  },
  search: {
    label: 'S',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(74,222,128,0.95), rgba(34,197,94,0.95) 45%, rgba(16,185,129,1) 100%)',
    shadow: '0 0 28px rgba(34,197,94,0.28)',
  },
  cloudrain: {
    label: 'W',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.95), rgba(59,130,246,0.95) 45%, rgba(37,99,235,1) 100%)',
    shadow: '0 0 28px rgba(14,165,233,0.28)',
  },
  sparkles: {
    label: 'A',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(250,204,21,0.95), rgba(245,158,11,0.95) 45%, rgba(234,88,12,1) 100%)',
    shadow: '0 0 28px rgba(245,158,11,0.28)',
  },
  alert: {
    label: '!',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(251,113,133,0.95), rgba(244,63,94,0.95) 45%, rgba(225,29,72,1) 100%)',
    shadow: '0 0 28px rgba(244,63,94,0.28)',
  },
  routes: {
    label: 'R',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(34,197,94,0.95), rgba(16,185,129,0.95) 45%, rgba(5,150,105,1) 100%)',
    shadow: '0 0 28px rgba(16,185,129,0.28)',
  },
  stops: {
    label: 'S',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(168,85,247,0.95), rgba(129,140,248,0.95) 45%, rgba(99,102,241,1) 100%)',
    shadow: '0 0 28px rgba(129,140,248,0.28)',
  },
  users: {
    label: 'U',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.95), rgba(34,197,94,0.95) 45%, rgba(16,185,129,1) 100%)',
    shadow: '0 0 28px rgba(34,197,94,0.28)',
  },
  trips: {
    label: 'T',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(249,115,22,0.95), rgba(234,88,12,0.95) 45%, rgba(194,65,12,1) 100%)',
    shadow: '0 0 28px rgba(249,115,22,0.28)',
  },
  buses: {
    label: 'B',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.95), rgba(6,95,212,0.95) 45%, rgba(3,105,161,1) 100%)',
    shadow: '0 0 28px rgba(14,165,233,0.28)',
  },
  shapes: {
    label: 'M',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(236,72,153,0.95), rgba(219,39,119,0.95) 45%, rgba(190,24,93,1) 100%)',
    shadow: '0 0 28px rgba(219,39,119,0.28)',
  },
  default: {
    label: '?',
    gradient: 'radial-gradient(circle at 20% 20%, rgba(148,163,184,0.95), rgba(107,114,128,0.95) 45%, rgba(55,65,81,1) 100%)',
    shadow: '0 0 24px rgba(55,65,81,0.25)',
  },
};

export default function PhotonOrb({ type = 'default', size = 56, label, className = '' }) {
  const theme = photonThemes[type] || photonThemes.default;

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: theme.gradient,
        boxShadow: theme.shadow,
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9), transparent 35%)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-25 blur-sm"
        style={{
          background: 'radial-gradient(circle at 75% 75%, rgba(255,255,255,0.55), transparent 30%)',
        }}
      />
      <span className="relative z-10 flex items-center justify-center h-full w-full text-white font-semibold text-sm tracking-tight">
        {label ?? theme.label}
      </span>
    </div>
  );
}
