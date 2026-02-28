// Use the new openapi port we created
const API_SERVER = 'https://apikh.bkpay.org/pay/info';

let countdownInterval = null;
let orderExpireTimeMs = 0;

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

        if (res.code !== 0) {
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

    document.getElementById('order-amount').innerText = parseFloat(data.amount).toFixed(2);
    document.getElementById('order-trade-no').innerText = data.trade_no;

    // Display raw created_at formatted purely as a fallback 
    let d = new Date(data.created_at * 1000);
    document.getElementById('order-time').innerText = d.toLocaleString();

    // Handle Bank Info if available
    if (data.banktransf_account) {
        document.getElementById('bank-info-container').style.display = 'block';
        document.getElementById('order-account').innerText = data.banktransf_account;
        document.getElementById('order-bank').innerText = data.banktransf_bankname || '--';
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
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Show string below qr code
        let qrTextContainer = document.getElementById('qrcode-text-container');
        if (!qrTextContainer) {
            qrTextContainer = document.createElement('div');
            qrTextContainer.id = 'qrcode-text-container';
            qrTextContainer.style.marginTop = '12px';
            qrTextContainer.innerHTML = `
                <div style="background:#f3f4f6; padding:8px; border-radius:6px; font-size:12px; color:#4b5563; word-break:break-all;" id="qrcode-text">${data.qrcode}</div>
                <button class="copy-btn" style="margin-top:8px;" onclick="copyText('qrcode-text')" data-i18n="btn_copy">Copy String</button>
            `;
            qrcodeContainer.appendChild(qrTextContainer);
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

        // Expiration is created timestamp + 15 minutes (in ms)
        orderExpireTimeMs = (data.created_at + 15 * 60) * 1000;
        startCountdown();
    }
}

function startCountdown() {
    const timeDisplay = document.getElementById('countdown-time');
    const countdownBox = document.getElementById('countdown-box');
    const statusEl = document.getElementById('order-status');
    const statusMsgEl = document.getElementById('status-message');

    function update() {
        const nowMs = Date.now();
        const diffMs = orderExpireTimeMs - nowMs;

        if (diffMs <= 0) {
            // Expired
            clearInterval(countdownInterval);
            countdownBox.classList.add('expired');
            timeDisplay.innerText = t('time_out');

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
