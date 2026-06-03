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
        <Stat label="Season" value={season} />
        <Stat label="Hemisphere" value={hemisphere} />
        <Stat
          label="Dominant stellar class"
          value={`${data.dominant_class || '—'}-type`}
          accent
        />
        <Stat
          label="Example star"
          value={data.dominant_star_example || '—'}
        />
        <Stat
          label="Rarest element"
          value={data.rarest_element || '—'}
        />
        <Stat
          label="Atom age (avg)"
          value={
            data.avg_atom_age_billion_years
              ? `${data.avg_atom_age_billion_years.toFixed(1)} billion years`
              : '—'
          }
        />
        <Stat
          label="Nucleosynthesis path"
          value={pathway}
          wide
        />
      </div>
    </div>
  )
}

function Stat({ label, value, accent, wide }) {
  return (
    <div className={`stat ${wide ? 'stat-wide' : ''} ${accent ? 'stat-accent' : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}
