let recognition = null;
let isListening = false;

function toggleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById("mic-btn");

    if (!SpeechRecognition) {
        alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
        return;
    }

    if (isListening) {
        recognition?.stop();
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = input.value ? input.value.trim() + " " : "";

    recognition.onstart = () => {
        isListening = true;
        micBtn?.classList.add("listening");
    };
    recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interim += transcript;
            }
        }
        input.value = (finalTranscript + interim).trim();
    };
    recognition.onerror = () => {
        isListening = false;
        micBtn?.classList.remove("listening");
    };
    recognition.onend = () => {
        isListening = false;
        micBtn?.classList.remove("listening");
    };

    recognition.start();
}
