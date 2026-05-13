export async function staffUpload(file: File, bucket: string, path: string): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  formData.append('path', path)

  const res = await fetch('/api/staff/upload', { method: 'POST', body: formData })
  if (!res.ok) return null
  const { url } = await res.json()
  return url
}
