# Automate slide creation using OpenAI and Node.js

![cover](images/cover.jpg)

With the rise of AI tools, we can automate many manual workloads, including creating presentation slides. Developers can generate slide content programmatically by leveraging OpenAI's language models and Node.js. This automation surely will save time. By using OpenAI for content generation and Node.js for orchestration, you can effortlessly streamline the process of creating compelling and informative presentations.

In this post, we will use the Assistant API model from OpenAI to automate slide content creation, Node.js to create the slide document, and GridDB to save the slide information.

## Running the Project

Clone the source code from this [GitHub repository](https://github.com/junwatu/ai-slides-creator).

```shell
git clone https://github.com/junwatu/ai-slides-creator.git
```

You also need to install [Node.js](#1-installing-nodejs) and [GridDB](#2-setting-up-griddb) for this project to run. If the software requirements are installed, change the directory to the `apps` project directory and then install all the dependencies:

```shell
cd ai-slides-creator
cd apps
npm install 
```

Create an `.env` file and copy all environment variables from the `.env.example` file. You need an OpenAI key for this project, please look in [this section](#3-configuring-openai) on how to get the key.

```ini
OPENAI_API_KEY=sk-proj-secret
VITE_APP_URL=http://localhost:3000
```

You can change the `VITE_APP_URL` to your needs and then run the project by running this command:

```shell
npm run start:build
```

Then open the browser and go to the app URL. Select the data sample and then click the **Create Slide** button.

![create slide button](images/create-slide-button.png)

## Getting Started

### 1. Installing Node.js

This project will run on the Node.js platform. You need to install it from [here](https://nodejs.org/en/download). For this project, we will use the `nvm` package manager and Node.js v16.20.2
LTS version.

```shell
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# download and install Node.js
nvm install 16

# verifies the right Node.js version is in the environment
node -v # should print `v16.20.2`

# verifies the right NPM version is in the environment
npm -v # should print `8.19.4``
```

To connect Node.js and GridDB database, you need the [gridb-node-api](https://github.com/nodejs/node-addon-api) npm package which is a Node.js binding developed using GridDB C Client and Node addon API.

### 2. Setting Up GridDB

We will use the GridDB database to save recipes and it's nutrition analysis. Please look at the [guide](https://docs.griddb.net/latest/gettingstarted/using-apt/#install-with-apt-get) for detailed installation. We will use Ubuntu 20.04 LTS here.

Run GridDB and check if the service is running. Use this command:

```shell
sudo systemctl status gridstore
```

If not running try to run the database with this command:

```shell
sudo systemctl start gridstore
```

### 3. Setup OpenAI Keys

The OpenAI key is on a project basis, so we need to create a project first in the OpenAI platform.

![create openai project](images/create-openai-project.png)

To access any OpenAI services, you need a valid key. Go to this [link](https://platform.openai.com/api-keys) and create a new OpenAI key, make sure to select the right project.

![create openai key](images/create-api-key.png)

You need also to enable any models that you use on a project. For this project, we will need the `gpt-4o` model. Go to the project settings and then select which models to be enabled.

![models](images/models.png)

You should save the OpenAI key on the `.env` file and make sure not to include it in version control by adding it to the `.gitignore`.

### 4. Setup AI Assistant

This project need an AI assistant. You need to setup it first, go to the project dashboard and create a new assistant.

![create a new assistant](images/create-ai-assistant.png)

You need to pay attention to the **Instruction** field because it will dictate the behaviour of the AI assistant. This is the instruction used for this assistant:

```text
You are a data scientist assistant. When given data and a query, write the proper code and create the proper visualization.
```

Another setup is you need to enable **Code Interpeter**, means the assistant will have capability to execute code in a sandbox environtment, basically enable your prompt to execute code. For more information on this feature, please click [here](https://platform.openai.com/docs/assistants/tools/code-interpreter).

After the AI assistant creation, you need to copy the assistant ID. This ID will be used as a reference in the code where you can send messages to the assistant.

```js
const dataScienceAssistantId = "asst_FOqRnMVXw0WShTSGw70NZJAX"
```

## Data Examples

This project will use JSON data samples from car spare parts sales. The data reside in the `data` directory. This is [the spare part sales data for the year 2020 to the year 2023](https://raw.githubusercontent.com/junwatu/ai-slides-creator/main/apps/data/spare-part-sales-2022-2024.json):

```json
[
 {
  "Year": 2020,
  "Quarter": "Q1",
  "Distribution channel": "Online Sales",
  "Revenue ($M)": 2.10,
  "Costs ($M)": 1.905643,
  "Customer count": 190,
  "Time": "2020 Q1",
  "Product Category": "Engine Parts",
  "Region": "North America",
  "Units Sold": 900,
  "Average Sale Price ($)": 2333,
  "Discounts Given ($)": 14000,
  "Returns ($)": 4500,
  "Customer Satisfaction Rating": 8.2,
  "Salesperson": "SP120",
  "Marketing Spend ($)": 18000
 },
 {
  "Year": 2020,
  "Quarter": "Q1",
  "Distribution channel": "Direct Sales",
  "Revenue ($M)": 2.15,
  "Costs ($M)": 2.004112,
  "Customer count": 200,
  "Time": "2020 Q1",
  "Product Category": "Brakes",
  "Region": "Europe",
  "Units Sold": 1000,
  "Average Sale Price ($)": 2150,
  "Discounts Given ($)": 12000,
  "Returns ($)": 5000,
  "Customer Satisfaction Rating": 8.0,
  "Salesperson": "SP121",
  "Marketing Spend ($)": 19000
 },
 ...
 {
  "Year": 2024,
  "Quarter": "Q2",
  "Distribution channel": "Direct Sales",
  "Revenue ($M)": 3.15,
  "Costs ($M)": 2.525112,
  "Customer count": 390,
  "Time": "2024 Q2",
  "Product Category": "Brakes",
  "Region": "Europe",
  "Units Sold": 1500,
  "Average Sale Price ($)": 2095,
  "Discounts Given ($)": 22000,
  "Returns ($)": 17000,
  "Customer Satisfaction Rating": 9.1,
  "Salesperson": "SP144",
  "Marketing Spend ($)": 38000
 }
]
```

Ideally, the data should be uploaded via the user interface. However, for simplicity in this project, the data will be directly processed when you choose the data samples from the data samples dropdown.

**How OpenAI can process the file directly?**

The answer is, you need to upload manually the data sample files first. Go to the project dashboard and upload the files.

![upload files](images/upload-files.png)

You need to pay attention to the purpose of the uploaded files. In this project the data sample files are used as an **assistants** files.

Later these files id will be used to identify which file is used when the user select the data sample from the dropwdon.

## Generating Content

When the user select the data sample and click the **Create Slide** button. The Assistant API will generate the image and text for the content slide. These are few important steps in the code to generate the slide content:

### 1. Analyze Data Samples

OpenAI will analyze the selected data sample then it will calculate the profit by quarter and year then visualize the plot.

The prompt for this process is:

```js
const analyzeDataPrompt = "Calculate profit (revenue minus cost) by quarter and year, and visualize as a line plot across the distribution channels, where the colors of the lines are green, light red, and light blue"
```

And this code will process the prompt and the selected file (see `fileId`)

```js
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
```

From this code, you can get the plot image. It will be saved in the public directory and will be used in the slide content.

### 2. Generate Bullet Points

The AI Assistant will give an insight about the data and will generate bullet points. This is the prompt to instruct AI to give two insight about the data:

```js
const insightPrompt = `Give me two medium length sentences (~20-30 words per sentence) of the most important insights from the plot you just created, save each sentence as item in one array. Give me a raw array, no formatting, no commentary. These will be used for a slide deck, and they should be about the 'so what' behind the data.`
```

### 3. Generate Insight Title

The last step is generating title for the insight. This is the prompt that responsible for that:

```js
const titlePrompt = "Given the plot and bullet points you created,come up with a very brief title only for a slide. It should reflect just the main insights you came up with."
```

The full code for generating slide content is in the [`libs/ai.js`](https://github.com/junwatu/ai-slides-creator/blob/main/apps/libs/ai.js) file.

## Generate Slides

This project use [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) package to generate the slides. You can look the full code in the `libs/pptx.js` file. Just note that the generated presentation file will be saved in the `public` directory.

## Save Slides Information

To save the slides information, we will use the GridDB database.

[draft]

## Server Routes

[draft]

## Further Enhancements

[draft]
