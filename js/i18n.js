const translations = {
    'en': {
        title: 'Checkout - Order Payment',
        loading: 'Fetching order info...',
        fetch_fail_title: 'Failed to fetch order',
        fetch_fail_desc: 'Unknown error',
        status_wait: 'Awaiting Payment',
        status_success: 'Payment Success',
        status_expired: 'Order Expired',
        receive_account_info: 'Payment Details',
        transfer_to_account: 'Please transfer to the underlying account',
        scan_to_pay: 'Please scan the code to pay',
        order_no: 'Order No',
        receive_bank: 'Bank Name',
        receive_account: 'Bank Account',
        create_time: 'Created Time',
        btn_copy: 'Copy',
        btn_copied: 'Copied!',
        copy_fail: 'Failed to copy, please copy manually',
        qr_placeholder: 'QR Code Area',
        qr_subtext: 'Please screenshot or scan the QR code to pay',
        warning_msg: 'Please complete payment within the time limit. Unpaid orders will automatically close.',
        success_msg: 'Order has been successfully paid. You can close this page.',
        expired_msg: 'This order has timed out and is now closed.',
        time_remaining: 'Time left: ',
        time_out: 'Time Out',
        missing_trade_no: 'Missing order parameter (trade_no)',
        network_error: 'Network request failed, please check if the API is reachable'
    },
    'zh': {
        title: '收银台 - 订单支付',
        loading: '正在获取订单信息...',
        fetch_fail_title: '订单获取失败',
        fetch_fail_desc: '未知错误',
        status_wait: '等待支付',
        status_success: '支付成功',
        status_expired: '订单超时',
        receive_account_info: '收款账户信息',
        transfer_to_account: '请向以下账户进行转账',
        scan_to_pay: '请扫码付款',
        order_no: '订单号',
        receive_bank: '收款银行',
        receive_account: '收款账户',
        create_time: '创建时间',
        btn_copy: '复制',
        btn_copied: '已复制!',
        copy_fail: '复制失败，请手动复制',
        qr_placeholder: '二维码生成区',
        qr_subtext: '请截屏或扫描二维码付款',
        warning_msg: '请在规定时间内完成付款，超时订单将自动关闭',
        success_msg: '订单已支付成功，您可以关闭此页面',
        expired_msg: '该订单已超时关闭',
        time_remaining: '支付倒计时: ',
        time_out: '已超时',
        missing_trade_no: '缺少订单号参数 (trade_no)',
        network_error: '网络请求失败，请检查API服务是否已启动'
    },
    'km': { // Cambodian (Khmer)
        title: 'កន្លែងបង់ប្រាក់ - ការទូទាត់ការបញ្ជាទិញ',
        loading: 'កំពុងទាញយកព័ត៌មាន...',
        fetch_fail_title: 'បរាជ័យក្នុងការទាញយក',
        fetch_fail_desc: 'កំហុសមិនស្គាល់',
        status_wait: 'រង់ចាំការទូទាត់',
        status_success: 'ការទូទាត់បានជោគជ័យ',
        status_expired: 'ការបញ្ជាទិញផុតកំណត់',
        receive_account_info: 'ព័ត៌មានលម្អិតគណនី',
        transfer_to_account: 'សូមផ្ទេរប្រាក់ទៅគណនីខាងក្រោម',
        scan_to_pay: 'សូមស្កេនកូដដើម្បីបង់ប្រាក់',
        order_no: 'លេខបញ្ជាទិញ',
        receive_bank: 'ឈ្មោះធនាគារ',
        receive_account: 'គណនីធនាគារ',
        create_time: 'ពេលវេលាបង្កើត',
        btn_copy: 'ចម្លង',
        btn_copied: 'បានចម្លង!',
        copy_fail: 'បរាជ័យក្នុងការចម្លង សូមចម្លងដោយខ្លួនឯង',
        qr_placeholder: 'តំបន់ផលិត QR',
        qr_subtext: 'សូមថតអេក្រង់ ឬស្កេនកូដ QR ដើម្បីទូទាត់ប្រាក់',
        warning_msg: 'សូមបញ្ចប់ការទូទាត់ក្នុងកំឡុងពេលកំណត់។',
        success_msg: 'ការទូទាត់បានជោគជ័យ។ អ្នកអាចបិទទំព័រនេះ។',
        expired_msg: 'ការបញ្ជាទិញនេះផុតកំណត់ហើយ។',
        time_remaining: 'ពេលវេលានៅសល់: ',
        time_out: 'ផុតកំណត់',
        missing_trade_no: 'បាត់ប៉ារ៉ាម៉ែត្រ (trade_no)',
        network_error: 'បរាជ័យក្នុងការភ្ជាប់បណ្តាញ'
    },
    'th': { // Thai
        title: 'แคชเชียร์ - ชำระเงินค่าสินค้า',
        loading: 'กำลังดึงข้อมูลคำสั่งซื้อ...',
        fetch_fail_title: 'ดึงข้อมูลล้มเหลว',
        fetch_fail_desc: 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        status_wait: 'รอการชำระเงิน',
        status_success: 'ชำระเงินสำเร็จ',
        status_expired: 'คำสั่งซื้อหมดอายุ',
        receive_account_info: 'รายละเอียดบัญชี',
        transfer_to_account: 'กรุณาโอนเงินไปยังบัญชีด้านล่าง',
        scan_to_pay: 'กรุณาสแกนโค้ดเพื่อชำระเงิน',
        order_no: 'หมายเลขคำสั่งซื้อ',
        receive_bank: 'ชื่อธนาคาร',
        receive_account: 'หมายเลขบัญชี',
        create_time: 'เวลาที่สร้าง',
        btn_copy: 'คัดลอก',
        btn_copied: 'คัดลอกแล้ว!',
        copy_fail: 'คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง',
        qr_placeholder: 'พื้นที่คิวอาร์โค้ด',
        qr_subtext: 'กรุณาแคปหน้าจอหรือสแกนคิวอาร์โค้ดเพื่อชำระเงิน',
        warning_msg: 'กรุณาชำระเงินภายในเวลาที่กำหนด คำสั่งซื้อจะถูกปิดโดยอัตโนมัติหากหมดเวลา',
        success_msg: 'ชำระเงินเรียบร้อยแล้ว คุณสามารถปิดหน้านี้ได้',
        expired_msg: 'คำสั่งซื้อนี้หมดเวลาและถูกปิดแล้ว',
        time_remaining: 'เวลาที่เหลือ: ',
        time_out: 'หมดเวลา',
        missing_trade_no: 'ขาดพารามิเตอร์หมายเลขคำสั่งซื้อ (trade_no)',
        network_error: 'การเชื่อมต่อเครือข่ายล้มเหลว'
    },
    'my': { // Burmese
        title: 'ငွေရှင်းကောင်တာ - အော်ဒါငွေပေးချေမှု',
        loading: 'အချက်အလက်ရယူနေသည်...',
        fetch_fail_title: 'ရယူရန် ပျက်ကွက်သည်',
        fetch_fail_desc: 'အမည်မသိ အမှားဖြစ်နေသည်',
        status_wait: 'ငွေပေးချေရန် စောင့်နေသည်',
        status_success: 'ငွေပေးချေမှု အောင်မြင်သည်',
        status_expired: 'အော်ဒါသက်တမ်းကုန်သွားပါပြီ',
        receive_account_info: 'ငွေလက်ခံမည့် အကောင့်အချက်အလက်',
        transfer_to_account: 'အောက်ပါအကောင့်သို့ ငွေလွှဲပေးပါ',
        scan_to_pay: 'ငွေပေးချေရန် ကုဒ်ကို စကင်န်ဖတ်ပါ',
        order_no: 'အော်ဒါနံပါတ်',
        receive_bank: 'ဘဏ်အမည်',
        receive_account: 'ဘဏ်အကောင့်',
        create_time: 'ဖန်တီးသည့်အချိန်',
        btn_copy: 'ကူးယူပါ',
        btn_copied: 'ကူးယူပြီးပါပြီ!',
        copy_fail: 'ကူးယူရန် ပျက်ကွက်သည်၊ ကိုယ်တိုင် ကူးယူပါ',
        qr_placeholder: 'QR ကုဒ် နေရာ',
        qr_subtext: 'ငွေပေးချေရန် မျက်နှာပြင်ကို ဓာတ်ပုံရိုက်ပါ သို့မဟုတ် QR ကုဒ်ကို စကင်န်ဖတ်ပါ',
        warning_msg: 'သတ်မှတ်ထားသော အချိန်အတွင်း ငွေပေးချေမှုကို အပြီးသတ်ပါ။ အချိန်ကုန်ပါက အလိုအလျောက်ပိတ်သွားမည်။',
        success_msg: 'ငွေပေးချေမှု အောင်မြင်ပါသည်။ ဤစာမျက်နှာကို ပိတ်နိုင်ပါသည်။',
        expired_msg: 'ဤအော်ဒါသည် အချိန်ကျော်လွန်သွားပြီး ပိတ်သွားပါသည်။',
        time_remaining: 'ကျန်ရှိအချိန်: ',
        time_out: 'အချိန်ကုန်သွားပြီ',
        missing_trade_no: 'အော်ဒါနံပါတ် ပျောက်ဆုံးနေသည် (trade_no)',
        network_error: 'ကွန်ရက်ချိတ်ဆက်မှု ပျက်ကွက်သည်'
    }
};

let currentLang = 'en';

function initI18n() {
    let browserLang = navigator.language || navigator.userLanguage;
    browserLang = browserLang.toLowerCase();

    if (browserLang.startsWith('zh')) {
        currentLang = 'zh';
    } else if (browserLang.startsWith('km')) {
        currentLang = 'km';
    } else if (browserLang.startsWith('th')) {
        currentLang = 'th';
    } else if (browserLang.startsWith('my')) {
        currentLang = 'my';
    } else {
        currentLang = 'en';
    }

    applyTranslations();
}

function t(key) {
    return translations[currentLang][key] || translations['en'][key] || key;
}

function applyTranslations() {
    // Document title
    document.title = t('title');

    // All data-i18n elements
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        
        if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = t(key);
        } else {
            el.innerText = t(key);
        }
    });

    // Handle any elements that need dynamic translation injection like dynamic buttons
    const copies = document.querySelectorAll('.copy-btn');
    copies.forEach(btn => {
        if(btn.innerText !== t('btn_copied')) {
            btn.innerText = t('btn_copy');
        }
    });
}
