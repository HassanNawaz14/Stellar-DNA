export default function TraitProfile({ data }) {
  if (!data) return null
  return (
    <div className="trait-profile">
      <h2>Trait Profile</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
