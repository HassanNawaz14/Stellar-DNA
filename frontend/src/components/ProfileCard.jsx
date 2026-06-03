export default function ProfileCard({ data }) {
  if (!data) return null
  return (
    <div className="profile-card">
      <h2>Stellar DNA</h2>
      <p>Birth: {data.birth?.date} {data.birth?.time}</p>
      <p>Location: {data.birth?.locationName}</p>
      <pre>{JSON.stringify(data.part1, null, 2)}</pre>
    </div>
  )
}
