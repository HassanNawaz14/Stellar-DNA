import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const ELEMENT_COLORS = {
  C: '#3b4a6b',
  O: '#4f7cc4',
  Fe: '#a83248',
  Ca: '#c9a14a',
  N: '#5b8c5a',
  Mg: '#7f9eb2',
  Si: '#8c7a6b',
  S: '#d4b15f',
  Au: '#e8c547',
  other: '#5a5e7a',
}

const ELEMENT_LABELS = {
  C: 'Carbon',
  O: 'Oxygen',
  Fe: 'Iron',
  Ca: 'Calcium',
  N: 'Nitrogen',
  Mg: 'Magnesium',
  Si: 'Silicon',
  S: 'Sulfur',
  Au: 'Gold',
  other: 'Other',
}

export default function ElementChart({ data = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    const entries = Object.entries(data).filter(([, v]) => v > 0)
    if (!entries.length) return
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const width = 420
    const height = 420
    const radius = Math.min(width, height) / 2

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const pieData = entries.map(([element, value]) => ({ element, value }))
    const color = (el) => ELEMENT_COLORS[el] || ELEMENT_COLORS.other
    const pie = d3.pie().value((d) => d.value).sort(null)
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius)
    const labelArc = d3.arc().innerRadius(radius * 0.78).outerRadius(radius * 0.78)

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)

    g.selectAll('path.slice')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.element))
      .attr('stroke', '#0a0a14')
      .attr('stroke-width', 2)

    g.selectAll('text.slice-label')
      .data(pie(pieData))
      .enter()
      .append('text')
      .attr('class', 'slice-label')
      .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text((d) => (d.data.value > 0.04 ? d.data.element : ''))

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#aab2c8')
      .attr('font-size', '13px')
      .text('Elemental')

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', '#ffffff')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text('Composition')
  }, [data])

  const entries = Object.entries(data).filter(([, v]) => v > 0)
  return (
    <div className="element-chart">
      <svg ref={ref} width="100%" height="420" viewBox="0 0 420 420" />
      <ul className="element-legend">
        {entries
          .sort((a, b) => b[1] - a[1])
          .map(([el, val]) => (
            <li key={el}>
              <span className="dot" style={{ background: ELEMENT_COLORS[el] || ELEMENT_COLORS.other }} />
              <span className="legend-name">{ELEMENT_LABELS[el] || el}</span>
              <span className="legend-sym">{el}</span>
              <span className="legend-val">{(val * 100).toFixed(1)}%</span>
            </li>
          ))}
      </ul>
    </div>
  )
}
