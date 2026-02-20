export function formatAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  if (years === 0) {
    return months <= 1 ? `${months} month` : `${months} months`
  }
  if (months === 0) {
    return years === 1 ? '1 year' : `${years} years`
  }
  const yLabel = years === 1 ? '1 year' : `${years} years`
  const mLabel = months === 1 ? '1 month' : `${months} months`
  return `${yLabel}, ${mLabel}`
}

export function formatDobDisplay(dob: string): string {
  const d = new Date(dob)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
