document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const transcriptInput = document.getElementById('transcriptInput');
    const speechStatus = document.getElementById('speechStatus');
    
    const resultsPanel = document.getElementById('resultsPanel');
    const priorityLabel = document.getElementById('priorityLabel');
    const barCritical = document.getElementById('barCritical');
    const barNormal = document.getElementById('barNormal');
    const pctCritical = document.getElementById('pctCritical');
    const pctNormal = document.getElementById('pctNormal');
    const latencyValue = document.getElementById('latencyValue');

    let recognition;
    let isRecording = false;

    // Check for browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            recordBtn.innerHTML = '🛑 Stop Recording';
            recordBtn.classList.add('recording');
            speechStatus.innerText = "Listening to emergency audio...";
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                transcriptInput.value += finalTranscript + ' ';
            }
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            speechStatus.innerText = "Error: " + event.error;
            stopRecording();
        };

        recognition.onend = () => {
            stopRecording();
        };

    } else {
        recordBtn.style.display = 'none';
        speechStatus.innerText = "Web Speech API not supported in this browser. Please type manually.";
    }

    function stopRecording() {
        if(recognition && isRecording) {
            recognition.stop();
        }
        isRecording = false;
        recordBtn.innerHTML = '🎙️ Record Voice';
        recordBtn.classList.remove('recording');
        speechStatus.innerText = "";
    }

    recordBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            transcriptInput.value = ''; // clear on fresh record
            recognition.start();
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        const text = transcriptInput.value.trim();
        if(!text) {
            alert("Please provide some text or use the voice recorder first!");
            return;
        }

        analyzeBtn.innerText = "Processing...";
        analyzeBtn.disabled = true;

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transcript: text })
            });

            const data = await response.json();
            
            if(data.error) {
                alert("Server Error: " + data.error);
                return;
            }

            // display results
            resultsPanel.classList.remove('hidden');
            
            let critPct = (data.critical_confidence * 100).toFixed(1);
            let normPct = (data.non_critical_confidence * 100).toFixed(1);

            // Animate bars
            barCritical.style.width = critPct + '%';
            barNormal.style.width = normPct + '%';
            
            pctCritical.innerText = critPct + '%';
            pctNormal.innerText = normPct + '%';
            latencyValue.innerText = data.latency_ms + ' ms';

            if(data.critical) {
                priorityLabel.innerText = "PRIORITY 1: CRITICAL";
                priorityLabel.className = "priority-critical";
            } else {
                priorityLabel.innerText = "PRIORITY 2: NORMAL";
                priorityLabel.className = "priority-normal";
            }

        } catch (error) {
            console.error("Failed to fetch", error);
            alert("Failed to connect to the backend ML model.");
        } finally {
            analyzeBtn.innerText = "Process Signal";
            analyzeBtn.disabled = false;
        }
    });
});
