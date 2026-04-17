window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

const hospitalData = {
    "Bengaluru": [
        {name: "Manipal Hospital", phone: "080-2502-3222"},
        {name: "Apollo Hospital Bannerghatta", phone: "080-2630-4050"},
        {name: "Fortis Hospital Bannerghatta", phone: "080-6621-4444"},
        {name: "Aster CMI", phone: "080-4342-0100"},
        {name: "Narayana Health", phone: "080-7122-2222"}
    ],
    "Hyderabad": [
        {name: "Apollo Hospitals Jubilee Hills", phone: "040-2360-7777"},
        {name: "Yashoda Hospitals", phone: "040-4567-4567"},
        {name: "KIMS", phone: "040-4488-5000"},
        {name: "CARE Hospitals", phone: "040-6165-6565"},
        {name: "AIG Hospitals", phone: "040-4244-4222"}
    ],
    "Chennai": [
        {name: "Apollo Main Hospital", phone: "044-2829-3333"},
        {name: "Fortis Malar", phone: "044-4289-2222"},
        {name: "MIOT International", phone: "044-2249-2288"},
        {name: "Kauvery Hospital", phone: "044-4000-6000"},
        {name: "Billroth Hospitals", phone: "044-4304-2222"}
    ],
    "Ahmedabad": [
        {name: "Apollo Hospitals", phone: "079-6670-1800"},
        {name: "Zydus Hospital", phone: "079-6619-0201"},
        {name: "CIMS Hospital", phone: "079-6777-1000"},
        {name: "Sterling Hospitals", phone: "079-4001-1111"},
        {name: "K D Hospital", phone: "079-6677-0000"}
    ],
    "Mumbai": [
        {name: "Lilavati Hospital", phone: "022-2675-1000"},
        {name: "Kokilaben Dhirubhai Ambani", phone: "022-3099-9999"},
        {name: "Hindujas Hospital", phone: "022-2444-9199"},
        {name: "Nanavati Max Super Speciality", phone: "022-2615-5123"},
        {name: "Fortis Hospital Mulund", phone: "022-4365-4365"}
    ],
    "Pune": [
        {name: "Ruby Hall Clinic", phone: "020-2616-3391"},
        {name: "Jehangir Hospital", phone: "020-6681-9999"},
        {name: "Deenanath Mangeshkar Hospital", phone: "020-4015-1000"},
        {name: "Sahyadri Hospital", phone: "020-6721-5000"},
        {name: "Aditya Birla Memorial", phone: "020-3071-7500"}
    ],
    "Delhi": [
        {name: "AIIMS", phone: "011-2658-8500"},
        {name: "Apollo Indraprastha", phone: "011-2692-5858"},
        {name: "Sir Ganga Ram Hospital", phone: "011-2575-0000"},
        {name: "Fortis Escorts", phone: "011-4713-5000"},
        {name: "Max Super Speciality Saket", phone: "011-2651-5050"}
    ],
    "Kolkata": [
        {name: "Apollo Gleneagles", phone: "033-2320-3040"},
        {name: "AMRI Hospital", phone: "033-6680-0000"},
        {name: "Fortis Hospital Anandapur", phone: "033-6628-4444"},
        {name: "Medica Superpecialty", phone: "033-6652-0000"},
        {name: "Woodlands Hospital", phone: "033-2456-7075"}
    ],
    "Jaipur": [
        {name: "SMS Hospital", phone: "0141-256-0291"},
        {name: "Fortis Escorts", phone: "0141-254-7000"},
        {name: "Narayana Multispeciality", phone: "0141-712-2222"},
        {name: "Manipal Hospital", phone: "0141-515-5205"},
        {name: "RHL Hospital", phone: "0141-451-2222"}
    ],
    "Surat": [
        {name: "BAPS Pramukh Swami Hospital", phone: "0261-278-2000"},
        {name: "Kiran Multi Super Speciality", phone: "0261-716-1111"},
        {name: "Sunshine Global Hospital", phone: "0261-249-1111"},
        {name: "Apple Hospital", phone: "0261-247-4400"},
        {name: "Mahavir Hospital", phone: "0261-246-3000"}
    ]
};

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

    const assistantPanel = document.getElementById('assistantPanel');
    const assistantMessage = document.getElementById('assistantMessage');
    const medicalWidget = document.getElementById('medicalWidget');
    const fireWidget = document.getElementById('fireWidget');
    const policeWidget = document.getElementById('policeWidget');
    const citySelect = document.getElementById('citySelect');
    const hospitalList = document.getElementById('hospitalList');

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

    // Populate hospitals when city changes
    function populateHospitals(cityName) {
        hospitalList.innerHTML = ''; // clear existing
        const hospitals = hospitalData[cityName];
        if(!hospitals) return;

        hospitals.forEach(h => {
            const item = document.createElement('div');
            item.className = 'hospital-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'hospital-name';
            nameSpan.innerText = h.name;
            
            const contactSpan = document.createElement('span');
            contactSpan.className = 'hospital-contact';
            contactSpan.innerText = h.phone;
            
            item.appendChild(nameSpan);
            item.appendChild(contactSpan);
            hospitalList.appendChild(item);
        });
    }

    if(citySelect) {
        citySelect.addEventListener('change', (e) => {
            populateHospitals(e.target.value);
        });
        // Initial populate
        populateHospitals(citySelect.value);
    }
    
    function resetAssistant() {
        assistantPanel.classList.add('hidden');
        medicalWidget.classList.add('hidden');
        fireWidget.classList.add('hidden');
        policeWidget.classList.add('hidden');
    }

    function handleAssistantCategory(category) {
        resetAssistant();
        if(!category) return;

        assistantPanel.classList.remove('hidden');

        if (category === 'medical') {
            assistantMessage.innerText = "Help is on the way. Please stay calm. We found 5 major hospitals in the selected city with specialized emergency care.";
            medicalWidget.classList.remove('hidden');
        } else if (category === 'fire') {
            assistantMessage.innerText = "Evacuate the area immediately if safe. Do not use elevators. A fire rescue team can be reached using the numbers below.";
            fireWidget.classList.remove('hidden');
        } else {
            assistantMessage.innerText = "Please ensure your safety first. Hide in a secure location if there is an active threat. Contact local police using the numbers below.";
            policeWidget.classList.remove('hidden');
        }
    }

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

            // Reveal assistant logic
            handleAssistantCategory(data.category);

        } catch (error) {
            console.error("Failed to fetch", error);
            alert("Failed to connect to the backend ML model.");
        } finally {
            analyzeBtn.innerText = "Process Signal";
            analyzeBtn.disabled = false;
        }
    });

});
