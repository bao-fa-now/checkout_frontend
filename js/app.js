const API_SERVER = 'https://apikh.bkpay.org/pay/info';

let countdownInterval = null;
let pollingInterval = null;
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

async function fetchOrderData(tradeNo, isPolling = false) {
    try {
        const response = await fetch(`${API_SERVER}/?trade_no=${encodeURIComponent(tradeNo)}&type=qr`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });

        const res = await response.json();

        if (parseInt(res.code) !== 0) {
            if (!isPolling) showError(res.msg || t('fetch_fail_desc'));
            return;
        }

        renderOrder(res.data, res.msg, tradeNo);

    } catch (err) {
        console.error(err);
        if (!isPolling) {
            const detail = (err && err.message) ? String(err.message) : String(err);
            showError(`${t('network_error')}\n${detail}`);
        }
    }
}

function renderOrder(data, msg, tradeNo) {
    document.getElementById('loading-view').style.display = 'none';
    // 如果之前轮询/首次请求失败显示过错误，这里成功后必须隐藏
    const errView = document.getElementById('error-view');
    if (errView) errView.style.display = 'none';
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

    // Handle Bank Info if available
    const orderTitleEl = document.getElementById('order-title');
    if (data.card_number || data.banktransf_account) {
        document.getElementById('bank-info-container').style.display = 'block';
        document.getElementById('order-account').innerText = data.card_number || data.banktransf_account;

        const bankName = data.bank_name || data.banktransf_bankname || '--';
        document.getElementById('order-bank').innerText = bankName;

        const accountNameEl = document.getElementById('order-account-name');
        if (accountNameEl) {
            accountNameEl.innerText = data.account_name || '--';
        }

        if (orderTitleEl) orderTitleEl.innerText = t('transfer_to_account');
    } else {
        if (orderTitleEl) orderTitleEl.innerText = t('receive_account_info');
    }

    // Handle QR Code if QR code link provided in ext_code or channel includes qr
    const qrcodeContainer = document.getElementById('qrcode-container');
    if (data.qrcode) {
        qrcodeContainer.style.display = 'flex';
        if (orderTitleEl) orderTitleEl.innerText = t('scan_to_pay');

        // Generate QR Code image automatically
        const qrPlaceholder = document.querySelector('.qrcode-placeholder');
        if (qrPlaceholder.innerHTML.indexOf('canvas') === -1) {
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
                correctLevel: QRCode.CorrectLevel.M
            });

            // 页面二维码加斜向红色水印
            qrPlaceholder.style.position = 'relative';
            let wmEl = document.getElementById('qr-watermark');
            if (!wmEl) {
                wmEl = document.createElement('div');
                wmEl.id = 'qr-watermark';
                wmEl.style.position = 'absolute';
                wmEl.style.left = '50%';
                wmEl.style.top = '50%';
                wmEl.style.transform = 'translate(-50%, -50%) rotate(-36deg)';
                wmEl.style.color = 'rgba(220, 38, 38, 0.72)';
                wmEl.style.fontSize = '16px';
                wmEl.style.fontWeight = '800';
                wmEl.style.whiteSpace = 'nowrap';
                wmEl.style.pointerEvents = 'none';
                wmEl.style.userSelect = 'none';
                qrPlaceholder.appendChild(wmEl);
            }
            wmEl.innerText = 'សូមកុំកែប្រែចំនួនទឹកប្រាក់ដែរមាននៅលើ QR';

            // Define common download logic function
            function processQrDownload() {
                const qrCanvas = qrPlaceholder.querySelector('canvas') || qrPlaceholder.querySelector('img');
                if (!qrCanvas) {
                    alert('QR code not fully generated yet.');
                    return;
                }

                const exportCanvas = document.createElement('canvas');
                const ctx = exportCanvas.getContext('2d');

                const padding = 20;
                const textHeight = 84;
                // If it's an img instead of canvas (some older browsers fallback)
                let sourceW = qrCanvas.width || qrCanvas.naturalWidth || 180;
                let sourceH = qrCanvas.height || qrCanvas.naturalHeight || 180;

                exportCanvas.width = sourceW + (padding * 2);
                exportCanvas.height = sourceH + (padding * 2) + textHeight;

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

                ctx.drawImage(qrCanvas, padding, padding, sourceW, sourceH);

                ctx.fillStyle = "#374151";
                ctx.font = "15px sans-serif";
                ctx.textAlign = "center";

                const centerX = exportCanvas.width / 2;
                let textY = sourceH + padding + 36;

                ctx.fillText('Order: ' + data.trade_no, centerX, textY);

                textY += 26;
                const dObj = new Date(data.created_at * 1000);
                const dStr = dObj.getFullYear() + "-" + String(dObj.getMonth() + 1).padStart(2, '0') + "-" + String(dObj.getDate()).padStart(2, '0') + " " + String(dObj.getHours()).padStart(2, '0') + ":" + String(dObj.getMinutes()).padStart(2, '0') + ":" + String(dObj.getSeconds()).padStart(2, '0');
                ctx.fillText('Time: ' + dStr, centerX, textY);

                // 导出图二维码区域叠加同款水印
                ctx.save();
                ctx.translate(padding + sourceW / 2, padding + sourceH / 2);
                ctx.rotate(-Math.PI / 5);
                ctx.fillStyle = 'rgba(220, 38, 38, 0.72)';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('សូមកុំកែប្រែចំនួនទឹកប្រាក់ដែរមាននៅលើ QR', 0, 0);
                ctx.restore();

                const dataUrl = exportCanvas.toDataURL("image/png");
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `QR_Order_${data.trade_no}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            // Make the QR Code itself clickable to download
            qrPlaceholder.style.cursor = 'pointer';
            qrPlaceholder.onclick = function () {
                processQrDownload();
            };

            // Show string below qr code
            let qrTextContainer = document.getElementById('qrcode-text-container');
            if (!qrTextContainer) {
                qrTextContainer = document.createElement('div');
                qrTextContainer.id = 'qrcode-text-container';
                qrTextContainer.style.marginTop = '8px';
                qrTextContainer.style.width = '100%';
                qrTextContainer.innerHTML = `
                    <button class="copy-btn save-qr-btn" id="save-qr-btn" data-i18n="btn_save_qr">Save QR Code</button>
                `;
                qrcodeContainer.appendChild(qrTextContainer);

                document.getElementById('save-qr-btn').addEventListener('click', function () {
                    processQrDownload();
                });
            }
        }
    } else if (data.channel && (data.channel.includes('qr') || data.channel.includes('alipay') || data.channel.includes('wechat'))) {
        qrcodeContainer.style.display = 'flex';
        if (orderTitleEl) orderTitleEl.innerText = t('scan_to_pay');
    } else {
        // 没有二维码数据时隐藏二维码区域，避免残留占位
        if (qrcodeContainer) qrcodeContainer.style.display = 'none';
    }

    // Status handling
    const statusEl = document.getElementById('order-status');
    const statusMsgEl = document.getElementById('status-message');
    const countdownBox = document.getElementById('countdown-box');

    if (data.status == 1 || data.status == 2) {
        statusEl.innerText = t('status_success');
        statusEl.className = 'status-badge success';
        statusMsgEl.innerText = msg && msg !== 'Success' ? msg : t('success_msg');
        countdownBox.style.display = 'none';

        // Hide QR Code and Bank info if paid to prevent paying again
        document.getElementById('bank-info-container').style.display = 'none';
        qrcodeContainer.style.display = 'none';

        // Clean up intervals
        if (countdownInterval) clearInterval(countdownInterval);
        if (pollingInterval) clearInterval(pollingInterval);

        // Redirect to a completed state/page after 2 seconds
        if (data.return_url) {
            setTimeout(() => {
                window.location.href = data.return_url;
            }, 2000);
        }

    } else {
        // Pending Payment -> Start 15m Countdown Timer
        statusEl.innerText = t('status_wait');
        statusEl.className = 'status-badge';
        statusMsgEl.innerText = t('warning_msg');
        countdownBox.style.display = 'flex';

        // Start polling if not started
        if (!pollingInterval) {
            pollingInterval = setInterval(() => {
                fetchOrderData(tradeNo, true);
            }, 5000);
        }

        // Expiration is created timestamp + valid_tTime seconds (in ms)
        // Default to 15 mins if valid_tTime is not present for some reason
        const validTimeSec = data.valid_tTime ? parseInt(data.valid_tTime) : 15 * 60;
        totalDurationMs = validTimeSec * 1000;
        orderExpireTimeMs = (data.created_at + validTimeSec) * 1000;

        if (!countdownInterval) {
            startCountdown();
        }
    }
}

function startCountdown() {
    const timeDisplay = document.getElementById('countdown-time');
    const countdownBox = document.getElementById('countdown-box');
    const progressBar = document.getElementById('timer-progress-bar');
    const statusEl = document.getElementById('order-status');
    const statusMsgEl = document.getElementById('status-message');

    function update() {
        const nowMs = Date.now();
        const diffMs = orderExpireTimeMs - nowMs;

        if (diffMs <= 0) {
            // Expired
            clearInterval(countdownInterval);
            if (pollingInterval) clearInterval(pollingInterval); // Stop polling on expiration
            countdownBox.classList.add('expired');
            if (progressBar) progressBar.style.width = '0%';
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
        if (progressBar && totalDurationMs > 0) {
            const fraction = diffMs / totalDurationMs;
            const pct = Math.max(0, Math.min(1, fraction)) * 100;
            progressBar.style.width = pct.toFixed(2) + '%';
        }
    }

    update(); // fire immediately
    countdownInterval = setInterval(update, 1000);
}

function showError(msg) {
    document.getElementById('loading-view').style.display = 'none';
    document.getElementById('error-view').style.display = 'block';
    // 避免错误层与内容层叠加显示
    const contentView = document.getElementById('content-view');
    if (contentView) contentView.style.display = 'none';

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
