import { useState } from 'react'
import Header from '../components/Header.jsx'

/* ─── Helpers ─── */

function Section({ title, layman, children, defaultOpen, group }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const glow = group === 'part2' ? 'var(--accent-2)' : 'var(--accent)'
  return (
    <div className={`ab-section ${open ? 'is-open' : ''}`} style={{ '--ab-glow': glow }}>
      <button className="ab-section-trigger" onClick={() => setOpen(!open)}>
        <span className="ab-section-arrow">{open ? '▾' : '▸'}</span>
        <div className="ab-section-header-text">
          <span className="ab-section-title">{title}</span>
          {layman && <span className="ab-section-layman">{layman}</span>}
        </div>
      </button>
      {open && (
        <div className="ab-section-body">
          {layman && (
            <div className="ab-plain" style={{ '--ab-glow': glow }}>
              <span className="ab-plain-icon">⟡</span>
              <span>{layman}</span>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

function SubSection({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ab-sub ${open ? 'is-open' : ''}`}>
      <button className="ab-sub-trigger" onClick={() => setOpen(!open)}>
        <span className="ab-sub-arrow">{open ? '▾' : '▸'}</span>
        <span>{title}</span>
      </button>
      {open && <div className="ab-sub-body">{children}</div>}
    </div>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="ab-table-wrap">
      <table className="ab-table">
        <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function Code({ children }) {
  return <code className="ab-code">{children}</code>
}

function FileLabel({ children }) {
  return <span className="ab-file">{children}</span>
}

function Research({ children }) {
  return (
    <div className="ab-research">
      <span className="ab-research-icon">◈</span>
      <span>{children}</span>
    </div>
  )
}

function CalcBlock({ formula, result }) {
  return (
    <div className="ab-calc">
      <div className="ab-calc-formula">{formula}</div>
      {result != null && <div className="ab-calc-result">→ {result}</div>}
    </div>
  )
}

const FLOW_NODES = [
  { id: 's1', label: 'Inputs', group: 'part1' },
  { id: 's2', label: 'Season', group: 'part1' },
  { id: 's3', label: 'Sky', group: 'part1' },
  { id: 's4', label: 'Spectra', group: 'part1' },
  { id: 's5', label: 'Elements', group: 'part1' },
  { id: 's6', label: 'Pathway', group: 'part1' },
  { id: 's7', label: 'Extras', group: 'part1' },
  { id: 's8', label: 'Energy', group: 'part2' },
  { id: 's9', label: 'Pace', group: 'part2' },
  { id: 's10', label: 'Legacy', group: 'part2' },
  { id: 's11', label: 'Curiosity', group: 'part2' },
  { id: 's12', label: 'Temporal', group: 'part2' },
  { id: 's13', label: 'LLM', group: 'part2' },
  { id: 's14', label: 'Sources', group: 'part2' },
  { id: 's15', label: 'Schema', group: 'part2' },
]

const SECTION_LAYMAN = {
  s1: 'the five pieces of information you provide to start the whole process',
  s2: 'figuring out what time of year your sky belonged to',
  s3: 'finding every star that was physically above your horizon at your birth moment',
  s4: 'sorting those stars by type and measuring which kinds dominated your sky',
  s5: 'using published research to calculate which elements each star type contributed',
  s6: 'identifying the cosmic event that forged most of the atoms in your body',
  s7: 'bonus facts — your rarest atom, how old your atoms are, and what that means',
  s8: 'how intensely your stars burned, turned into a number',
  s9: 'whether your stellar makeup leans sprint or marathon',
  s10: 'how far the matter that built you tends to spread through the universe',
  s11: 'what shape your curiosity takes based on your elemental signature',
  s12: 'whether you feel more anchored to the present or drawn across deep time',
  s13: 'how an LLM turns all those numbers into a unique story about you',
  s14: 'every dataset, paper, library, and API powering the project',
  s15: 'the full JSON structure for developers who want to inspect the API',
}

const PLAIN_ENGLISH = {
  s1: 'You give us your birth date, time, and place. The city name gets converted to coordinates automatically through a free geocoding service — no API key needed. Everything else flows from these five simple values.',
  s2: 'We look at your birth month and whether you were born north or south of the equator. Northern hemisphere summer is southern hemisphere winter — the calendar flips, and we account for that.',
  s3: 'We take your birth moment and location and ask: which stars were physically above your horizon that night? This uses the same math astronomers use to point telescopes.',
  s4: 'Every star belongs to a spectral class (O, B, A, F, G, K, or M) based on its temperature and color. We count how much light each class contributed to your sky — bright stars count more because they dominated your view.',
  s5: 'Different types of stars produce different elements. Hot blue stars make more oxygen; cool red stars make more carbon. We multiply your sky\'s stellar mix by published nucleosynthesis tables to get your personal elemental fingerprint.',
  s6: 'The element you have the most of tells us which stellar process created it — gentle winds from an aging giant star, a violent supernova explosion, or two dead stars crashing together.',
  s7: 'Beyond the main numbers, we compute a few cool extras: which element in your body is the rarest (usually gold from a neutron star merger), and the average age of your atoms (often billions of years old).',
  s8: 'Each spectral class has a known surface temperature and energy output. We average those values weighted by how much of each class was in your sky. Hotter, brighter stars drive a higher energy score.',
  s9: 'Stars that burn hot die young; dim stars burn for trillions of years. We take the inverse of stellar lifespans, weight them by your sky, then add a small seasonal modifier based on birth-season research.',
  s10: 'Different cosmic events spread their material across different distances. A slow stellar wind stays local; a kilonova (neutron star merger) scatters elements across thousands of light-years. Your dominant pathway determines your legacy score.',
  s11: 'We look at your dominant element group and how diverse your sky was. If gold (the rarest signal) is present above a trace level, you get "Deep." Otherwise, carbon-rich diverse skies get "Structural," iron-rich narrow skies get "Elemental," and everything else defaults to "Expansive."',
  s12: 'Each element has a typical origin age — carbon might be 6 billion years old, iron might be only 3.5 billion. We average those ages weighted by your elemental makeup and normalize the result to a 0–100 scale.',
  s13: 'The 6 Part 1 values plus the 5 trait scores create a unique combinatorial fingerprint. An LLM (Gemini first, Groq as backup) turns those 11 numbers into a 3-paragraph cosmic portrait written in second person — always ending with a Note: that this is poetic interpretation, not science.',
  s14: 'We track where every number comes from — the HYG star catalog, the JPL ephemeris, two peer-reviewed papers (Kobayashi 2020 on nucleosynthesis, Chotai 2003 on birth-season effects), and the free APIs that power geocoding and narrative generation.',
  s15: 'The complete request and response shapes for both /api/part1 and /api/part2, with annotations explaining the origin of every single field.',
}

function GroupDivider({ label, color }) {
  return (
    <div className="ab-divider" style={{ '--ab-divider': color }}>
      <span className="ab-divider-line" />
      <span className="ab-divider-label">{label}</span>
      <span className="ab-divider-line" />
    </div>
  )
}

export default function About() {
  const [activeNode, setActiveNode] = useState(null)

  const scrollTo = (id) => {
    setActiveNode(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const part1Sections = ['s1', 's2', 's3', 's4', 's5', 's6', 's7']
  const part2Sections = ['s8', 's9', 's10', 's11', 's12', 's13', 's14', 's15']

  const sectionContent = (id) => {
    switch (id) {
      case 's1': return (
        <>
          <p className="ab-p">Every profile starts with five values the user provides. Only these five are needed — everything else is computed deterministically from them.</p>
          <Table headers={['Field', 'Type', 'Example', 'Source']} rows={[
            ['birth_date', 'ISO string YYYY-MM-DD', '"1999-09-14"', 'User input (date picker)'],
            ['birth_time', 'string HH:MM (24h)', '"21:00"', 'User input (default 21:00)'],
            ['latitude', 'float, degrees', '31.5497', 'Geocoded via OpenStreetMap Nominatim'],
            ['longitude', 'float, degrees', '74.3436', 'Geocoded via OpenStreetMap Nominatim'],
            ['location_name', 'string', '"Lahore, Pakistan"', 'Display only, from geocoding result'],
          ]} />
          <p className="ab-p">The frontend geocodes via <strong>OpenStreetMap Nominatim</strong> (<a href="https://nominatim.openstreetmap.org" target="_blank" rel="noreferrer">nominatim.openstreetmap.org</a>). No API key required.</p>
        </>
      )
      case 's2': return (
        <>
          <Research>Meteorological season convention (WMO standard). Hemisphere flips follow the astronomical fact that seasons are opposite across the equator.</Research>
          <FileLabel>backend/core/chronobiology.py</FileLabel>
          <p className="ab-p">The season is determined by the birth month using <strong>meteorological seasons</strong> (not astronomical solstices/equinoxes). Each season is exactly 3 calendar months. Hemisphere is purely the sign of latitude.</p>
          <SubSection title="Constant: NORTHERN_SEASONS_BY_MONTH">
            <Table headers={['Months', 'Season']} rows={[
              ['December, January, February', <Code key="a">"winter"</Code>],
              ['March, April, May', <Code key="b">"spring"</Code>],
              ['June, July, August', <Code key="c">"summer"</Code>],
              ['September, October, November', <Code key="d">"autumn"</Code>],
            ]} />
            <Code>{`NORTHERN_SEASONS_BY_MONTH = {\n  12: "winter", 1: "winter", 2: "winter",\n  3: "spring",  4: "spring", 5: "spring",\n  6: "summer",  7: "summer", 8: "summer",\n  9: "autumn", 10: "autumn", 11: "autumn"\n}`}</Code>
          </SubSection>
          <SubSection title="Constant: SOUTHERN_FLIP">
            <Code>{`SOUTHERN_FLIP = {\n  "winter": "summer", "summer": "winter",\n  "spring": "autumn", "autumn": "spring"\n}`}</Code>
          </SubSection>
          <SubSection title="Logic: season_and_hemisphere()">
            <ol className="ab-ol">
              <li>Parse date to extract month number (1–12).</li>
              <li>Set hemisphere = "northern" if latitude &gt;= 0, else "southern".</li>
              <li>Look up the northern season from NORTHERN_SEASONS_BY_MONTH[month].</li>
              <li>If southern hemisphere, flip it using SOUTHERN_FLIP.</li>
            </ol>
            <CalcBlock formula={`season = northern_seasons[month]\n→ if southern, season = opposite[season]`} result='month=9, lat=31.5 → "autumn"; month=9, lat=-33 → "spring"' />
          </SubSection>
        </>
      )
      case 's3': return (
        <>
          <Research>HYG Database v3.7 (David Nash, public domain). Skyfield library + JPL DE421 ephemeris.</Research>
          <FileLabel>backend/core/sky_engine.py</FileLabel>
          <SubSection title="Dataset: HYG Database v3.7">
            <p className="ab-p">~120,000 stars with positions, magnitudes, spectral types, and proper names. Compiled from Hipparcos, Yale Bright Star, and Gliese catalogs. Public domain.</p>
            <Table headers={['Column', 'Type', 'Used for']} rows={[
              ['ra', 'float (hours)', 'Right ascension — east-west position'],
              ['dec', 'float (degrees)', 'Declination — north-south position'],
              ['mag', 'float', 'Apparent magnitude (brightness)'],
              ['spect', 'string', 'Spectral type — first char is the class'],
              ['proper', 'string', 'Common name, e.g. "Rigel"'],
            ]} />
            <p className="ab-p">Stars with mag &gt;= 6.5 are excluded (naked-eye limit). The Sun is also excluded.</p>
          </SubSection>
          <SubSection title="Library: Skyfield + JPL DE421">
            <p className="ab-p">Skyfield computes accurate celestial positions using the JPL DE421 ephemeris (~17 MB, downloaded on first run). For each star, it calculates altitude and azimuth from the observer's lat/lon at the birth moment.</p>
          </SubSection>
          <SubSection title="RA/Dec → Unit Vector (for 3D)">
            <CalcBlock formula={`ra_rad = (ra_hours / 24) * 2π\ndec_rad = (dec_deg * π) / 180\nx = cos(dec) * cos(ra)\ny = sin(dec)\nz = cos(dec) * sin(ra)`} />
          </SubSection>
          <SubSection title="Output: star_positions">
            <Code>{`{\n  name: "Rigel", ra: 5.2423, dec: -8.2016,\n  magnitude: 0.13, spectral_class: "B",\n  x: 0.312, y: -0.124, z: 0.942\n}`}</Code>
          </SubSection>
        </>
      )
      case 's4': return (
        <>
          <FileLabel>backend/core/spectral_classifier.py</FileLabel>
          <SubSection title="The 7 spectral classes">
            <Table headers={['Class', 'Temperature', 'Color', 'Example']} rows={[
              ['O', '30,000–50,000 K', 'Blue', 'Alnitak'],
              ['B', '10,000–30,000 K', 'Blue-white', 'Rigel'],
              ['A', '7,500–10,000 K', 'White', 'Sirius'],
              ['F', '6,000–7,500 K', 'Yellow-white', 'Procyon'],
              ['G', '5,200–6,000 K', 'Yellow', 'Sun'],
              ['K', '3,700–5,200 K', 'Orange', 'Arcturus'],
              ['M', '2,400–3,700 K', 'Red', 'Betelgeuse'],
            ]} />
          </SubSection>
          <SubSection title="Brightness-weighted flux">
            <CalcBlock formula={`flux = 10^(-mag / 2.5)\nweight[class] = sum(flux of class) / total_flux`} result="The spectral_weights dict sums to 1.0" />
            <p className="ab-p">The formula 10^(-mag/2.5) converts the logarithmic magnitude scale to linear flux. A difference of 5 magnitudes = factor of 100 in brightness — the standard Pogson system.</p>
          </SubSection>
          <SubSection title="Outputs">
            <Code>{`{\n  spectral_weights: {"O": 0.05, "B": 0.41, "A": 0.22, ...},\n  dominant_class: "B",\n  dominant_star_example: "Rigel (Beta Orionis)"\n}`}</Code>
          </SubSection>
        </>
      )
      case 's5': return (
        <>
          <Research>Kobayashi et al. 2020, "The Origin of Elements from Carbon to Uranium", ApJ 900 179. <a href="https://doi.org/10.3847/1538-4357/abae65" target="_blank" rel="noreferrer">DOI: 10.3847/1538-4357/abae65</a></Research>
          <FileLabel>backend/core/nucleosynthesis.py</FileLabel>
          <p className="ab-p">Each spectral class produces different elements in different proportions. The yield table is derived from published nucleosynthesis literature, adapted to the 10 elements most relevant to human biochemistry.</p>
          <SubSection title="The 7×10 yield matrix">
            <div className="ab-table-wrap">
              <table className="ab-table ab-matrix">
                <thead><tr><th>Class</th>{['C','O','Fe','Ca','N','Mg','Si','S','Au','other'].map(e => <th key={e}>{e}</th>)}</tr></thead>
                <tbody>{[['O',0.05,0.45,0.10,0.08,0.05,0.10,0.10,0.05,0.01,0.01],['B',0.10,0.35,0.15,0.10,0.08,0.08,0.07,0.04,0.02,0.01],['A',0.20,0.28,0.18,0.10,0.09,0.06,0.05,0.02,0.01,0.01],['F',0.28,0.25,0.18,0.10,0.09,0.05,0.03,0.01,0.005,0.005],['G',0.35,0.24,0.17,0.09,0.08,0.04,0.02,0.01,0.003,0.007],['K',0.38,0.22,0.16,0.09,0.08,0.04,0.02,0.005,0.002,0.003],['M',0.40,0.20,0.15,0.09,0.08,0.03,0.02,0.005,0.001,0.004]].map((row, i) => (<tr key={i}><td><strong>{row[0]}</strong></td>{row.slice(1).map((v, j) => <td key={j} className="ab-cell-num">{v.toFixed(3)}</td>)}</tr>))}</tbody>
              </table>
            </div>
            <p className="ab-p"><strong>Patterns:</strong> Cooler stars (K, M) produce more carbon. Hotter stars (O, B) produce more oxygen. Gold is always a trace element — it takes the rarest events (neutron star mergers) to make it.</p>
          </SubSection>
          <SubSection title="Logic: compute_element_percentages()">
            <CalcBlock formula={`For each element E:\n  total[E] = Σ (weight[class] × YIELDS[class][E])\nThen normalize:  element_pct[E] = total[E] / Σ(total)`} result='sky with 41% B, 22% A → ~38% Carbon, 25% Oxygen, ...' />
            <Code>{`element_percentages = {\n  "C": 0.38, "O": 0.25, "Fe": 0.17, "Ca": 0.09,\n  "N": 0.07, "Mg": 0.02, "Si": 0.01, "S": 0.005,\n  "Au": 0.003, "other": 0.002\n}`}</Code>
          </SubSection>
        </>
      )
      case 's6': return (
        <>
          <FileLabel>backend/core/nucleosynthesis.py</FileLabel>
          <p className="ab-p">The element with the highest percentage (excluding "other") determines which stellar process created most of the user's atoms — the story of where their matter came from.</p>
          <SubSection title="Constant: ELEMENT_TO_PATHWAY">
            <Table headers={['Element(s)', 'Pathway', 'Process', 'What happens']} rows={[
              ['C, N', <Code key="a">"agb_winds"</Code>, 'AGB stellar winds', 'Gentle winds from dying intermediate-mass stars (~1–8 M☉). Drift through the galaxy over millions of years.'],
              ['O, Mg, Si, S', <Code key="b">"type_ii_sn"</Code>, 'Core-collapse supernova', 'Explosive death of massive stars (&gt;8 M☉). Ejected at thousands of km/s.'],
              ['Fe, Ca', <Code key="c">"type_ia_sn"</Code>, 'Thermonuclear supernova', 'White dwarf in a binary system undergoes runaway fusion. Disperses iron across galactic scales.'],
              ['Au, Pt, U', <Code key="d">"r_process"</Code>, 'Neutron star merger', 'Two neutron stars collide, triggering rapid neutron capture that creates the heaviest elements. Extremely rare.'],
            ]} />
          </SubSection>
          <SubSection title="Logic">
            <CalcBlock formula={`1. Exclude "other"\n2. Find dominant_element = max\n3. Pathway = ELEMENT_TO_PATHWAY[dominant]`} result='dominant=C → "agb_winds"; dominant=O → "type_ii_sn"' />
          </SubSection>
        </>
      )
      case 's7': return (
        <>
          <FileLabel>backend/core/nucleosynthesis.py</FileLabel>
          <p className="ab-p">These are informational only — shown in the UI but not used by Part 2 scoring.</p>
          <SubSection title="Constant: ELEMENT_AGE_GYR">
            <p className="ab-p">Each element has a typical origin age in gigayears (billions of years), based on galactic chemical evolution models.</p>
            <Table headers={['Element', 'Age (Gyr)', 'Reason']} rows={[
              ['C', '6.0', 'Produced steadily by AGB stars across galactic history'],
              ['N', '5.5', 'Also AGB-produced, slightly later peak'],
              ['O', '7.0', 'Core-collapse SNe — begin early in cosmic history'],
              ['Mg', '7.5', 'Core-collapse SNe, weighted to early universe'],
              ['Si', '7.0', 'Core-collapse SNe'],
              ['S', '6.5', 'Core-collapse SNe'],
              ['Fe', '3.5', 'Type Ia SNe — require binary systems, several Gyr to evolve'],
              ['Ca', '4.0', 'Type Ia SNe, mildly younger'],
              ['Au', '8.0', 'Neutron star mergers — rare, distributed across time'],
              ['other', '5.0', 'Conservative default'],
            ]} />
          </SubSection>
          <SubSection title="Logic: rarest_element">
            <CalcBlock formula={`1. Filter: exclude "other" and zero entries\n2. rarest = key with minimum value\n3. origin = PATHWAY_DISPLAY[ELEMENT_TO_PATHWAY[rarest]]`} result='Au at 0.003 → "Gold (Au)" from "neutron star merger (r-process)"' />
          </SubSection>
          <SubSection title="Logic: avg_atom_age">
            <CalcBlock formula={`avg_age = Σ(element_pct[e] × ELEMENT_AGE_GYR[e])`} result='0.38×6.0 + 0.25×7.0 + ... → 8.4 billion years' />
          </SubSection>
        </>
      )
      case 's8': return (
        <>
          <FileLabel>backend/core/trait_scorer.py:16</FileLabel>
          <SubSection title="Constant: CLASS_ENERGY">
            <Table headers={['Class', 'Value', 'Basis']} rows={[
              ['M', '10', '2,400–3,700 K, trillion-year lifespan'],
              ['K', '25', '3,700–5,200 K, very long-lived'],
              ['G', '40', '5,200–6,000 K, Sun-like'],
              ['F', '55', '6,000–7,500 K, shorter lifespan'],
              ['A', '68', '7,500–10,000 K, high UV output'],
              ['B', '85', '10,000–30,000 K, 10,000× solar luminosity'],
              ['O', '98', '30,000–50,000 K, lives ~3 million years'],
            ]} />
          </SubSection>
          <SubSection title="Formula">
            <CalcBlock formula={`energy = Σ(weights[class] × CLASS_ENERGY[class])\n→ round, clamp 0–100`} result='41% B (85) + 22% A (68) + ... → 74' />
          </SubSection>
        </>
      )
      case 's9': return (
        <>
          <Research>Chotai et al. 2003 (Biological Psychiatry) and Boland &amp; Kessler 2002 (Journal of Affective Disorders) — documented weak correlations between birth season and dopaminergic tone / circadian rhythm tendencies.</Research>
          <FileLabel>backend/core/trait_scorer.py:29</FileLabel>
          <SubSection title="Constant: CLASS_PACE_BASE">
            <Table headers={['Class', 'Lifespan', 'Base']} rows={[
              ['O', '~3 million years', '95'], ['B', '~100 million years', '80'], ['A', '~1 billion years', '65'],
              ['F', '~3 billion years', '50'], ['G', '~10 billion years', '35'], ['K', '~30 billion years', '20'], ['M', '~1 trillion years', '5'],
            ]} />
          </SubSection>
          <SubSection title="Constant: SEASON_MODIFIER">
            <Table headers={['Season', 'Modifier', 'Rationale']} rows={[
              ['summer', '+10', 'More daylight → higher dopaminergic tone'],
              ['spring', '+5', 'Moderate increase in activity drive'],
              ['autumn', '-3', 'Slight decrease as daylight recedes'],
              ['winter', '-8', 'Low daylight → more restful disposition'],
            ]} />
          </SubSection>
          <SubSection title="Formula">
            <CalcBlock formula={`base = Σ(weights[class] × CLASS_PACE_BASE[class])\n→ base + SEASON_MODIFIER[season]\n→ clamp 0–100`} result='base=68, summer (+10) → 78' />
          </SubSection>
        </>
      )
      case 's10': return (
        <>
          <FileLabel>backend/core/trait_scorer.py:48</FileLabel>
          <SubSection title="Constant: PATH_LEGACY">
            <Table headers={['Pathway', 'Score', 'Physics']} rows={[
              ['big_bang', '15', 'Everywhere uniformly, ancient and diffuse'],
              ['agb_winds', '35', 'Slow winds — a few light-years spread'],
              ['type_ii_sn', '65', 'Core-collapse — ~30 light-years into the ISM'],
              ['type_ia_sn', '80', 'Thermonuclear — across entire galaxy arms'],
              ['r_process', '95', 'Kilonova — thousands of light-years, extremely rare'],
            ]} />
          </SubSection>
          <SubSection title="Formula">
            <CalcBlock formula={`legacy = PATH_LEGACY[nucleosynthesis_path]\n→ defaults to 50`} result='path="type_ii_sn" → 65' />
          </SubSection>
        </>
      )
      case 's11': return (
        <>
          <FileLabel>backend/core/trait_scorer.py:65</FileLabel>
          <SubSection title="Sky diversity helper">
            <CalcBlock formula={`diversity = count of classes where weight > 0.05\n→ returns 1–7`} result='41% B, 22% A, 12% F, 10% G → diversity = 4' />
          </SubSection>
          <SubSection title="Rule table">
            <Table headers={['Condition', 'Result', 'Meaning']} rows={[
              ['Au &gt; 0.005', <Code key="a">"Deep"</Code>, 'Drawn to extremes, threshold crossers'],
              ['C/N dominant AND diversity ≥ 4', <Code key="b">"Structural"</Code>, 'Builders, systems thinkers'],
              ['Fe/Ca dominant AND diversity &lt; 4', <Code key="c">"Elemental"</Code>, 'Depth, obsessive specialist focus'],
              ['O/Mg/Si/S dominant AND diversity ≥ 4', <Code key="d">"Expansive"</Code>, 'Generalists, connectors'],
              ['Fallback', <Code key="e">"Expansive"</Code>, 'Default — most common'],
            ]} />
            <Code>{`carbon_group = {"C", "N"}\niron_group = {"Fe", "Ca"}\noxygen_group = {"O", "Mg", "Si", "S"}`}</Code>
          </SubSection>
        </>
      )
      case 's12': return (
        <>
          <FileLabel>backend/core/trait_scorer.py:105</FileLabel>
          <SubSection title="Constants">
            <Code>{`MAX_AGE = 13.5 Gyr  (Big Bang hydrogen)\nMIN_AGE = 2.0 Gyr   (youngest stellar ejecta)`}</Code>
          </SubSection>
          <SubSection title="Formula">
            <CalcBlock formula={`weighted = Σ(element_pct[e] × ELEMENT_AGE_GYR[e])\nnorm = (weighted - MIN) / (MAX - MIN)\nscore = clamp(norm × 100, 0, 100)`} result='weighted=8.4 → (8.4-2.0)/(13.5-2.0) = 0.558 → 56/100' />
          </SubSection>
        </>
      )
      case 's13': return (
        <>
          <FileLabel>backend/llm/prompt_builder.py + narrative_client.py</FileLabel>
          <p className="ab-p">The 5 trait scores + 6 Part 1 values create a combinatorial space large enough that no two users read the same profile. The LLM turns those 11 numbers into a unique narrative, instructed to frame its output as poetic interpretation.</p>
          <SubSection title="Prompt structure">
            <ol className="ab-ol">
              <li><strong>Instructions:</strong> Second person, specific star types, avoid horoscopes, end with "Note:" disclaimer.</li>
              <li><strong>Data:</strong> Dominant class, season, top element, rarest element, nucleosynthesis pathway.</li>
              <li><strong>Scores:</strong> All 5 with 0–100 interpretation labels.</li>
              <li><strong>Format:</strong> JSON with archetype_name, paragraph_1/2/3.</li>
            </ol>
          </SubSection>
          <SubSection title="Models &amp; configuration">
            <p className="ab-p"><strong>Primary:</strong> Google Gemini (tried in order):</p>
            <Code>{`["gemini-2.5-flash-lite", "gemini-2.5-flash",\n "gemini-3.5-flash", "gemini-3-flash-preview"]`}</Code>
            <p className="ab-p"><strong>Fallback:</strong> Groq Llama 3 8B (<Code>llama3-8b-8192</Code>)</p>
            <Table headers={['Parameter', 'Value', 'Why']} rows={[
              ['temperature', '0.85', 'Varied but grounded'],
              ['maxOutputTokens', '500', 'Room for 3 paragraphs'],
            ]} />
          </SubSection>
          <SubSection title="Fallback behavior">
            <p className="ab-p">If both fail, narrative returns empty strings. The 5 trait scores <strong>always</strong> compute — they require no API key.</p>
          </SubSection>
        </>
      )
      case 's14': return (
        <>
          <p className="ab-p">Every external source used in this project.</p>
          <Table headers={['Source', 'What it provides', 'URL / DOI']} rows={[
            ['HYG Database v3.7', '120k stars: RA, Dec, mag, spectral type', <a key="a1" href="https://github.com/astronexus/HYG-Database" target="_blank" rel="noreferrer">github.com/astronexus/HYG-Database</a>],
            ['JPL DE421', 'Earth position model', 'Downloaded via skyfield'],
            ['Skyfield', 'Altitude/azimuth from lat/lon/time', <a key="a2" href="https://rhodesmill.org/skyfield/" target="_blank" rel="noreferrer">rhodesmill.org/skyfield</a>],
            ['Kobayashi et al. 2020', 'Nucleosynthesis yields', <a key="a3" href="https://doi.org/10.3847/1538-4357/abae65" target="_blank" rel="noreferrer">doi:10.3847/1538-4357/abae65</a>],
            ['Chotai et al. 2003', 'Birth-season modifiers', 'DOI: 10.1016/S0006-3223(02)01469-6'],
            ['OpenStreetMap Nominatim', 'Free geocoding', <a key="a4" href="https://nominatim.openstreetmap.org" target="_blank" rel="noreferrer">nominatim.openstreetmap.org</a>],
            ['Google Gemini', 'Primary LLM', <a key="a5" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a>],
            ['Groq (Llama 3)', 'Fallback LLM', <a key="a6" href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a>],
            ['Morgan–Keenan system', 'Spectral classification standard', 'Harvard spectral standard'],
          ]} />
        </>
      )
      case 's15': return (
        <>
          <p className="ab-p">For developers: the full API request/response shapes with annotations.</p>
          <SubSection title="POST /api/part1 response">
            <Code>{`{\n  "birth": {"birth_date": "1999-09-14", ...},\n  "season": "autumn",           // from NORTHERN_SEASONS_BY_MONTH\n  "hemisphere": "northern",     // latitude >= 0\n  "dominant_class": "B",        // argmax of spectral_weights\n  "spectral_weights": {...},    // flux-weighted class distribution\n  "element_percentages": {...}, // yields × weights, renormalized\n  "nucleosynthesis_path": "type_ii_sn",\n  "sky_diversity": 4,\n  "dominant_star_example": "Rigel",\n  "rarest_element": "Gold (Au)",\n  "rarest_element_origin": "neutron star merger",\n  "avg_atom_age_billion_years": 8.4\n}`}</Code>
          </SubSection>
          <SubSection title="POST /api/part2 response">
            <Code>{`{\n  "energy_score": 74,         // weighted CLASS_ENERGY\n  "pace_score": 77,           // CLASS_PACE_BASE + SEASON_MODIFIER\n  "legacy_score": 65,         // PATH_LEGACY lookup\n  "curiosity_type": "Expansive",\n  "temporal_score": 48,       // weighted ELEMENT_AGE_GYR\n  "archetype_name": "Shockwave Architect",\n  "narrative_p1": "...",\n  "narrative_p2": "...",\n  "narrative_p3": "..."\n}`}</Code>
          </SubSection>
        </>
      )
      default: return null
    }
  }

  return (
    <div className="page about-page">
      <Header />
      <main className="about-main">
        {/* ── Hero ── */}
        <section className="ab-hero">
          <p className="ab-hero-eyebrow">Behind the calculations</p>
          <h1 className="ab-hero-title">How Stellar DNA Works</h1>
          <p className="ab-hero-sub">
            Every number on your profile has a traceable origin — a research paper, a public dataset,
            a physics formula, or a deterministic constant. This is the full story of where the data comes from
            and how the math works, written for anyone who wants to see behind the curtain.
          </p>
        </section>

        {/* ── Pipeline nodes ── */}
        <section className="ab-pipeline">
          <div className="ab-pipeline-track">
            {FLOW_NODES.map((n, i) => (
              <div key={n.id} className="ab-pipeline-node-wrap">
                <button
                  className={`ab-pipeline-node ${activeNode === n.id ? 'is-active' : ''}`}
                  style={{ '--ab-node': n.group === 'part2' ? 'var(--accent-2)' : 'var(--accent)' }}
                  onClick={() => scrollTo(n.id)}
                  onMouseEnter={() => setActiveNode(n.id)}
                  onMouseLeave={() => setActiveNode(null)}
                >
                  <span className="ab-pipeline-num">{i + 1}</span>
                  <span className="ab-pipeline-label">{n.label}</span>
                </button>
                {i < FLOW_NODES.length - 1 && <div className="ab-pipeline-line" style={{ '--ab-node': n.group === 'part2' && FLOW_NODES[i + 1].group === 'part2' ? 'var(--accent-2)' : 'var(--accent)' }} />}
              </div>
            ))}
          </div>
        </section>

        {/* ── Accordion groups ── */}
        <div className="ab-accordion">

          {/* ═══ PART 1 ═══ */}
          <GroupDivider label="PART 1 — THE SCIENCE" color="var(--accent)" />

          {part1Sections.map((id) => (
            <div key={id} id={id}>
              <Section title={`${id === 's1' ? '1. User Inputs' : id === 's2' ? '2. Season & Hemisphere' : id === 's3' ? '3. Sky Engine' : id === 's4' ? '4. Spectral Classification' : id === 's5' ? '5. Element Yields & Percentages' : id === 's6' ? '6. Nucleosynthesis Pathway' : '7. Display Extras'}`} layman={SECTION_LAYMAN[id]} group="part1">
                {sectionContent(id)}
              </Section>
            </div>
          ))}

          {/* ═══ PART 2 ═══ */}
          <GroupDivider label="PART 2 — THE PORTRAIT" color="var(--accent-2)" />

          {part2Sections.map((id) => (
            <div key={id} id={id}>
              <Section title={`${id === 's8' ? '8. Energy Score' : id === 's9' ? '9. Pace Score' : id === 's10' ? '10. Legacy Score' : id === 's11' ? '11. Curiosity Type' : id === 's12' ? '12. Temporal Orientation' : id === 's13' ? '13. LLM Narrative' : id === 's14' ? '14. Data Sources & References' : '15. Complete Profile JSON Schema'}`} layman={SECTION_LAYMAN[id]} group="part2">
                {sectionContent(id)}
              </Section>
            </div>
          ))}

        </div>

        {/* ── Closing verification statement ── */}
        <section className="ab-verify">
          <h2 className="ab-verify-title">
            Everything is <span className="ab-verify-glow">verifiable</span>.
          </h2>
          <p className="ab-verify-text">
            All 5 trait scores are computed with pure deterministic math from HYG star data and published yield tables.
            The LLM is used only to turn numbers into language — it never invents scientific claims.
            Clone the repository, run the code, and verify every calculation yourself.
          </p>
        </section>
      </main>
    </div>
  )
}
