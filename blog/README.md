# Automate slide creation using OpenAI and Node.js

![cover](images/cover.jpg)

With the rise of AI tools, we can automate many manual workloads, including creating presentation slides. Developers can generate slide content programmatically by leveraging OpenAI's language models and Node.js. This automation surely will save time. By using OpenAI for content generation and Node.js for orchestration, you can effortlessly streamline the process of creating compelling and informative presentations.

In this post, we will use the Assistant API and DALL-E 2 model from OpenAI to automate slide content creation, Node.js to create the slide document, and GridDB to save the slide information.

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

Then open the browser and go to the app URL.

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

You need also to enable any models that you use on a project. For this project, we will need `gpt-4o` and `dall-e-2` models. Go to the project settings and then select which models to be enabled.

![models](images/models.png)

You should save the OpenAI key on the `.env` file and make sure not to include it in version control by adding it to the `.gitignore`.

## Data Examples

This project will use JSON data samples from car spare parts sales. The data reside in the `data` directory.

For example, [the spare part sales data for the year 2020 to the year 2023](https://raw.githubusercontent.com/junwatu/ai-slides-creator/main/apps/data/spare-part-sales-2022-2024.json):

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

Ideally, the data should be uploaded via the user interface. However, for simplicity in this project, the data will be directly processed when you choose the data samples from the dropdown and click the **Generate Slide** button.

## Generating Content

- Use the Assistant API to generate the text content for each slide. This involves prompting the API with a topic and receiving structured content that can be used in a presentation format.

## Creating Visuals with DALL-E 3

- Use DALL-E 3 to create images based on the text generated by the Assistant API. This is done by sending text prompts to DALL-E 3 and receiving images that visually represent the slide content.

## Combining Text and Images

- Use a Python script to combine the text and images into a cohesive slide format. The script uses the Pillow library to place text and images onto a slide template.

## Outputting the Slides

- The final slides are saved as image files which can be compiled into a presentation using tools like PowerPoint or Google Slides.
