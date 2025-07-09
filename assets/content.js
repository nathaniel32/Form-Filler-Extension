class ExtensionController {
    constructor() {
        this.userButton = document.createElement('button');
        this.setupButtonListeners();
        this.init();
    }

    setupButtonListeners() {
        const normalBg = 'hsla(134, 60.8%, 41%, 0.35)';
        const hoverBg = 'hsla(134, 60.8%, 41%, 1.0)';

        this.userButton.style.transition = 'background-color 0.3s ease';

        this.userButton.addEventListener('mouseenter', () => {
            this.userButton.style.backgroundColor = hoverBg;
        });

        this.userButton.addEventListener('mouseleave', () => {
            this.userButton.style.backgroundColor = normalBg;
        });

        this.userButton.addEventListener('click', () => {
            const event = new CustomEvent('callExtensionFormFiller');
            window.dispatchEvent(event);
        });
    }

    init() {
        this.listenToCustomEvent();
        this.listenToMessages();
        this.addFillButton();
    }

    listenToCustomEvent() {
        window.addEventListener('callExtensionFormFiller', () => {
            const fields = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
            const result = [];

            fields.forEach(field => {
                let label = null;

                // 1. Coba cari label dengan atribut for
                if (field.id) {
                    const labelElement = document.querySelector(`label[for="${field.id}"]`);
                    if (labelElement) {
                        label = labelElement.innerText.trim();
                    }
                }

                // 2. Coba cari label sebagai parent atau grandparent
                if (!label) {
                    const parentLabel = field.closest('label');
                    if (parentLabel) {
                        label = parentLabel.innerText.trim();
                    }
                }

                // 3. Coba cari elemen sebelumnya yang kemungkinan mengandung teks label
                if (!label) {
                    const previous = field.previousElementSibling;
                    if (previous && previous.innerText) {
                        label = previous.innerText.trim();
                    }
                }

                // 4. Fallback terakhir: placeholder atau name
                if (!label) {
                    label = field.placeholder || field.name || null;
                }

                result.push({
                    tag: field.tagName.toLowerCase(),
                    type: field.type || null,
                    name: field.name || null,
                    label,
                    value: field.value
                });

                if (label && (field.tagName.toLowerCase() === 'textarea' || field.type === 'text' || field.type === 'search')) {
                    field.value = `${label} (Autofill)`;
                }
            });

            console.log(result);
        });
    }

    listenToMessages() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.log) {
                console.log('FE:', message.log);
            } else if (message.active != null) {
                console.log("Status: " + message.active);
                if (message.active) {
                    this.addFillButton();
                } else {
                    if (this.userButton.parentElement) {
                        this.userButton.remove();
                    }
                }
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
            console.log("FE Status: " + result);
            return result;
        } catch (error) {
            console.log("FE Error: " + error.message);
            return false;
        }
    }

    async addFillButton() {
        const isActive = await this.getActiveState();
        if (isActive) {
            this.userButton.textContent = 'Fill Out Form';

            Object.assign(this.userButton.style, {
                position: 'fixed',
                top: '5px',
                right: '5px',
                zIndex: 9999,
                padding: '10px',
                backgroundColor: 'hsla(134, 60.8%, 41%, 0.35)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            });

            if (!this.userButton.parentElement) {
                document.body.appendChild(this.userButton);
            }
        } else {
            console.log("FE: Not active!")
            if (this.userButton.parentElement) {
                this.userButton.remove();
            }
        }
    }
}

new ExtensionController();