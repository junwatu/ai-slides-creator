import fs from 'node:fs'
import OpenAI from "openai"
import path from 'node:path'
import { Buffer } from "node:buffer"
import { __dirname } from './dirname.js'

const openai = new OpenAI({
	// eslint-disable-next-line no-undef
	apiKey: process.env.OPENAI_API_KEY
});

export async function aiAssistant(fileId) {

	const assistant = await openai.beta.assistants.create(
		{
			name: "Data Scientist Assistant",
			description: "You are a data scientist assistant. When given data and a query, write the proper code and create the proper visualization",
			model: "gpt-4o",
			tools: [{ "type": "code_interpreter" }],
			tool_resources: {
				"code_interpreter": {
					"file_ids": [fileId]
				}
			}
		}
	)

	const thread = await openai.beta.threads.create({
		messages: [
			{
				"role": "user",
				"content": "Calculate profit (revenue minus cost) by quarter and year, and visualize as a line plot across the distribution channels, where the colors of the lines are green, light red, and light blue",
				"attachments": [
					{
						file_id: fileId,
						tools: [{ type: "code_interpreter" }]
					}
				]
			}
		]
	});


	const run = await openai.beta.threads.runs.createAndPoll(
		thread.id,
		{ assistant_id: assistant.id }
	);

	if (run.status === "completed") {
		const messages = await openai.beta.threads.messages.list(thread.id)
		console.log(messages.data[0].content[0].image_file)

		try {
			const filename = `output-${fileId}.png`
			convertFileToPng(fileId, path.join(__dirname, 'public', filename))
			return { data: filename, status: "completed" }
		} catch (error) {
			return { data: null, status: run.status }
		}

	} else {
		return { data: null, status: run.status }
	}
}

// Helper function to convert output file to PNG
async function convertFileToPng(fileId, writePath) {
	try {
		// Retrieve file content from OpenAI
		const response = await openai.files.content(fileId)
		// Write buffer to a file
		const dataBuffer = Buffer.from(await response.arrayBuffer())

		fs.writeFile(writePath, dataBuffer, (err) => {
			if (err) {
				console.error('Error writing file:', err)
				throw err
			}
			console.log('File saved successfully to', writePath)
		})
	} catch (error) {
		console.error('Error fetching file content:', error)
		throw error
	}
}
