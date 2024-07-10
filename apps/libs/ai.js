import OpenAI from "openai";

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

	console.log(run)
	if (run.status === "completed") {
		const messages = await openai.beta.threads.messages.list(thread.id)
		console.log(messages.data[0].content[0].image_file)
	}

}

