const input = document.getElementById("message");
const chat = document.getElementById("chat");

let stickToBottom = true;
const BOTTOM_THRESHOLD = 100;

chat.addEventListener("scroll", () => {
    const distanceFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
    stickToBottom = distanceFromBottom < BOTTOM_THRESHOLD;
});

function autoScrollChat(smooth = true) {
    if (!stickToBottom) return;
    if (smooth) {
        chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    } else {
        chat.scrollTop = chat.scrollHeight;
    }
}
