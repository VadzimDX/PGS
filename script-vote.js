// НАСТРОЙКИ GOOGLE SHEETS
// Замените YOUR_SCRIPT_URL на URL вашего Google Apps Script веб-приложения
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpHkUnrmWMmkXtQW8HY27_1iDuBZM6STp6DwaE1nSvCVkqjad0ssF-6QLvcVkYUvWp/exec';

// Элементы DOM
const voteButtons = document.querySelectorAll('.vote-btn');
const messageDiv = document.getElementById('message');
const loader = document.getElementById('loader');

// Проверка, голосовал ли пользователь ранее
function hasUserVoted() {
    return localStorage.getItem('hasVoted') === 'true';
}

// Отображение сообщения
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}

// Получение IP адреса пользователя
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Ошибка получения IP:', error);
        return 'unknown';
    }
}

// Получение данных авторизованного пользователя из API платформы
async function getUserInfo() {
    try {
        const response = await fetch('https://test-kometa.egamings.com/api/v1/userInfo?lang=en', {
            method: 'GET',
            credentials: 'include' // Важно для отправки cookies
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                email: data.email || 'not_authorized',
                idUser: data.idUser || 'not_authorized'
            };
        } else {
            console.log('Пользователь не авторизован');
            return {
                email: 'not_authorized',
                idUser: 'not_authorized'
            };
        }
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
        return {
            email: 'error',
            idUser: 'error'
        };
    }
}

// Отправка голоса в Google Sheets
async function submitVote(option) {
    try {
        loader.style.display = 'block';
        
        const userIP = await getUserIP();
        const userInfo = await getUserInfo();
        const timestamp = new Date().toISOString();
        
        console.log('Отправка голоса:', {
            option: option,
            ip: userIP,
            email: userInfo.email,
            idUser: userInfo.idUser,
            timestamp: timestamp
        });
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                option: option,
                ip: userIP,
                email: userInfo.email,
                idUser: userInfo.idUser,
                timestamp: timestamp
            })
        });
        
        // С режимом no-cors мы не можем прочитать ответ,
        // поэтому предполагаем успех, если не было ошибки
        localStorage.setItem('hasVoted', 'true');
        localStorage.setItem('votedOption', option);
        
        loader.style.display = 'none';
        disableVoting();
        showMessage(`Спасибо за ваш голос! Вы выбрали вариант ${option}`, 'success');
        
    } catch (error) {
        loader.style.display = 'none';
        console.error('Ошибка отправки:', error);
        showMessage('Произошла ошибка при отправке голоса. Попробуйте позже.', 'error');
    }
}

// Отключение возможности голосования
function disableVoting() {
    voteButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

// Инициализация
function init() {
    // Проверка, голосовал ли пользователь ранее
    if (hasUserVoted()) {
        disableVoting();
        const votedOption = localStorage.getItem('votedOption');
        showMessage(`Вы уже проголосовали (вариант ${votedOption})`, 'info');
        return;
    }
    
    // Добавление обработчиков событий
    voteButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (hasUserVoted()) {
                showMessage('Вы уже проголосовали!', 'error');
                return;
            }
            
            const option = btn.dataset.option;
            await submitVote(option);
        });
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
