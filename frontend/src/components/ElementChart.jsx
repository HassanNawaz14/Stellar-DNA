import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function ElementChart({ data = [] }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!data.length) return
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const color = d3.scaleOrdinal(d3.schemeCategory10)
    const pie = d3.pie().value((d) => d.value)
    const arc = d3.arc().innerRadius(0).outerRadius(radius)

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)

    g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.element))
      .attr('stroke', '#0a0a14')
      .attr('stroke-width', 2)
  }, [data])

  return <svg ref={ref} width="100%" height="400" />
}