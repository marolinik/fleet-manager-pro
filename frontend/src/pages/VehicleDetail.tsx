import { useParams } from 'react-router-dom'

export default function VehicleDetail() {
  const { id } = useParams()
  
  return (
    <div>
      <h1>Vehicle Detail {id}</h1>
    </div>
  )
}