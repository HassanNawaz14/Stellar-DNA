import ScoreBar from './ScoreBar.jsx'

const ENERGY_HINT = {
  0: 'Calm and sustained, like an M-dwarf burning for trillions of years.',
  50: 'Sun-like steady output, neither quiet nor explosive.',
  100: 'Explosive and concentrated, like an O-type star burning in mere millions of years.',
}

const PACE_HINT = {
  0: 'Marathon endurance — long, patient, drawn-out effort.',
  50: 'A blend of patience and urgency.',
  100: 'Sprint energy — short, urgent, intense bursts.',
}

const LEGACY_HINT = {
  0: 'Quiet, local impact — influence stays close to home.',
  50: 'Mid-range influence — felt across your community of work.',
  100: 'Explosive dispersal — influence spreads galaxy-wide.',
}

const TEMPORAL_HINT = {
  0: 'Present-anchored — focused on what is happening now.',
  50: 'Balanced between the immediate and the long arc.',
  100: 'Drawn to the long arc of time — legacy and deep history.',
}

function hintFor(value, map) {
  if (value < 34) return map[0]
  if (value < 67) return map[50]
  return map[100]
}

export default function TraitProfile({ data }) {
  if (!data) return null
  const {
    archetype_name,
    narrative_p1,
    narrative_p2,
    narrative_p3,
    energy_score,
    pace_score,
    legacy_score,
    curiosity_type,
    temporal_score,
  } = data

  return (
    <div className="trait-profile">
      <h2 className="card-title">Trait Profile</h2>

      {archetype_name && (
        <div className="archetype">
          <span className="archetype-label">Your archetype</span>
          <h3 className="archetype-name">{archetype_name}</h3>
        </div>
      )}

      <div className="score-grid">
        <ScoreBar
          label="Energy"
          value={energy_score}
          hint={hintFor(energy_score, ENERGY_HINT)}
        />
        <ScoreBar
          label="Pace"
          value={pace_score}
          hint={hintFor(pace_score, PACE_HINT)}
        />
        <ScoreBar
          label="Legacy"
          value={legacy_score}
          hint={hintFor(legacy_score, LEGACY_HINT)}
        />
        <ScoreBar
          label="Temporal orientation"
          value={temporal_score}
          hint={hintFor(temporal_score, TEMPORAL_HINT)}
        />
      </div>

      {curiosity_type && (
        <div className="curiosity">
          <span className="curiosity-label">Curiosity type</span>
          <span className={`curiosity-pill curiosity-${curiosity_type.toLowerCase()}`}>
            {curiosity_type}
          </span>
        </div>
      )}

      {(narrative_p1 || narrative_p2 || narrative_p3) && (
        <div className="narrative">
          <h3 className="narrative-title">Your stellar portrait</h3>
          {narrative_p1 && <p>{narrative_p1}</p>}
          {narrative_p2 && <p>{narrative_p2}</p>}
          {narrative_p3 && <p>{narrative_p3}</p>}
        </div>
      )}
    </div>
  )
}
