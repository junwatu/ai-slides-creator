import path from 'path'
import { URL } from 'url'
import express from 'express'

const app = express()
// eslint-disable-next-line no-undef
const apiURL = new URL(process.env.VITE_APP_URL)
const hostname = apiURL.hostname
const port = apiURL.port || 4000

app.use(express.json())
app.use(express.static(path.join(path.resolve(), 'dist')))

app.get('/', (req, res) => {
	// Serve the index.html file from the 'dist' folder
	res.sendFile(path.join(path.resolve(), 'dist', 'index.html'))
})

app.post('/create', (req, res) => {
	res.json({ info: "Create slides using AI" })
})

app.get('/slides', (req, res) => {
	res.json({ info: "Get all slides data" })
})

app.listen(port, hostname, () => {
	console.log(`Server is running at http://${hostname}:${port}`)
})