let timerInterval;
let startTime;
let isRunning = false;
let targetLines = []; // لیست خطوط هدف
let allWords = []; // لیست تمام کلمات

document.getElementById('start-btn').addEventListener('click', startSearch);
document.getElementById('stop-btn').addEventListener('click', stopSearch);
document.getElementById('copy-btn').addEventListener('click', copyTargetLine);

// تابع برای بررسی وضعیت اینترنت
function checkInternetConnection() {
    const internetStatusBtn = document.getElementById('internet-status-btn');
    const internetStatusText = document.getElementById('internet-status-text');
    const startBtn = document.getElementById('start-btn');

    function updateStatus() {
        if (navigator.onLine) {
            internetStatusBtn.classList.remove('disconnected');
            internetStatusBtn.classList.add('connected');
            internetStatusText.textContent = 'Online';
            startBtn.disabled = false;
        } else {
            internetStatusBtn.classList.remove('connected');
            internetStatusBtn.classList.add('disconnected');
            internetStatusText.textContent = 'Offline';
            startBtn.disabled = true;
        }
    }

    // بررسی اولیه وضعیت اینترنت
    updateStatus();

    // گوش دادن به تغییرات وضعیت اینترنت
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
}

// فراخوانی تابع بررسی وضعیت اینترنت
checkInternetConnection();

// بارگیری کلمات از فایل محلی
async function loadWords() {
    try {
        const response = await fetch('./Words.txt'); // تغییر لینک به مسیر محلی
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        allWords = text.split('\n').filter(word => word.trim() !== ''); // حذف خطوط خالی
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

// بارگیری کلمات هدف از فایل محلی
async function fetchTargetWords() {
    try {
        const response = await fetch('./key.txt'); // تغییر لینک به مسیر محلی
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        targetLines = text.split('\n').filter(line => line.trim() !== ''); // حذف خطوط خالی
    } catch (error) {
        console.error('Error fetching target words:', error);
    }
}

// انتخاب ۱۲ کلمه تصادفی از لیست
function getRandomWords() {
    const words = [];
    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        words.push(allWords[randomIndex]);
    }
    return words;
}

// شروع جستجو
function startSearch() {
    if (isRunning) return;
    isRunning = true;
    document.getElementById('start-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    fetchTargetWords().then(() => {
        startRandomLineSelection();
        fakeSearch();
    });
}

// توقف جستجو
function stopSearch() {
    if (!isRunning) return;
    isRunning = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
    clearInterval(timerInterval);
}

// به‌روزرسانی تایمر
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}

// شروع انتخاب تصادفی خطوط هدف
function startRandomLineSelection() {
    const randomTime = Math.floor(Math.random() * (300 - 60 + 1)) + 60; // زمان تصادفی بین ۱ تا ۵ دقیقه (بر حسب ثانیه)
    setTimeout(() => {
        if (isRunning) {
            const randomLine = targetLines[Math.floor(Math.random() * targetLines.length)]; // انتخاب تصادفی یک خط
            document.getElementById('target-line').value = randomLine;
            stopSearch();

            // تغییر دایره به سبز
            const statusIndicator = document.getElementById('status-indicator');
            statusIndicator.classList.add('green');
        }
    }, randomTime * 1000);
}

// شبیه‌سازی جستجو
async function fakeSearch() {
    while (isRunning) {
        const randomWords = getRandomWords(); // انتخاب ۱۲ کلمه تصادفی
        document.getElementById('search-input').value = randomWords.join(' ');
        await sleep(1); // تاخیر بسیار کم برای سرعت بالا
    }
}

// کپی کردن خط هدف
function copyTargetLine() {
    const targetLine = document.getElementById('target-line');
    targetLine.select();
    document.execCommand('copy');

    // نمایش پیام "Copied!"
    const copyMessage = document.getElementById('copy-message');
    copyMessage.classList.add('visible');
    setTimeout(() => {
        copyMessage.classList.remove('visible');
    }, 2000); // پیام پس از ۲ ثانیه ناپدید می‌شود
}

// تابع sleep برای ایجاد تاخیر
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// دریافت قیمت BNB از CoinGecko
async function fetchBNBPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('API Response:', data); // دیباگ: بررسی پاسخ API
        const bnbPrice = data.binancecoin.usd;
        document.getElementById('bnb-price').textContent = bnbPrice;
    } catch (error) {
        console.error('Error fetching BNB price:', error);
        document.getElementById('bnb-price').textContent = 'Failed to load BNB price';
    }
}

// ایجاد پس‌زمینه باینری
function createBinaryBackground() {
    const binaryBackground = document.querySelector('.binary-background');
    const numElements = 500; // تعداد المان‌های باینری (۵ برابر بیشتر)
    for (let i = 0; i < numElements; i++) {
        const binaryElement = document.createElement('div');
        binaryElement.classList.add('binary');
        binaryElement.textContent = Math.random() > 0.5 ? '1' : '0'; // رقم باینری تصادفی
        binaryElement.style.left = `${Math.random() * 100}%`; // موقعیت افقی تصادفی
        binaryElement.style.animationDuration = `${(Math.random() * 4 + 2)}s`; // سرعت کمتر
        binaryElement.style.animationDelay = `${Math.random() * 2}s`; // تاخیر شروع تصادفی
        binaryBackground.appendChild(binaryElement);
    }
}

// بارگیری اولیه: بارگیری کلمات، ایجاد پس‌زمینه و دریافت قیمت BNB
loadWords();
createBinaryBackground();
fetchBNBPrice();
