import { getLabMeasurements } from "../../../actions"
import LabMeasurementsClient from "./LabMeasurementsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Lab Measurements", robots: "noindex, nofollow" }

export default async function LabMeasurementsPage() {
  const measurements = await getLabMeasurements()
  return (
    <div className="p-6">
      <LabMeasurementsClient measurements={measurements} />
    </div>
  )
}
