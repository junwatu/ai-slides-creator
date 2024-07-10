import path from 'path'
import { URL, fileURLToPath } from 'url'
import express from 'express'
import fs from 'fs'
import { aiAssistant } from './libs/ai.js'


const app = express()
// eslint-disable-next-line no-undef
const apiURL = new URL(process.env.VITE_APP_URL)
const hostname = apiURL.hostname
const port = apiURL.port || 4000

// Get the current directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.static(path.join(path.resolve(), 'dist')))

app.get('/', (req, res) => {
	// Serve the index.html file from the 'dist' folder
	res.sendFile(path.join(path.resolve(), 'dist', 'index.html'))
})

app.get('/create/:fileId', async (req, res) => {
	const fileId = req.params.fileId

	try {
		// Call the aiAssistant function with the fileId
		await aiAssistant(fileId)
		res.status(200).send('AI Assistant task completed successfully')
	} catch (error) {
		console.error('Error in AI Assistant:', error)
		res.status(500).send('Error in AI Assistant')
	}
})

app.get('/slides', (req, res) => {
	res.json({ info: "Get all slides data" })
})

app.get('/metadata', (req, res) => {
	res.sendFile(path.join(__dirname, 'data', 'metadata.json'))
})

// Route to list filenames in the 'data' directory
app.get('/data/files', (req, res) => {
	const dirPath = path.join(__dirname, 'data')
	fs.readdir(dirPath, (err, files) => {
		if (err) {
			return res.status(500).send({ error: 'Failed to read the directory' })
		}
		// Filter out non-JSON files
		const jsonFiles = files.filter(file => path.extname(file) === '.json')
		res.setHeader('Content-Type', 'application/json')
		res.send(JSON.stringify(jsonFiles))
	})
})

// Route to serve a specific JSON file
app.get('/data/files/:filename', (req, res) => {
	const filePath = path.join(__dirname, 'data', req.params.filename)
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			return res.status(500).send({ error: 'Failed to read the file' })
		}
		res.setHeader('Content-Type', 'application/json')
		res.send(data)
	})
})

app.listen(port, hostname, () => {
	console.log(`Server is running at http://${hostname}:${port}`)
})