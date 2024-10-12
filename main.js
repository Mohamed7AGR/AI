const typing_form = document.querySelector(".typing_form");
const chat_list = document.querySelector(".chat_list");
const API_Key = "AIzaSyArsiQjdTKg7FvlVhuVLfE4wVbadVbxauk"; // Ensure you keep this secure
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_Key}`;

const showTypingEffect = (text, textElement) => {
    const words = text.split(" ");
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        textElement.innerHTML += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
        }
        window.scrollTo(0, chat_list.scrollHeight);
    }, 75);
};

const generateAPIResponse = async (div, userMessage) => {
    const textElement = div.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        // Check for response status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const apiResponse = data?.candidates[0]?.content?.parts[0]?.text.replace(/\*\*(.*?)\*\*/g, '$1') ;
        showTypingEffect(apiResponse, textElement);
    } catch (error) {
        console.error(error);
        textElement.innerHTML = "Sorry, I couldn't process your request.";
    } finally {
        div.classList.remove("loading");
    }
};

const copyMessage = (copy_Btn) => {
    const messageText = copy_Btn.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText).then(() => {
        copy_Btn.innerText = "done";
        setTimeout(() => { copy_Btn.innerText = "content_copy"; }, 1000);
    }).catch((error) => console.error('Failed to copy text: ', error));
};

const showLoading = (userMessage) => {
    const html = `
        <div class="message_content">
            <img src="images/gemini.svg" alt="AI Image" />
            <p class="text"></p>
            <div class="loading">
                <div class="loading_bar"></div>
                <div class="loading_bar"></div>
                <div class="loading_bar"></div>
            </div>
        </div>
        <span onClick="copyMessage(this)" class="material-symbols-outlined">content_copy</span>
    `;

    const div = document.createElement("div");
    div.classList.add("message", "ingoing", "loading");
    div.innerHTML = html;
    chat_list.appendChild(div);
    window.scrollTo(0, chat_list.scrollHeight);

    generateAPIResponse(div, userMessage);
};

const handleOutGoingChat = () => {
    const userMessage = document.querySelector(".typing_form input").value;

    if (!userMessage) return;

    const html = `
        <div class="message">
            <div class="message_content">
                <img src="images/user.png" alt="User Image" />
                <p class="text">${userMessage}</p>
            </div>
        </div>
    `;

    const div = document.createElement("div");
    div.classList.add("message", "outgoing");
    div.innerHTML = html;
    chat_list.appendChild(div);

    typing_form.reset();
    window.scrollTo(0, chat_list.scrollHeight);

    setTimeout(() => showLoading(userMessage), 500);
};

// Event listener for form submission
typing_form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutGoingChat();
});
