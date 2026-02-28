// Use the new openapi port we created
const API_SERVER = 'https://apikh.bkpay.org/pay/info';

let countdownInterval = null;
let orderExpireTimeMs = 0;
let totalDurationMs = 0;

document.addEventListener('DOMContentLoaded', () => {
    initI18n(); // Init translations

    const urlParams = new URLSearchParams(window.location.search);
    const tradeNo = urlParams.get('trade_no') || urlParams.get('out_trade_no');

    if (!tradeNo) {
        showError(t('missing_trade_no'));
        return;
    }

    fetchOrderData(tradeNo);
});

async function fetchOrderData(tradeNo) {
    try {
        const response = await fetch(`${API_SERVER}/?trade_no=${tradeNo}&type=qr`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const res = await response.json();

        if (parseInt(res.code) !== 0) {
            showError(res.msg || t('fetch_fail_desc'));
            return;
        }

        renderOrder(res.data, res.msg);

    } catch (err) {
        console.error(err);
        showError(t('network_error'));
    }
}

function renderOrder(data, msg) {
    document.getElementById('loading-view').style.display = 'none';
    document.getElementById('content-view').style.display = 'block';

    const currAmount = parseFloat(data.amount).toFixed(2);
    document.getElementById('order-amount').innerText = currAmount;

    // Determine currency symbol
    let currencySymbol = '¥';
    if (data.currency && data.currency.toUpperCase() === 'USD') currencySymbol = '$';
    else if (data.currency && data.currency.toUpperCase() === 'KHR') currencySymbol = '៛';
    else if (data.currency && data.currency.toUpperCase() === 'THB') currencySymbol = '฿';

    const currEl = document.getElementById('order-currency');
    if (currEl) currEl.innerText = currencySymbol;

    document.getElementById('order-trade-no').innerText = data.trade_no;

    // Display raw created_at formatted purely as a fallback 
    let d = new Date(data.created_at * 1000);
    document.getElementById('order-time').innerText = d.toLocaleString();

    // Handle Bank Info if available
    if (data.card_number || data.banktransf_account) {
        document.getElementById('bank-info-container').style.display = 'block';
        document.getElementById('order-account').innerText = data.card_number || data.banktransf_account;

        const bankName = data.bank_name || data.banktransf_bankname || '--';
        document.getElementById('order-bank').innerText = bankName;

        const accountNameEl = document.getElementById('order-account-name');
        if (accountNameEl) {
            accountNameEl.innerText = data.account_name || '--';
        }

        document.getElementById('order-title').innerText = t('transfer_to_account');
    } else {
        document.getElementById('order-title').innerText = t('receive_account_info');
    }

    // Handle QR Code if QR code link provided in ext_code or channel includes qr
    const qrcodeContainer = document.getElementById('qrcode-container');
    if (data.qrcode) {
        qrcodeContainer.style.display = 'flex';
        document.getElementById('order-title').innerText = t('scan_to_pay');

        // Generate QR Code image automatically
        const qrPlaceholder = document.querySelector('.qrcode-placeholder');
        qrPlaceholder.style.border = 'none';
        qrPlaceholder.style.background = 'transparent';
        qrPlaceholder.style.display = 'flex';
        qrPlaceholder.style.justifyContent = 'center';
        qrPlaceholder.innerHTML = ''; // clear placeholder text
        new QRCode(qrPlaceholder, {
            text: data.qrcode,
            width: 220,
            height: 220,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });

        // Show string below qr code
        let qrTextContainer = document.getElementById('qrcode-text-container');
        if (!qrTextContainer) {
            qrTextContainer = document.createElement('div');
            qrTextContainer.id = 'qrcode-text-container';
            qrTextContainer.style.marginTop = '16px';
            qrTextContainer.style.width = '100%';
            qrTextContainer.innerHTML = `
                <button class="copy-btn" id="save-qr-btn" style="margin-top:12px; width:100%; padding:10px; font-size:14px; background: #4F46E5; color: white;" data-i18n="btn_save_qr">Save QR Code</button>
            `;
            qrcodeContainer.appendChild(qrTextContainer);

            document.getElementById('save-qr-btn').addEventListener('click', function () {
                // Find the canvas inside qrcode-placeholder
                const qrCanvas = qrPlaceholder.querySelector('canvas');
                if (qrCanvas) {
                    const exportCanvas = document.createElement('canvas');
                    const ctx = exportCanvas.getContext('2d');

                    const padding = 20;
                    const textHeight = 84;
                    exportCanvas.width = qrCanvas.width + (padding * 2);
                    exportCanvas.height = qrCanvas.height + (padding * 2) + textHeight;

                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

                    ctx.drawImage(qrCanvas, padding, padding);

                    ctx.fillStyle = "#374151";
                    ctx.font = "15px sans-serif";
                    ctx.textAlign = "center";

                    const centerX = exportCanvas.width / 2;
                    let textY = qrCanvas.height + padding + 36;

                    ctx.fillText('Order: ' + data.trade_no, centerX, textY);

                    textY += 26;
                    const dObj = new Date(data.created_at * 1000);
                    const dStr = dObj.getFullYear() + "-" + String(dObj.getMonth() + 1).padStart(2, '0') + "-" + String(dObj.getDate()).padStart(2, '0') + " " + String(dObj.getHours()).padStart(2, '0') + ":" + String(dObj.getMinutes()).padStart(2, '0') + ":" + String(dObj.getSeconds()).padStart(2, '0');
                    ctx.fillText('Time: ' + dStr, centerX, textY);

                    const dataUrl = exportCanvas.toDataURL("image/png");
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `QR_Order_${data.trade_no}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } else {
                    alert('QR code not fully generated yet.');
                }
            });
        }
    } else if (data.channel && (data.channel.includes('qr') || data.channel.includes('alipay') || data.channel.includes('wechat'))) {
        qrcodeContainer.style.display = 'flex';
        document.getElementById('order-title').innerText = t('scan_to_pay');
    }

    // Status handling
    const statusEl = document.getElementById('order-status');
    const statusMsgEl = document.getElementById('status-message');
    const countdownBox = document.getElementById('countdown-box');

    if (data.status == 1 || data.status == 2) {
        statusEl.innerText = t('status_success');
        statusEl.className = 'status-badge success';
        statusMsgEl.innerText = msg && msg !== 'Success' ? msg : "The order has been paid. No need to pay again.";
        countdownBox.style.display = 'none';

        // Hide QR Code and Bank info if paid to prevent paying again
        document.getElementById('bank-info-container').style.display = 'none';
        qrcodeContainer.style.display = 'none';
    } else {
        // Pending Payment -> Start 15m Countdown Timer
        statusEl.innerText = t('status_wait');
        statusEl.className = 'status-badge';
        statusMsgEl.innerText = t('warning_msg');
        countdownBox.style.display = 'flex';

        // Expiration is created timestamp + valid_tTime seconds (in ms)
        // Default to 15 mins if valid_tTime is not present for some reason
        const validTimeSec = data.valid_tTime ? parseInt(data.valid_tTime) : 15 * 60;
        totalDurationMs = validTimeSec * 1000;
        orderExpireTimeMs = (data.created_at + validTimeSec) * 1000;
        startCountdown();
    }
}

function startCountdown() {
    const timeDisplay = document.getElementById('countdown-time');
    const countdownBox = document.getElementById('countdown-box');
    const progressCircle = document.getElementById('timer-progress');
    const statusEl = document.getElementById('order-status');
    const statusMsgEl = document.getElementById('status-message');

    function update() {
        const nowMs = Date.now();
        const diffMs = orderExpireTimeMs - nowMs;

        if (diffMs <= 0) {
            // Expired
            clearInterval(countdownInterval);
            countdownBox.classList.add('expired');
            if (progressCircle) progressCircle.style.strokeDashoffset = 283;
            timeDisplay.innerText = "00:00";

            // Update UI State
            statusEl.innerText = t('status_expired');
            statusEl.className = 'status-badge expired';
            statusMsgEl.innerText = t('expired_msg');
            statusMsgEl.style.color = 'var(--error)';

            // Hide sensitive payment data as it is expired
            document.getElementById('bank-info-container').style.display = 'none';
            document.getElementById('qrcode-container').style.display = 'none';
            return;
        }

        // Calculate Minutes and Seconds
        const totalSeconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        timeDisplay.innerText =
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        // Calculate stroke offset
        if (progressCircle && totalDurationMs > 0) {
            const fraction = diffMs / totalDurationMs;
            // Full circle is 0 offset, empty is 283 offset
            const offset = 283 - (283 * fraction);
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    update(); // fire immediately
    countdownInterval = setInterval(update, 1000);
}

function showError(msg) {
    document.getElementById('loading-view').style.display = 'none';
    document.getElementById('error-view').style.display = 'block';

    document.getElementById('error-title').innerText = t('fetch_fail_title');
    document.getElementById('error-message').innerText = msg;
}

function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = t('btn_copied');
        btn.style.background = '#D1FAE5';
        btn.style.color = '#059669';

        setTimeout(() => {
            btn.innerText = t('btn_copy');
            btn.style.background = '#EEF2FF';
            btn.style.color = '#4F46E5';
        }, 2000);
    }).catch(err => {
        alert(t('copy_fail'));
    });
}
