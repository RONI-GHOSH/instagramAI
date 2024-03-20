require("dotenv").config();
const cron = require('node-cron');
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY']);

// ...

const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// ...

// ...
app.get("/story", async (req, res) =>{

  const response= await gemini(contextprompt)


 // Parse JSON string into JavaScript object
 var jsonObject = JSON.parse(response);

 // Extract fields into variables
 var promptText = jsonObject.prompt;
 var captionText = jsonObject.caption;
res.send(response)
 // Print the extracted values
 console.log("Prompt:", promptText);
 console.log("Caption:", captionText);
 
  await generateImage(promptText, captionText,2)
 
  
});

app.get("/gemini", async (req, res) =>{

   const response= await gemini(contextprompt)
  // Parse JSON string into JavaScript object
  var jsonObject = JSON.parse(response);

  // Extract fields into variables
  var promptText = jsonObject.prompt;
  var captionText = jsonObject.caption;
   res.send(promptText)
  // Print the extracted values
  console.log("Prompt:", promptText);
  console.log("Caption:", captionText);
  
   await generateImage(promptText, captionText,1)
  
    
});

async function runAi(){
   
  console.log('cron is running a job')

  const response= await gemini(contextprompt)
  // Parse JSON string into JavaScript object
  var jsonObject = JSON.parse(response);

  // Extract fields into variables
  var promptText = jsonObject.prompt;
  var captionText = jsonObject.caption;
  
  // Print the extracted values
  console.log("Prompt:", promptText);
  console.log("Caption:", captionText);
  
   await generateImage(promptText, captionText,1)
}

async function gemini(prmpt) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = prmpt

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}









const sharp = require('sharp');
const axios = require('axios');

async function downloadImageAndConvertToJpg(url) {
    try {
        // Download the image as a buffer
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        // Convert the buffer to JPG format
        const jpgBuffer = await sharp(response.data)
            .jpeg()
            .toBuffer();

        return jpgBuffer;
    } catch (error) {
        console.error('Error downloading or converting image:', error);
        throw error;
    }
}


const Replicate = require("replicate");
// import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env["REPLICATE_API_TOKEN"],
});

async function generateImage(prompt,caption,type){
  const output = await replicate.run(  "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
    {
      input: {
        prompt: "A photo of "+prompt+"img",
        num_steps: 50,
        style_name: "Photographic (Default)",
        input_image:     "https://firebasestorage.googleapis.com/v0/b/ai-image-editor-2837b.appspot.com/o/kiara.jpeg?alt=media&token=2eed7ddb-af39-4be4-8523-94dad07570fb",
        num_outputs: 1,
        guidance_scale: 5,
        negative_prompt:
          "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
        style_strength_ratio: 20,
      },
    },
  );
  console.log(output);
  try {
    var url = output[0];
    console.log(url);
    downloadImageAndConvertToJpg(url)
    .then(jpgBuffer => {
        // Use the resulting JPG buffer as needed
       // Use the resulting JPG buffer as needed
        if(type==1){
          postToInsta(jpgBuffer,caption);
        }else{
          postToStory(jpgBuffer,caption);
        }
       
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
  } catch (error) {
    console.log(error);
  }
}

app.get("/post", (req, res) => {
  try {
    postToInsta(
      "null",
    );
  } catch (error) {
    res.send("Post error !", error);
  }

  res.send("Posted!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const CronJob = require("cron").CronJob;

const postToInsta = async (buffer,caption) => {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

  // const imageBuffer = await get({
  //   url:link,
  //   encoding: null,
  // });

  await ig.publish.photo({
    file: buffer,
    caption: caption,
  });
};

const postToStory = async (buffer,caption) => {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

  // const imageBuffer = await get({
  //   url:link,
  //   encoding: null,
  // });
  await ig.publish.photo({
    file: buffer,
    caption: caption,
  });

  await ig.publish.story({
    file: buffer,
  }
    
  )

  
};

// const cronInsta = new CronJob("30 5 * * *", async () => {
//     postToInsta();
// });

// Cron job to run the function twice daily between 8am to 11pm
cron.schedule('0 8,20 * * *', () => {
  runAi()
});

// cronInsta.start();
const contextprompt = 'give me a prompt for image generation for my Instagram AI character girl/female post based on real-life Indian events /festivals(if the festival happening now,if the festival is not happening now,dont include it) or then random human emotions or dressed photos like humans always post or if any viral news is available then react to it like cricket match. My AI character is a beautiful normal college girl from kolkata india, he loves taking images, traveling, and capturing nature. write the prompt in a ["prompt here"]and the caption which should be related to the image and sound like a humanoid Instagram caption(like sometimes it may contain Hindi song lines in hinglish with emoji or bengali song line quotes etc or a normal caption without song)written in english or bengali inside ("caption here"). The response should only contain the prompt and the caption as I need to extract them in JavaScript. Here are some previous topics that my model posted before(to get the context of her personality or not similar repeat post) : ["A pic with a cat, showing she loves animals"," a pic in an expensive cafe"," a selfie in mountain traveling", "A simple smiling face ", "An aesthetic hide face selfie with effect"]. You can mix and randomize and create the response as a human is posting. always give response in json only  dont include any other comment except the prompt and the caption' 
