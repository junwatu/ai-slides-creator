import fs from 'node:fs'
import OpenAI from "openai"
import path from 'node:path'
import { Buffer } from "node:buffer"
import { __dirname } from '../dirname.js'

const openai = new OpenAI({
	// eslint-disable-next-line no-undef
	apiKey: process.env.OPENAI_API_KEY
});

const insightPrompt = `Give me two medium length sentences (~20-30 words per sentence) of the most important insights from the plot you just created. These will be used for a slide deck, and they should be about the 'so what' behind the data."`

const analyzeDataPrompt = "Calculate profit (revenue minus cost) by quarter and year, and visualize as a line plot across the distribution channels, where the colors of the lines are green, light red, and light blue"

const bulletPointsPrompt = "Given the plot and bullet points you created,come up with a very brief title for a slide. It should reflect just the main insights you came up with."

const slideTitle = "Global Auto Parts Distribution Inc."
const slideSubtitle = "Quarterly financial planning meeting"

const slideTitleTemplate = `
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_PARAGRAPH_ALIGNMENT
from pptx.dml.color import RGBColor

# Create a new presentation object
prs = Presentation()

# Add a blank slide layout
blank_slide_layout = prs.slide_layouts[6]
slide = prs.slides.add_slide(blank_slide_layout)

# Set the background color of the slide to black
background = slide.background
fill = background.fill
fill.solid()
fill.fore_color.rgb = RGBColor(0, 0, 0)

# Add title text box positioned higher
left = Inches(0)
top = Inches(2)
width = prs.slide_width
height = Inches(1)
title_box = slide.shapes.add_textbox(left, top, width, height)
title_frame = title_box.text_frame
title_p = title_frame.add_paragraph()
title_p.text = title_text
title_p.font.bold = True
title_p.font.size = Pt(38)
title_p.font.color.rgb = RGBColor(255, 255, 255)
title_p.alignment = PP_PARAGRAPH_ALIGNMENT.CENTER

# Add subtitle text box
left = Inches(0)
top = Inches(3)
width = prs.slide_width
height = Inches(1)
subtitle_box = slide.shapes.add_textbox(left, top, width, height)
subtitle_frame = subtitle_box.text_frame
subtitle_p = subtitle_frame.add_paragraph()
subtitle_p.text = subtitle_text
subtitle_p.font.size = Pt(22)
subtitle_p.font.color.rgb = RGBColor(255, 255, 255)
subtitle_p.alignment = PP_PARAGRAPH_ALIGNMENT.CENTER
`

const slideDataVisTemplate = `
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_PARAGRAPH_ALIGNMENT
from pptx.dml.color import RGBColor

# Create a new presentation object
prs = Presentation()

# Add a blank slide layout
blank_slide_layout = prs.slide_layouts[6]
slide = prs.slides.add_slide(blank_slide_layout)

# Set the background color of the slide to black
background = slide.background
fill = background.fill
fill.solid()
fill.fore_color.rgb = RGBColor(0, 0, 0)

# Define placeholders
image_path = data_vis_img
title_text = "Maximizing Profits: The Dominance of Online Sales & Direct Sales Optimization"
bullet_points = "• Online Sales consistently lead in profitability across quarters, indicating a strong digital market presence.\n• Direct Sales show fluctuations, suggesting variable performance and the need for targeted improvements in that channel."

# Add image placeholder on the left side of the slide
left = Inches(0.2)
top = Inches(1.8)
height = prs.slide_height - Inches(3)
width = prs.slide_width * 3 / 5
pic = slide.shapes.add_picture(image_path, left, top, width = width, height = height)

# Add title text spanning the whole width
left = Inches(0)
top = Inches(0)
width = prs.slide_width
height = Inches(1)
title_box = slide.shapes.add_textbox(left, top, width, height)
title_frame = title_box.text_frame
title_frame.margin_top = Inches(0.1)
title_p = title_frame.add_paragraph()
title_p.text = title_text
title_p.font.bold = True
title_p.font.size = Pt(28)
title_p.font.color.rgb = RGBColor(255, 255, 255)
title_p.alignment = PP_PARAGRAPH_ALIGNMENT.CENTER

# Add hardcoded "Key Insights" text and bullet points
left = prs.slide_width * 2 / 3
top = Inches(1.5)
width = prs.slide_width * 1 / 3
height = Inches(4.5)
insights_box = slide.shapes.add_textbox(left, top, width, height)
insights_frame = insights_box.text_frame
insights_p = insights_frame.add_paragraph()
insights_p.text = "Key Insights:"
insights_p.font.bold = True
insights_p.font.size = Pt(24)
insights_p.font.color.rgb = RGBColor(0, 128, 100)
insights_p.alignment = PP_PARAGRAPH_ALIGNMENT.LEFT
insights_frame.add_paragraph()

bullet_p = insights_frame.add_paragraph()
bullet_p.text = bullet_points
bullet_p.font.size = Pt(12)
bullet_p.font.color.rgb = RGBColor(255, 255, 255)
bullet_p.line_spacing = 1.5
`

