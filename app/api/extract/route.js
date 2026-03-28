export const runtime = 'nodejs'

export async function POST(req) {
try {
const formData = await req.formData()
const file = formData.get('file')

if (!file) {
return Response.json({ error: 'No file uploaded' }, { status: 400 })
}

return Response.json({
success: true,
message: 'Upload received successfully'
})
} catch (err) {
console.error(err)
return Response.json({ error: 'Upload failed' }, { status: 500 })
}
}

