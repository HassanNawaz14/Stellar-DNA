const SEASON_COLORS = {
  winter: { border: '#5fb5d4', label: 'Winter' },
  spring: { border: '#5b8c5a', label: 'Spring' },
  summer: { border: '#c9a14a', label: 'Summer' },
  autumn: { border: '#e16a8d', label: 'Autumn' },
}

const SPECTRAL_CLASS_COLORS = {
  O: '#9bb0ff',
  B: '#aabfff',
  A: '#cad7ff',
  F: '#f8f7ff',
  G: '#fff4ea',
  K: '#ffd2a1',
  M: '#ffcc6f',
}

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

function dynamicForExampleStar(name) {
  if (!name || name === '—') return null
  return `a familiar light in your birth sky`
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
  const sc = SEASON_COLORS[data.season]
  const dcColor = SPECTRAL_CLASS_COLORS[data.dominant_class] || 'rgba(124, 155, 255, 0.5)'

  return (
    <div className="pc-section">
      <h2 className="pc-section-title">Birth Sky</h2>
      {birth && (
        <p className="pc-meta">{birth.birth_date} · {birth.birth_time} · {birth.location_name}</p>
      )}
      <div className="pc-grid">
        <PCStat
          label="Season"
          value={season}
          subtitle="the world you were born into"
          dynamic={dynamicForSeason(data.season)}
          color={sc?.border || 'rgba(124, 155, 255, 0.5)'}
        />
        <PCStat
          label="Hemisphere"
          value={hemisphere}
          subtitle="your side of the planet"
          dynamic={dynamicForHemisphere(data.hemisphere)}
          color="rgba(124, 155, 255, 0.5)"
        />
        <PCStat
          label="Dominant stellar class"
          value={`${data.dominant_class || '—'}-type`}
          subtitle="the star type that ruled your sky"
          dynamic={dynamicForDominantClass(data.dominant_class)}
          color={dcColor}
        />
        <PCStat
          label="Example star"
          value={data.dominant_star_example || '—'}
          subtitle="a star your sky had in common with"
          dynamic={dynamicForExampleStar(data.dominant_star_example)}
          color="rgba(124, 155, 255, 0.5)"
        />
        <PCStat
          label="Rarest element"
          value={data.rarest_element || '—'}
          subtitle="the rarest atom in your body"
          dynamic={dynamicForRarestElement(data.rarest_element)}
          color="rgba(124, 155, 255, 0.5)"
        />
        <PCStat
          label="Atom age (avg)"
          value={data.avg_atom_age_billion_years ? `${data.avg_atom_age_billion_years.toFixed(1)} billion years` : '—'}
          subtitle="how old your atoms are on average"
          dynamic={dynamicForAtomAge(data.avg_atom_age_billion_years)}
          color="rgba(124, 155, 255, 0.5)"
        />
        <PCStat
          label="Nucleosynthesis path"
          value={pathway}
          subtitle="how most of your atoms were forged"
          dynamic={dynamicForPathway(pathway)}
          color="rgba(124, 155, 255, 0.5)"
          wide
        />
      </div>
    </div>
  )
}

function PCStat({ label, value, subtitle, dynamic, color, wide }) {
  return (
    <div className={`pc-stat ${wide ? 'pc-stat-wide' : ''}`} style={{ '--pc-color': color }}>
      <span className="pc-stat-label">{label}</span>
      <span className="pc-stat-value">{value}</span>
      {subtitle && <span className="pc-stat-subtitle">{subtitle}</span>}
      {dynamic && <span className="pc-stat-dynamic">{dynamic}</span>}
    </div>
  )
}
