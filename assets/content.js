class ExtensionController {
    constructor() {
        this.init();
    }

    init() {
        this.listenToCustomEvent();
        this.listenToMessages();
        this.addFillButton();
    }

    listenToCustomEvent() {
        window.addEventListener('callExtensionFormFiller', () => {
            alert('Fungsi di dalam ekstensi berhasil dipanggil!');
        });
    }

    listenToMessages() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.log) {
                console.log('FE:', message.log);
            }
        });
    }

    async getActiveState() {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.local.get("filler_extension", (data) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(data?.filler_extension?.active ?? false);
                    }
                });
            });
            console.log("Currently active: " + result);
            return result;
        } catch (error) {
            console.log("Error: " + error.message);
            return false;
        }
    }

    async addFillButton() {
        const isActive = await this.getActiveState();
        if (isActive) {
            const button = document.createElement('button');
            button.textContent = 'Trigger Extension Function from Website';

            Object.assign(button.style, {
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 9999,
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            });

            button.addEventListener('click', () => {
                const event = new CustomEvent('callExtensionFormFiller');
                window.dispatchEvent(event);
            });

            document.body.appendChild(button);
        }
    }
}

new ExtensionController();