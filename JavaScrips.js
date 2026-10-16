// ===== Mobile Navigation =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = hamburger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===== Active Navigation Link on Scroll =====
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== Smooth Scrolling =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Scroll to Top Button =====
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Animated Counter for Stats =====
const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
};

// Intersection Observer for Stats Animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(num => {
                if (num.textContent === '0') {
                    animateCounter(num);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ===== Fade-in Animation on Scroll =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to cards
const cards = document.querySelectorAll('.about-card, .achievement-card, .news-card, .gallery-item');
cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(card);
});

// ===== Contact Form Handling with Formspree =====

// ВНИМАНИЕ: токен виден всем посетителям сайта через Ctrl+U (исходный код)!
// Для продакшена лучше прятать его на сервере/облаке.
const TG_BOT_TOKEN = '8977283923:AAE8zxCetQTSNIXey512qo-vdEopwf9unWA';
const TG_CHAT_ID = ''; // Можно оставить пустым — ID определится автоматически через getUpdates

const sendToTelegram = async (formData) => {
    const name = formData.get('name') || '-';
    const email = formData.get('email') || '-';
    const phone = formData.get('phone') || '-';
    const message = formData.get('message') || '-';
    
    const text = `📞 Новая заявка с сайта Лицей 57\n\n` +
        `👤 Имя: ${name}\n` +
        `📧 Email: ${email}\n` +
        `📱 Телефон: ${phone}\n` +
        `💬 Сообщение: ${message}`;
    
    // Если chat_id не задан — берём его из последних апдейтов бота
    // (работает, если вы хоть раз нажали /start в чате с ботом)
    let chatId = TG_CHAT_ID;
    if (!chatId) {
        const updResponse = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getUpdates`, {
            signal: AbortSignal.timeout(8000)
        });
        const updData = await updResponse.json();
        const chats = (updData.result || [])
            .map(u => u.message && u.message.chat)
            .filter(Boolean)
            .map(c => c.id);
        
        if (chats.length === 0) {
            throw new Error('Нет доступных чатов у бота (нажмите /start в чате с ботом)');
        }
        chatId = chats[chats.length - 1];
    }
    
    const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        }),
        signal: AbortSignal.timeout(8000)
    });
    
    return response.ok;
};

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const statusDiv = document.getElementById('form-status');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        console.log('Отправка формы на:', contactForm.action);
        
        try {
            const formData = new FormData(contactForm);
            
            // Логирование данных формы
            console.log('Данные формы:');
            for (let [key, value] of formData.entries()) {
                console.log(key + ': ' + value);
            }
            
            // Приоритет: отправка в Telegram
            let tgSent = false;
            try {
                tgSent = await sendToTelegram(formData);
            } catch (tgError) {
                console.warn('Telegram недоступен, использую Formspree:', tgError);
            }
            
            if (tgSent) {
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(76, 175, 80, 0.1)';
                statusDiv.style.color = '#4CAF50';
                statusDiv.style.border = '2px solid #4CAF50';
                statusDiv.innerHTML = '✅ Спасибо! Ваше сообщение отправлено в Telegram.';
                contactForm.reset();
                
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 8000);
                return;
            }
            
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Статус ответа:', response.status);
            const responseData = await response.json();
            console.log('Ответ сервера:', responseData);
            
            if (response.ok) {
                // Success
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(76, 175, 80, 0.1)';
                statusDiv.style.color = '#4CAF50';
                statusDiv.style.border = '2px solid #4CAF50';
                statusDiv.innerHTML = '✅ Спасибо! Ваше сообщение успешно отправлено. Проверьте почту byga2417@gmail.com';
                contactForm.reset();
                
                // Hide status after 8 seconds
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 8000);
            } else {
                // Formspree может вернуть ошибки валидации
                let errorMessage = '❌ Ошибка отправки. ';
                if (responseData.errors) {
                    errorMessage += responseData.errors.map(e => e.message).join(', ');
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            // Error
            console.error('Ошибка отправки:', error);
            statusDiv.style.display = 'block';
            statusDiv.style.background = 'rgba(244, 67, 54, 0.1)';
            statusDiv.style.color = '#f44336';
            statusDiv.style.border = '2px solid #f44336';
            statusDiv.innerHTML = error.message || '❌ Произошла ошибка при отправке сообщения. Проверьте консоль браузера (F12) для деталей.';
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// ===== Gallery Lightbox Effect (Simple Implementation) =====
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const overlay = item.querySelector('.gallery-overlay');
        
        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 20px;
        `;
        
        const lightboxImg = document.createElement('img');
        lightboxImg.src = img.src;
        lightboxImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        `;
        
        lightbox.appendChild(lightboxImg);
        document.body.appendChild(lightbox);
        
        // Close lightbox on click
        lightbox.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Restore scroll on close
        lightbox.addEventListener('click', () => {
            document.body.style.overflow = 'auto';
        });
    });
});

// ===== Navbar Background on Scroll =====
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 1)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }
});

// ===== Prevent Default Behavior for Placeholder Links =====
const placeholderLinks = document.querySelectorAll('a[href="#"]');
placeholderLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
    });
});

// ===== Page Load Animation =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ===== Weather Widget =====

// Резервный источник данных: wttr.in (работает, когда api.open-meteo.com недоступен)
const weatherFromWttr = async () => {
    const response = await fetch('https://wttr.in/53.9061,86.7194?format=j1&lang=ru', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
        throw new Error('wttr.in недоступен');
    }
    const c = (await response.json()).current_condition[0];
    // Приводим WWO-коды wttr.in к кодам Open-Meteo
    const codeMap = {
        0:0, 1:1, 2:2, 3:3, 4:3,
        113:0, 116:2, 119:2, 122:3, 143:45,
        176:61, 179:71, 182:65, 185:65, 200:95,
        227:71, 230:75, 248:45, 260:45,
        263:51, 266:51, 281:66, 284:66,
        293:61, 296:61, 299:63, 302:63, 305:65, 308:65,
        311:66, 314:66, 317:71, 320:75,
        323:71, 326:71, 329:73, 332:73, 335:75, 338:75,
        350:77, 353:80, 356:81, 359:82,
        362:71, 365:75, 368:71, 371:75,
        374:66, 377:66, 386:80, 389:82, 392:95, 395:96
    };
    return {
        temperature_2m: Math.round(+c.temp_C),
        relative_humidity_2m: +c.humidity,
        apparent_temperature: Math.round(+c.FeelsLikeC),
        weather_code: codeMap[+c.weatherCode] !== undefined ? codeMap[+c.weatherCode] : 3,
        wind_speed_10m: Math.round(+c.windspeedKmph),
        wind_direction_10m: +c.winddirDegree,
        surface_pressure: +c.pressure
    };
};

// Координаты Прокопьевска
const latitude = 53.9061;
const longitude = 86.7194;

async function fetchWeather() {
    const weatherWidget = document.getElementById('weatherWidget');
    
    if (!weatherWidget) return;
    
    let current = null;
    
    try {
        // Основной источник: wttr.in (быстрый и доступный в РФ)
        current = await weatherFromWttr();
    } catch (primaryError) {
        console.warn('wttr.in недоступен, переключаюсь на Open-Meteo:', primaryError);
        // Резервный источник: Open-Meteo API (бесплатный, без регистрации)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=Asia/Novokuznetsk`,
            { signal: AbortSignal.timeout(10000) }
        );
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные о погоде');
        }
        
        current = (await response.json()).current;
    }
    
    // Format date
    try {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('ru-RU', options);
        
        // Weather code interpretation
        const getWeatherInfo = (code) => {
            const weatherCodes = {
                0: { desc: 'Ясно', icon: '☀️' },
                1: { desc: 'Преимущественно ясно', icon: '🌤️' },
                2: { desc: 'Переменная облачность', icon: '⛅' },
                3: { desc: 'Пасмурно', icon: '☁️' },
                45: { desc: 'Туман', icon: '🌫️' },
                48: { desc: 'Изморозь', icon: '🌫️' },
                51: { desc: 'Легкая морось', icon: '🌦️' },
                53: { desc: 'Морось', icon: '🌦️' },
                55: { desc: 'Сильная морось', icon: '🌧️' },
                61: { desc: 'Небольшой дождь', icon: '🌧️' },
                63: { desc: 'Дождь', icon: '🌧️' },
                65: { desc: 'Сильный дождь', icon: '⛈️' },
                71: { desc: 'Небольшой снег', icon: '🌨️' },
                73: { desc: 'Снег', icon: '❄️' },
                75: { desc: 'Сильный снег', icon: '❄️' },
                77: { desc: 'Снежная крупа', icon: '🌨️' },
                80: { desc: 'Ливень', icon: '🌧️' },
                81: { desc: 'Сильный ливень', icon: '⛈️' },
                82: { desc: 'Очень сильный ливень', icon: '⛈️' },
                85: { desc: 'Снегопад', icon: '🌨️' },
                86: { desc: 'Сильный снегопад', icon: '❄️' },
                95: { desc: 'Гроза', icon: '⛈️' },
                96: { desc: 'Гроза с градом', icon: '⛈️' },
                99: { desc: 'Сильная гроза с градом', icon: '⛈️' }
            };
            return weatherCodes[code] || { desc: 'Неизвестно', icon: '🌡️' };
        };
        
        // Wind direction
        const getWindDirection = (deg) => {
            const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
            const index = Math.round(deg / 45) % 8;
            return directions[index];
        };
        
        const weatherInfo = getWeatherInfo(current.weather_code);
        
        // Build weather HTML
        const weatherHTML = `
            <div class="weather-content">
                <div class="weather-header">
                    <div class="weather-location">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <h3>Прокопьевск</h3>
                    </div>
                    <div class="weather-date">${dateString}</div>
                </div>
                
                <div class="weather-main">
                    <div class="weather-temp-section">
                        <div style="font-size: 100px; line-height: 1;">${weatherInfo.icon}</div>
                        <div class="weather-temp-info">
                            <div class="weather-temp">${Math.round(current.temperature_2m)}°</div>
                            <div class="weather-description">${weatherInfo.desc}</div>
                        </div>
                    </div>
                    
                    <div class="weather-details">
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                            </div>
                            <div class="weather-detail-info">
                                <div class="weather-detail-label">Ветер</div>
                                <div class="weather-detail-value">${Math.round(current.wind_speed_10m)} км/ч ${getWindDirection(current.wind_direction_10m)}</div>
                            </div>
                        </div>
                        
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                                </svg>
                            </div>
                            <div class="weather-detail-info">
                                <div class="weather-detail-label">Влажность</div>
                                <div class="weather-detail-value">${current.relative_humidity_2m}%</div>
                            </div>
                        </div>
                        
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                                </svg>
                            </div>
                            <div class="weather-detail-info">
                                <div class="weather-detail-label">Давление</div>
                                <div class="weather-detail-value">${Math.round(current.surface_pressure * 0.75)} мм рт.ст.</div>
                            </div>
                        </div>
                        
                        <div class="weather-detail-item">
                            <div class="weather-detail-icon">
                                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            </div>
                            <div class="weather-detail-info">
                                <div class="weather-detail-label">Ощущается</div>
                                <div class="weather-detail-value">${Math.round(current.apparent_temperature)}°C</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        weatherWidget.innerHTML = weatherHTML;
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherWidget.innerHTML = `
            <div class="weather-error">
                <p>⚠️ Не удалось загрузить данные о погоде</p>
                <p style="font-size: 14px; opacity: 0.8;">Пожалуйста, проверьте подключение к интернету или попробуйте позже</p>
            </div>
        `;
    }
}

// Load weather on page load
if (document.getElementById('weatherWidget')) {
    fetchWeather();
    // Update weather every 30 minutes
    setInterval(fetchWeather, 1800000);
}

// ===== Tournament Slider (Images & Videos) =====
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.tournament-slide');
const slideIndicators = document.querySelectorAll('.slider-indicator');

function changeSlide(direction) {
    if (slides.length === 0) return;
    
    // Remove active class from current slide and indicator
    slides[currentSlideIndex].classList.remove('active');
    slideIndicators[currentSlideIndex].classList.remove('active');
    
    // Calculate new index
    currentSlideIndex += direction;
    
    // Loop around
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Add active class to new slide and indicator
    slides[currentSlideIndex].classList.add('active');
    slideIndicators[currentSlideIndex].classList.add('active');
}

function goToSlide(index) {
    if (slides.length === 0) return;
    
    // Remove active class from current slide and indicator
    slides[currentSlideIndex].classList.remove('active');
    slideIndicators[currentSlideIndex].classList.remove('active');
    
    // Set new index
    currentSlideIndex = index;
    
    // Add active class to new slide and indicator
    slides[currentSlideIndex].classList.add('active');
    slideIndicators[currentSlideIndex].classList.add('active');
}

// Keyboard navigation for slider
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// Auto-play slider (optional - uncomment to enable)
// setInterval(() => {
//     changeSlide(1);
// }, 5000); // Change slide every 5 seconds

// ===== Tournament Rules Accordion =====
function toggleRule(header) {
    const ruleItem = header.parentElement;
    const isActive = ruleItem.classList.contains('active');
    
    // Close all other rule items
    document.querySelectorAll('.rule-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        ruleItem.classList.add('active');
    }
}

// ===== Console Welcome Message =====
console.log('%c Добро пожаловать на сайт Лицея 57! ', 'background: #4A7BA7; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Мы формируем будущее через качественное образование ', 'font-size: 12px; color: #4A7BA7;');