const slidePrompt = `Use the included code template to create a PPTX slide that follows the template format, but uses the image, company name/title, and document name/subtitle included: ${slideTitleTemplate}. IMPORTANT: Use the Company Name ${slideTitle} as the title_text variable, and use the subtitle_text ${slideSubtitle} as the subtitle_text variable. NEXT, create a SECOND slide using the following code template: ${slideDataVisTemplate} to create a PPTX slide that follows the template format, but uses the company name/title, and document name/subtitle included:
${slideDataVisTemplate}. IMPORTANT: Use the line plot image, that is the second attached image in this message, that you created earlier in the thread as the data_vis_img image, and use the data visualization title that you created earlier for the variable title_text, and the bullet points of insights you created earlier for the bullet_points variable. Output these TWO SLIDES as a .pptx file. Make sure the output is two slides, with each slide matching the respective template given in this message.`

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
				"content": analyzeDataPrompt,
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
			const analyticFileId = messages.data[0].content[0].image_file.file_id

			convertFileToPng(analyticFileId, path.join(__dirname, 'public', filename))

			// AI Insight
			const result = await addMessage(assistant.id, thread.id, insightPrompt)

			if (result.status === 'completed') {
				const message = await openai.beta.threads.messages.list(thread.id)
				const bulletPoints = message.data[0].content[0].text.value
				console.log(`Bullet Points: ${bulletPoints}`)

				const bulletPointsSummary = await addMessage(assistant.id, thread.id, bulletPointsPrompt)

				if (bulletPointsSummary.status === "completed") {
					const message = await openai.beta.threads.messages.list(thread.id)
					const title = message.data[0].content[0].text.value
					console.log(`Title: ${title}`)

					console.log(`Analytic File Id: ${analyticFileId}`)
					console.log(`Slide Prompt: ${slidePrompt}`)

				}
			}

			return { data: filename, status: "completed" }
		} catch (error) {
			return { data: null, status: run.status }
		}

	} else {
		return { data: null, status: run.status }
	}
}

async function addMessage(assistantId, threadId, prompt) {
	await openai.beta.threads.messages.create(threadId, { role: 'user', content: prompt })
	const response = await openai.beta.threads.runs.createAndPoll(threadId, { assistant_id: assistantId })
	return response
}

/**
async function createSlide(assistantId, threadId, prompt, file_id) {
	try {
		await openai.beta.threads.messages.create(threadId, {
			role: 'user',
			content: prompt,
			attachments: [
				{
					file_id: file_id,
					tools: [{ type: 'code_interpreter' }]
				}
			]
		})
	} catch (error) {
		console.log(error)
	}

	return await openai.beta.threads.runs.createAndPoll(threadId, {
		assistant_id: assistantId
	})
}
*/

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
