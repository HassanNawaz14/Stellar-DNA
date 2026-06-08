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

const CURIOSITY_STYLES = {
  deep: { color: '#e8c547', border: 'rgba(232, 197, 71, 0.35)', bg: 'rgba(232, 197, 71, 0.08)' },
  structural: { color: '#5fb5d4', border: 'rgba(95, 181, 212, 0.35)', bg: 'rgba(95, 181, 212, 0.08)' },
  expansive: { color: '#5b8c5a', border: 'rgba(91, 140, 90, 0.35)', bg: 'rgba(91, 140, 90, 0.08)' },
  elemental: { color: '#e16a8d', border: 'rgba(225, 106, 141, 0.35)', bg: 'rgba(225, 106, 141, 0.08)' },
}

function hintFor(value, map) {
  if (value < 34) return map[0]
  if (value < 67) return map[50]
  return map[100]
}

function formatNarrative(text) {
  if (!text) return null
  if (text.startsWith('Note:')) {
    return <em className="tp-note">{text}</em>
  }
  return text
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
    <div className="tp-container">
      {/* ── Archetype ── */}
      {archetype_name && (
        <div className="tp-archetype">
          <span className="tp-archetype-label">Your archetype</span>
          <h2 className="tp-archetype-name">{archetype_name}</h2>
        </div>
      )}

      {/* ── Scores grid ── */}
      <div className="tp-scores">
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

      {/* ── Curiosity type ── */}
      {curiosity_type && (
        <div className="tp-curiosity">
          <span className="tp-curiosity-label">Curiosity type</span>
          <span
            className="tp-curiosity-pill"
            style={CURIOSITY_STYLES[curiosity_type.toLowerCase()] || CURIOSITY_STYLES.expansive}
          >
            {curiosity_type}
          </span>
        </div>
      )}

      {/* ── Stellar Portrait ── */}
      {(narrative_p1 || narrative_p2 || narrative_p3) && (
        <div className="tp-portrait">
          <h3 className="tp-portrait-title">Your stellar portrait</h3>
          {narrative_p1 && <p>{formatNarrative(narrative_p1)}</p>}
          {narrative_p2 && <p>{formatNarrative(narrative_p2)}</p>}
          {narrative_p3 && <p>{formatNarrative(narrative_p3)}</p>}
        </div>
      )}
    </div>
  )
}
