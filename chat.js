// config
let _config = {
  openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
  openAI_model: "gpt-4o-mini",
  ai_instruction: `you are teacher gives questions about Javascript.
  output should be in html format,
  no markdown format, answer directly.`,
  response_id: "",
};

// send user message to OpenAI API
async function sendOpenAIRequest(text) {
  let requestBody = {
    model: _config.openAI_model,
    input: text,
    instructions: _config.ai_instruction,
    previous_response_id: _config.response_id,
  };

  if (_config.response_id.length === 0) {
    requestBody = {
      model: _config.openAI_model,
      input: text,
      instructions: _config.ai_instruction,
    };
  }

  try {
    const response = await fetch(_config.openAI_api, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    let output = data.output[0].content[0].text;
    _config.response_id = data.id;

    return output;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}


const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");


async function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // Show user's message
  addMessage(message, "user");
  userInput.value = "";

  // Temporary loading message
  addMessage("Typing...", "bot");

  try {
    const reply = await sendOpenAIRequest(message);

    // Remove the typing bubble
    chatBox.lastChild.remove();

    // Add the AI's reply
    addMessage(reply, "bot");

  } catch (err) {
    chatBox.lastChild.remove();
    addMessage("⚠️ Error connecting to AI server.", "bot");
  }
}


function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  
  msg.innerHTML = text;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
