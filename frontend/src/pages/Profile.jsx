import { useLocation } from 'react-router-dom'
import StarMap from '../components/StarMap.jsx'
import ElementChart from '../components/ElementChart.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import TraitProfile from '../components/TraitProfile.jsx'

export default function Profile() {
  const { state } = useLocation()
  const data = state ?? {}

  return (
    <main className="profile">
      <section className="map">
        <StarMap stars={data.part1?.stars ?? []} />
      </section>
      <section className="results">
        <ProfileCard data={data} />
        <ElementChart data={data.part1?.elements ?? []} />
        <TraitProfile data={data.part2} />
      </section>
    </main>
  )
}
