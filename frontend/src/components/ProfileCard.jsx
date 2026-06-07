const HEMISPHERE = {
  northern: 'Northern Hemisphere',
  southern: 'Southern Hemisphere',
}

const PATHWAY = {
  agb_winds: 'AGB stellar winds',
  type_ii_sn: 'Core-collapse supernova (Type II)',
  type_ia_sn: 'Thermonuclear supernova (Type Ia)',
  r_process: 'Neutron star merger (kilonova)',
  big_bang: 'Big Bang nucleosynthesis',
}

const SUBTITLES = {
  season: 'the world you were born into',
  hemisphere: 'your side of the planet',
  dominant_class: 'the star type that ruled your sky',
  example_star: 'a star your sky had in common with',
  rarest_element: 'the rarest atom in your body',
  atom_age: 'how old your atoms are on average',
  nucleosynthesis_path: 'how most of your atoms were forged',
}

function dynamicForSeason(season) {
  if (!season) return null
  return {
    winter: 'born when the world was still and the sky was clearest',
    spring: 'born when everything was just beginning',
    summer: 'born at the peak of light and energy',
    autumn: 'born as the world was slowing down and turning inward',
  }[season.toLowerCase()] || null
}

function dynamicForHemisphere(hemisphere) {
  if (!hemisphere) return null
  return {
    northern: 'you shared your sky with most of humanity',
    southern: 'you saw a sky most of the world never will',
  }[hemisphere.toLowerCase()] || null
}

function dynamicForDominantClass(cls) {
  if (!cls) return null
  return {
    O: 'your sky was ruled by the rarest, most violent stars alive',
    B: 'your sky was ruled by stars that burn bright and die young',
    A: 'your sky was ruled by stars at the peak of their beauty',
    F: 'your sky was ruled by stars slightly hotter and faster than our Sun',
    G: 'your sky was ruled by stars just like the one that made life possible',
    K: 'your sky was ruled by calm, ancient stars that outlive almost everything',
    M: 'your sky was ruled by the oldest, coolest stars in the universe',
  }[cls] || null
}

function dynamicForExampleStar(name, dominantClass) {
  if (!name || name === '—') return null
  if (!dominantClass || dominantClass === '—') return null
  return `one of the ${dominantClass}-type stars lighting your sky that night`
}

function dynamicForRarestElement(value) {
  if (!value || value === '—') return null
  if (value.startsWith('Gold')) return 'forged in two neutron stars colliding at half the speed of light'
  if (value.startsWith('Platinum')) return 'born from the most violent collision the universe produces'
  if (value.startsWith('Uranium')) return 'one of the heaviest atoms the universe has ever made'
  if (value.startsWith('Iron')) return 'the atom that marks the limit of what a star can fuse'
  return 'a rare remnant of a star that no longer exists'
}

function dynamicForAtomAge(ageGyr) {
  if (ageGyr == null) return null
  if (ageGyr < 4) return 'your atoms are relatively young — forged in a recent universe'
  if (ageGyr < 7) return 'your atoms are middle-aged, like the universe itself at its prime'
  if (ageGyr < 10) return 'your atoms are ancient — older than our Solar System'
  return 'your atoms are nearly as old as time itself'
}

function dynamicForPathway(pathway) {
  if (!pathway) return null
  if (pathway === 'AGB stellar winds') return 'gently carried across space on the dying breath of a giant star'
  if (pathway === 'Core-collapse supernova (Type II)') return 'violently scattered by a star that exploded in seconds'
  if (pathway === 'Thermonuclear supernova (Type Ia)') return 'born in a thermonuclear explosion that outshone an entire galaxy'
  if (pathway === 'Neutron star merger (kilonova)') return 'created in the rarest event the universe knows — two dead stars colliding'
  return null
}

export default function ProfileCard({ data, birth }) {
  if (!data) return null
  const season = data.season ? data.season[0].toUpperCase() + data.season.slice(1) : '—'
  const hemisphere = HEMISPHERE[data.hemisphere] || data.hemisphere
  const pathway = PATHWAY[data.nucleosynthesis_path] || data.nucleosynthesis_path
  return (
    <div className="profile-card">
      <h2 className="card-title">Birth Sky</h2>
      {birth && (
        <p className="profile-meta">
          {birth.birth_date} · {birth.birth_time} · {birth.location_name}
        </p>
      )}
      <div className="profile-grid">
        <Stat
          label="Season"
          value={season}
          subtitle={SUBTITLES.season}
          dynamic={dynamicForSeason(data.season)}
        />
        <Stat
          label="Hemisphere"
          value={hemisphere}
          subtitle={SUBTITLES.hemisphere}
          dynamic={dynamicForHemisphere(data.hemisphere)}
        />
        <Stat
          label="Dominant stellar class"
          value={`${data.dominant_class || '—'}-type`}
          subtitle={SUBTITLES.dominant_class}
          dynamic={dynamicForDominantClass(data.dominant_class)}
          accent
        />
        <Stat
          label="Example star"
          value={data.dominant_star_example || '—'}
          subtitle={SUBTITLES.example_star}
          dynamic={dynamicForExampleStar(data.dominant_star_example, data.dominant_class)}
        />
        <Stat
          label="Rarest element"
          value={data.rarest_element || '—'}
          subtitle={SUBTITLES.rarest_element}
          dynamic={dynamicForRarestElement(data.rarest_element)}
        />
        <Stat
          label="Atom age (avg)"
          value={
            data.avg_atom_age_billion_years
              ? `${data.avg_atom_age_billion_years.toFixed(1)} billion years`
              : '—'
          }
          subtitle={SUBTITLES.atom_age}
          dynamic={dynamicForAtomAge(data.avg_atom_age_billion_years)}
        />
        <Stat
          label="Nucleosynthesis path"
          value={pathway}
          subtitle={SUBTITLES.nucleosynthesis_path}
          dynamic={dynamicForPathway(pathway)}
          wide
        />
      </div>
    </div>
  )
}

function Stat({ label, value, subtitle, dynamic, accent, wide }) {
  return (
    <div className={`stat ${wide ? 'stat-wide' : ''} ${accent ? 'stat-accent' : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      {dynamic && <span className="stat-dynamic">{dynamic}</span>}
    </div>
  )
}
