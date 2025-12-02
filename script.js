// script.js - Полностью рабочий сайт с сохранением в localStorage

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 Lucky Spin Slots - Полностью рабочий сайт загружен!');
    
    // ===== ПЕРЕМЕННЫЕ =====
    const symbols = ['🍒', '🍋', '🍊', '💎', '7️⃣'];
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    const spinBtn = document.getElementById('spinBtn');
    const balanceElement = document.getElementById('balance');
    const betAmountElement = document.getElementById('betAmount');
    const winMessage = document.getElementById('winMessage');
    const decreaseBetBtn = document.getElementById('decreaseBet');
    const increaseBetBtn = document.getElementById('increaseBet');
    const profileBtn = document.getElementById('profileBtn');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const modalBalance = document.getElementById('modalBalance');
    const messageFormsContainer = document.getElementById('messageFormsContainer');
    
    // ===== СОСТОЯНИЕ ИГРЫ =====
    let balance = 1000;
    let betAmount = 10;
    let isSpinning = false;
    let gamesPlayed = 0;
    let wins = 0;
    let totalWon = 0;
    let spinCount = 0;
    let currentLevel = 'Beginner';
    let playerExperience = 0;
    let adClicks = [];
    let adRevenue = 0;

    // ДОБАВЬ ЭТО: Флаги для отслеживания полученных бонусов
    let bonusesClaimed = {
        welcomeBonus: false,
        dailyBonus: false,
        weeklyBonus: false,
        emailBonus: false,
        jackpotBonus: false
    };

    // ДОБАВЬ ЭТО: Время последнего бонуса
    let lastBonusTime = {
        welcome: null,
        daily: null,
        weekly: null,
        email: null,
        jackpot: null
    };
    
    // ===== LOCALSTORAGE ФУНКЦИИ =====
    
    function saveGameState() {
    const gameState = {
        balance: balance,
        betAmount: betAmount,
        gamesPlayed: gamesPlayed,
        wins: wins,
        totalWon: totalWon,
        spinCount: spinCount,
        currentLevel: currentLevel,
        playerExperience: playerExperience,
        adClicks: adClicks,
        adRevenue: adRevenue,
        
        // ДОБАВЬ ЭТИ СТРОКИ:
        bonusesClaimed: bonusesClaimed,
        lastBonusTime: lastBonusTime,
        
        lastSave: new Date().toISOString()
    };
    localStorage.setItem('luckySpinGameState', JSON.stringify(gameState));
    console.log('💾 Состояние игры сохранено:', gameState);
}
    
    function loadGameState() {
    const savedState = localStorage.getItem('luckySpinGameState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            balance = state.balance || 1000;
            betAmount = state.betAmount || 10;
            gamesPlayed = state.gamesPlayed || 0;
            wins = state.wins || 0;
            totalWon = state.totalWon || 0;
            spinCount = state.spinCount || 0;
            currentLevel = state.currentLevel || 'Beginner';
            playerExperience = state.playerExperience || 0;
            adClicks = state.adClicks || [];
            adRevenue = state.adRevenue || 0;
            
            // ДОБАВЬ ЭТИ СТРОКИ:
            bonusesClaimed = state.bonusesClaimed || {
                welcomeBonus: false,
                dailyBonus: false,
                weeklyBonus: false,
                emailBonus: false,
                jackpotBonus: false
            };
            lastBonusTime = state.lastBonusTime || {
                welcome: null,
                daily: null,
                weekly: null,
                email: null,
                jackpot: null
            };
            
            console.log('📂 Состояние игры загружено:', state);
        } catch (e) {
            console.error('❌ Ошибка загрузки состояния:', e);
            resetGameState();
        }
    }
}
    
    function resetGameState() {
        balance = 1000;
        betAmount = 10;
        gamesPlayed = 0;
        wins = 0;
        totalWon = 0;
        spinCount = 0;
        currentLevel = 'Beginner';
        playerExperience = 0;
        adClicks = [];
        adRevenue = 0;
        
        localStorage.removeItem('luckySpinGameState');
        console.log('🔄 Состояние игры сброшено');
    }
    
    function exportGameData() {
        const gameState = {
            balance: balance,
            betAmount: betAmount,
            gamesPlayed: gamesPlayed,
            wins: wins,
            winRate: gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) + '%' : '0%',
            totalWon: totalWon,
            spinCount: spinCount,
            currentLevel: currentLevel,
            playerExperience: playerExperience,
            adClicksCount: adClicks.length,
            adRevenue: adRevenue,
            lastSave: new Date().toISOString()
        };
        return JSON.stringify(gameState, null, 2);
    }
    
    // ===== ФУНКЦИИ ФОРМ =====
    
    function showForm(type, title, message, options = {}) {
        const formId = 'form_' + Date.now();
        const form = document.createElement('div');
        form.className = `message-form ${type}`;
        form.id = formId;
        
        let actionsHTML = '';
        if (options.actions) {
            actionsHTML = options.actions.map(action => 
                `<button class="form-btn ${action.type || 'primary'}" onclick="${action.onClick}">${action.label}</button>`
            ).join('');
        } else {
            actionsHTML = `<button class="form-btn primary" onclick="document.getElementById('${formId}').remove()">OK</button>`;
        }
        
        form.innerHTML = `
            <div class="form-content">
                <div class="form-icon">${options.icon || getIconForType(type)}</div>
                <div class="form-title">${title}</div>
                <div class="form-message">${message}</div>
                ${options.inputs ? `
                <div class="form-input-group">
                    ${options.inputs}
                </div>
                ` : ''}
                ${options.progress ? `
                <div class="form-progress">
                    <div class="form-progress-bar" style="width: ${options.progress}%"></div>
                </div>
                ` : ''}
                <div class="form-actions">
                    ${actionsHTML}
                </div>
            </div>
        `;
        
        messageFormsContainer.appendChild(form);
        setTimeout(() => form.classList.add('show'), 10);
        
        if (!options.actions && !options.inputs) {
            setTimeout(() => {
                if (document.getElementById(formId)) {
                    form.classList.remove('show');
                    setTimeout(() => {
                        if (document.getElementById(formId)) {
                            document.getElementById(formId).remove();
                        }
                    }, 500);
                }
            }, 5000);
        }
        
        return formId;
    }
    
    function getIconForType(type) {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '💬';
        }
    }
    
    // ===== ФУНКЦИИ ИГРЫ =====
    
    function updateBetDisplay() {
        betAmountElement.textContent = betAmount;
        saveGameState(); // Сохраняем при изменении
    }
    
    function updateBalanceDisplay() {
        balanceElement.textContent = balance.toLocaleString();
        if (modalBalance) modalBalance.textContent = balance.toLocaleString();
    }
    
    function updatePlayerLevel() {
        const levelBadge = document.querySelector('.level-badge');
        if (playerExperience >= 1000) {
            currentLevel = 'Expert';
            if (levelBadge) levelBadge.style.background = 'linear-gradient(45deg, #ff0055, #ff8800)';
        } else if (playerExperience >= 500) {
            currentLevel = 'Advanced';
            if (levelBadge) levelBadge.style.background = 'linear-gradient(45deg, #00ffb0, #2575fc)';
        } else if (playerExperience >= 100) {
            currentLevel = 'Intermediate';
            if (levelBadge) levelBadge.style.background = 'linear-gradient(45deg, #6a11cb, #2575fc)';
        }
        if (levelBadge) levelBadge.textContent = currentLevel;
        saveGameState(); // Сохраняем при изменении уровня
    }
    
    function addExperience(points) {
        playerExperience += points;
        updatePlayerLevel();
        
        if (playerExperience === 100 || playerExperience === 500 || playerExperience === 1000) {
            showForm('success', '🎉 Level Up!', `You are now ${currentLevel}!`);
        }
        saveGameState(); // Сохраняем опыт
    }
    
    function spinReel(reel, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const spinInterval = setInterval(() => {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                reel.querySelector('.reel-content').textContent = randomSymbol;
                
                if (Date.now() - startTime > duration) {
                    clearInterval(spinInterval);
                    const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                    reel.querySelector('.reel-content').textContent = finalSymbol;
                    resolve(finalSymbol);
                }
            }, 100);
        });
    }
    
    async function spin() {
        if (isSpinning) return;
        
        if (balance < betAmount) {
            showForm('error', 'Insufficient Balance', 'You need more coins to place this bet.', {
                actions: [
                    { label: 'Deposit', type: 'primary', onClick: "depositForm(100)" },
                    { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
                ]
            });
            return;
        }
        
        isSpinning = true;
        winMessage.textContent = "";
        balance -= betAmount;
        gamesPlayed++;
        spinCount++;
        
        // СОХРАНЕНИЕ ПОСЛЕ ИЗМЕНЕНИЯ
        saveGameState();
        
        updateBalanceDisplay();
        
        addExperience(1);
        
        reel1.classList.add('spinning');
        reel2.classList.add('spinning');
        reel3.classList.add('spinning');
        spinBtn.disabled = true;
        
        const spin1 = spinReel(reel1, 1000);
        const spin2 = spinReel(reel2, 1500);
        const spin3 = spinReel(reel3, 2000);
        
        const results = await Promise.all([spin1, spin2, spin3]);
        
        reel1.classList.remove('spinning');
        reel2.classList.remove('spinning');
        reel3.classList.remove('spinning');
        spinBtn.disabled = false;
        
        checkWin(results);
        isSpinning = false;
        
        showAdsAfterSpin();
    }
    
    function checkWin(results) {
        const [a, b, c] = results;
        
        if (a === b && b === c) {
            let multiplier = 0;
            
            if (a === '🍒') multiplier = 3;
            else if (a === '🍋') multiplier = 5;
            else if (a === '🍊') multiplier = 7;
            else if (a === '💎') multiplier = 10;
            else if (a === '7️⃣') multiplier = 20;
            
            const winAmount = betAmount * multiplier;
            balance += winAmount;
            totalWon += winAmount;
            wins++;
            
            // СОХРАНЕНИЕ ПОСЛЕ ВЫИГРЫША
            saveGameState();
            
            updateBalanceDisplay();
            
            addExperience(10);
            
            winMessage.textContent = `JACKPOT! YOU WON $${winAmount}`;
            winMessage.style.color = "#00ffb0";
            
            document.querySelector('.slot-machine').classList.add('celebrate');
            setTimeout(() => {
                document.querySelector('.slot-machine').classList.remove('celebrate');
            }, 2000);
            
            showForm('success', '🎰 JACKPOT!', `Congratulations! You won $${winAmount}!`, {
                icon: '💰',
                progress: 100
            });
            
            if (winAmount >= 200) {
                showAchievement("Big Winner!", `You won $${winAmount}!`);
            }
        } else {
            winMessage.textContent = "Try again!";
            winMessage.style.color = "#ff8800";
        }
        
        updateStats();
    }
    
    function showAchievement(title, message) {
        showForm('success', `🏆 ${title}`, message, {
            icon: '🏆'
        });
    }
    
    function updateStats() {
        document.querySelectorAll('.stat-item').forEach((item, index) => {
            const valueEl = item.querySelector('.stat-value');
            if (valueEl) {
                if (index === 0) valueEl.textContent = gamesPlayed;
                if (index === 1) valueEl.textContent = wins;
                if (index === 2) valueEl.textContent = totalWon;
            }
        });
    }
    
    function deposit(amount) {
        balance += amount;
        
        // СОХРАНЕНИЕ ПОСЛЕ ДЕПОЗИТА
        saveGameState();
        
        updateBalanceDisplay();
        addExperience(5);
        
        showForm('success', '💰 Deposit Successful', `$${amount} has been added to your balance!`);
    }
    
    function showAdsAfterSpin() {
        if (spinCount % 5 === 0) {
            setTimeout(() => {
                showRandomPopupAd();
            }, 1500);
        }
        
        if (spinCount % 10 === 0) {
            setTimeout(() => {
                showInterstitialAd();
            }, 2000);
        }
    }
    
    // ===== РЕКЛАМНЫЕ ФУНКЦИИ =====
    
    function showRandomPopupAd() {
        const ads = [
            {
                title: "Upgrade Your Gaming Setup!",
                message: "Check out premium gaming gear at GameGear Pro",
                features: ["🎮 Mechanical Keyboards", "🖱️ Gaming Mice", "🎧 Headsets"]
            },
            {
                title: "Boost Your Performance!",
                message: "Try GameBoost Pro for optimal gaming experience",
                features: ["⚡ FPS Boost", "🛡️ Security", "🎯 Optimization"]
            },
            {
                title: "Join Gaming Community!",
                message: "Connect with gamers worldwide on GameConnect",
                features: ["🌍 Global Network", "🎮 Tournaments", "🏆 Rewards"]
            }
        ];
        
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        document.getElementById('popupTitle').textContent = randomAd.title;
        document.getElementById('popupMessage').textContent = randomAd.message;
        
        const features = document.querySelectorAll('.popup-features .feature-item span');
        features.forEach((feature, index) => {
            if (randomAd.features[index]) {
                feature.textContent = randomAd.features[index];
            }
        });
        
        const popupModal = new bootstrap.Modal(document.getElementById('popupAdModal'));
        popupModal.show();
    }
    
    function showInterstitialAd() {
        const interstitialAd = document.getElementById('interstitialAd');
        if (interstitialAd) {
            interstitialAd.classList.add('active');
        }
    }
    
    function trackAdClick(productKey, productName) {
        const clickData = {
            product: productName,
            productKey: productKey,
            timestamp: new Date().toISOString(),
            revenue: 25
        };
        
        adClicks.push(clickData);
        adRevenue += 25;
        
        // СОХРАНЕНИЕ ДАННЫХ О РЕКЛАМЕ
        saveGameState();
        
        return clickData;
    }
    
    // ===== UI ФУНКЦИИ =====
    
    function showMessage(message, type = 'info') {
        const colors = {
            success: '#00ffb0',
            error: '#ff0055',
            warning: '#ff8800',
            info: '#ffd700'
        };
        
        winMessage.textContent = message;
        winMessage.style.color = colors[type] || colors.info;
        
        if (type !== 'error') {
            setTimeout(() => {
                if (!winMessage.textContent.includes('WON')) {
                    winMessage.textContent = "";
                }
            }, 3000);
        }
    }
    
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) {
            activePage.classList.add('active');
        }
        
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
        
        if (mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
        
        updateLiveStats();
    }
    
    function updateLiveStats() {
        const onlineEl = document.getElementById('onlinePlayers');
        const winsEl = document.getElementById('todayWins');
        const jackpotEl = document.getElementById('jackpotAmount');
        
        if (onlineEl) {
            const base = 1254;
            const variation = Math.floor(Math.random() * 200) - 100;
            onlineEl.textContent = (base + variation).toLocaleString();
        }
        
        if (winsEl) {
            const base = 45230;
            const increase = gamesPlayed * 10;
            winsEl.textContent = '$' + (base + increase).toLocaleString();
        }
        
        if (jackpotEl) {
            const base = 2500000;
            const increase = gamesPlayed * 50;
            jackpotEl.textContent = '$' + ((base + increase) / 1000000).toFixed(1) + 'M';
        }
    }
    
    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    
    spinBtn.addEventListener('click', spin);
    
    decreaseBetBtn.addEventListener('click', function() {
        if (betAmount > 5) {
            betAmount -= 5;
            updateBetDisplay();
        }
    });
    
    increaseBetBtn.addEventListener('click', function() {
        if (betAmount < 100) {
            betAmount += 5;
            updateBetDisplay();
        }
    });
    
    profileBtn.addEventListener('click', function() {
        const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
        profileModal.show();
    });
    
    mobileMenuToggle.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        this.innerHTML = mobileNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // ОБРАБОТЧИК ДЛЯ ФУТЕРНЫХ ССЫЛОК
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
                
                if (mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    document.addEventListener('click', function(e) {
    if (e.target.classList.contains('claim-btn')) {
        const bonusName = e.target.closest('.promotion-card')?.querySelector('h3, h4')?.textContent || 'Bonus';
        
        // ПРОВЕРКА ДЛЯ WELCOME BONUS
        if (bonusName.includes('Welcome')) {
            if (bonusesClaimed.welcomeBonus) {
                showForm('error', '❌ Already Claimed', 'Welcome bonus can only be claimed once per account!', {
                    icon: '⚠️'
                });
                return;
            }
            
            const bonusAmount = 1000;
            balance += bonusAmount;
            bonusesClaimed.welcomeBonus = true;
            lastBonusTime.welcome = new Date().toISOString();
            
            updateBalanceDisplay();
            addExperience(30);
            
            // СОХРАНЕНИЕ
            saveGameState();
            
            showForm('success', '🎉 Welcome Bonus Claimed!', `Welcome bonus claimed! $${bonusAmount} added to your balance!`);
            showAchievement("Welcome!", `Claimed Welcome Bonus`);
            
            // ОБНОВИ ВНЕШНИЙ ВИД КНОПКИ
            e.target.textContent = 'Already Claimed';
            e.target.disabled = true;
            e.target.style.opacity = '0.7';
            e.target.style.cursor = 'not-allowed';
            
            return;
        }
        
        // ОБЫЧНЫЕ БОНУСЫ (если нужно)
        const bonusAmount = bonusName.includes('Welcome') ? 1000 : 
                           bonusName.includes('Free') ? 200 : 
                           bonusName.includes('Cashback') ? 150 : 100;
        
        balance += bonusAmount;
        updateBalanceDisplay();
        addExperience(30);
        
        // СОХРАНЕНИЕ
        saveGameState();
        
        showForm('success', '🎉 Bonus Claimed!', `${bonusName} claimed! $${bonusAmount} added to your balance!`);
        showAchievement("Bonus Hunter!", `Claimed ${bonusName}`);
    }
});
    
    // Email subscription
    const emailForm = document.getElementById('emailSubscribeForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                showForm('success', '✅ Subscribed!', 'Welcome bonus added! Thank you for subscribing to our newsletter.', {
                    icon: '🎉'
                });
                const bonus = 50;
                balance += bonus;
                
                // СОХРАНЕНИЕ ПОСЛЕ ПОДПИСКИ
                saveGameState();
                
                updateBalanceDisplay();
                emailForm.reset();
            }
        });
    }
    
    // ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
    
    window.openAdLink = function(productKey) {
        const products = {
            'gameboost': 'GameBoost Pro',
            'gaming_gear': 'ProGamer Gear',
            'gaming_chair': 'ComfortMax Pro Gaming Chair',
            'energy_drink': 'PowerFuel Energy',
            'headphones': 'SoundBlast Pro Headphones',
            'streaming_software': 'StreamMaster Pro',
            'credit_card': 'GamerCredit Card',
            'gaming_monitor': 'UltraGamer 240Hz Monitor',
            'vpn': 'GameVPN',
            'performance_boost': 'PerformanceBoost Pro',
            'gaming_gear_full': 'GameGear Pro Collection',
            'gaming_community': 'GameConnect Community',
            'gaming_pc': 'PowerPlay Gaming PC'
        };
        
        const productName = products[productKey] || 'Product';
        const clickData = trackAdClick(productKey, productName);
        
        showForm('success', '🎁 Ad Bonus!', `You earned a $25 bonus for checking ${productName}!`, {
            icon: '💰'
        });
        
        balance += 25;
        updateBalanceDisplay();
        addExperience(10);
        
        // СОХРАНЕНИЕ ПОСЛЕ КЛИКА ПО РЕКЛАМЕ
        saveGameState();
    };
    
    window.giveAdBonus = function(productKey) {
        balance += 25;
        updateBalanceDisplay();
        showForm('success', '🎁 Bonus Added!', '+$25 bonus for clicking ad!', {
            icon: '💰'
        });
        saveGameState();
    };
    
    window.closeInterstitial = function() {
        const interstitialAd = document.getElementById('interstitialAd');
        if (interstitialAd) {
            interstitialAd.classList.remove('active');
        }
    };
    
    window.claimBonusForm = function(type) {
    const bonuses = {
        'welcome': 1000,
        'daily': 100,
        'weekly': 250
    };
    
    const amount = bonuses[type] || 100;
    
    // ПРОВЕРКА: Уже получали бонус?
    if (type === 'welcome' && bonusesClaimed.welcomeBonus) {
        showForm('error', '❌ Bonus Already Claimed', 'Welcome bonus can only be claimed once!', {
            icon: '⚠️'
        });
        return;
    }
    
    if (type === 'daily') {
        const lastClaim = lastBonusTime.daily;
        if (lastClaim) {
            const hoursSinceLastClaim = (new Date() - new Date(lastClaim)) / (1000 * 60 * 60);
            if (hoursSinceLastClaim < 24) {
                const hoursLeft = Math.ceil(24 - hoursSinceLastClaim);
                showForm('error', '⏰ Daily Bonus Not Ready', `Come back in ${hoursLeft} hour(s) to claim your daily bonus!`, {
                    icon: '⏳'
                });
                return;
            }
        }
    }
    
    if (type === 'weekly' && lastBonusTime.weekly) {
        const daysSinceLastClaim = (new Date() - new Date(lastBonusTime.weekly)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastClaim < 7) {
            const daysLeft = Math.ceil(7 - daysSinceLastClaim);
            showForm('error', '📅 Weekly Bonus Not Ready', `Come back in ${daysLeft} day(s) to claim your weekly bonus!`, {
                icon: '📆'
            });
            return;
        }
    }
    
    // ВЫДАЧА БОНУСА
    balance += amount;
    updateBalanceDisplay();
    
    // ОБНОВЛЕНИЕ ФЛАГОВ
    if (type === 'welcome') {
        bonusesClaimed.welcomeBonus = true;
    }
    lastBonusTime[type] = new Date().toISOString();
    
    // СОХРАНЕНИЕ
    saveGameState();
    
    showForm('success', '🎉 Bonus Claimed!', `Claimed ${type} bonus! +$${amount} added!`, {
        icon: '💰',
        actions: [
            { label: 'Great!', type: 'primary', onClick: `document.getElementById(this.closest('.message-form').id).remove()` }
        ]
    });
};
    
    window.showJackpotInfoForm = function() {
        showForm('info', '💰 Progressive Jackpot', 'Jackpot starts at $2,500,000! Play now for a chance to win big!', {
            icon: '🎰',
            actions: [
                { label: 'Play Now', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove(); showPage('home')" },
                { label: 'Learn More', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.playGameForm = function(gameName) {
        showForm('info', `🎮 Starting ${gameName}`, 'The game is loading... Get ready to play! Good luck!', {
            progress: 50,
            actions: [
                { label: 'OK', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
        showPage('home');
    };
    
    window.startLiveChatForm = function() {
        showForm('info', '💬 Live Chat Support', 'Connecting you to a live support agent...', {
            progress: 60,
            inputs: '<input type="text" placeholder="Type your question here...">',
            actions: [
                { label: 'Send', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove(); showForm('success', 'Message Sent', 'Support agent will reply shortly.')" },
                { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.sendSupportEmailForm = function() {
        showForm('info', '📧 Email Support', 'Please provide details about your issue:', {
            inputs: `
                <input type="email" placeholder="Your email" required>
                <textarea placeholder="Describe your issue..." rows="4" required></textarea>
            `,
            actions: [
                { label: 'Send Email', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove(); showForm('success', 'Email Sent', 'Thank you! We will reply within 24 hours.')" },
                { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.callSupportForm = function() {
        showForm('info', '📞 Phone Support', 'Our support line: 1-800-LUCKY-SPIN', {
            actions: [
                { label: 'Call Now', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove(); showForm('info', 'Calling...', 'Dialing 1-800-LUCKY-SPIN...')" },
                { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.depositForm = function(amount) {
        deposit(amount);
    };
    
    window.changeLeaderboardPeriodForm = function(period) {
        document.querySelectorAll('.time-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(period)) {
                btn.classList.add('active');
            }
        });
        
        showForm('info', `📊 ${period.charAt(0).toUpperCase() + period.slice(1)} Leaderboard`, 'Loading leaderboard data...', {
            progress: 80
        });
        
        setTimeout(() => {
            showForm('success', 'Leaderboard Loaded', `${period.charAt(0).toUpperCase() + period.slice(1)} leaderboard loaded successfully!`, {
                icon: '🏆'
            });
        }, 800);
    };
    
    window.showTermsForm = function() {
        showForm('info', '📄 Terms & Conditions', 'This is a demo casino game for entertainment purposes only. No real money is involved.', {
            actions: [
                { label: 'I Agree', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" },
                { label: 'Close', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.showPrivacyForm = function() {
        showForm('info', '🔒 Privacy Policy', 'Your data is stored locally in your browser. We do not collect personal information.', {
            actions: [
                { label: 'Accept', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" },
                { label: 'Close', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.showCookiesForm = function() {
        showForm('info', '🍪 Cookie Policy', 'We use localStorage to save your game progress. No tracking cookies are used.', {
            actions: [
                { label: 'Accept All', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" },
                { label: 'Customize', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    // НОВЫЕ ФУНКЦИИ ДЛЯ LOCALSTORAGE
    
    window.exportGameDataForm = function() {
        const gameData = exportGameData();
        showForm('info', '💾 Export Game Data', 'Your game data in JSON format:', {
            inputs: `<textarea readonly rows="8" style="width:100%; font-family:monospace; background:#1a1a2e; color:#00ffb0; padding:10px; border-radius:5px;">${gameData}</textarea>`,
            actions: [
                { label: 'Copy to Clipboard', type: 'primary', onClick: "navigator.clipboard.writeText(document.querySelector('.message-form textarea').value); document.getElementById(this.closest('.message-form').id).remove(); showForm('success', 'Copied!', 'Game data copied to clipboard!')" },
                { label: 'Close', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.resetGameForm = function() {
        showForm('warning', '⚠️ Reset Game', 'Are you sure you want to reset all game progress? This cannot be undone!', {
            actions: [
                { label: 'Yes, Reset', type: 'error', onClick: "resetGameState(); document.getElementById(this.closest('.message-form').id).remove(); location.reload()" },
                { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    window.showStatsForm = function() {
        const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : 0;
        showForm('info', '📊 Game Statistics', `
            <div style="text-align:left; line-height:2;">
                <div><strong>Balance:</strong> $${balance.toLocaleString()}</div>
                <div><strong>Games Played:</strong> ${gamesPlayed}</div>
                <div><strong>Wins:</strong> ${wins}</div>
                <div><strong>Win Rate:</strong> ${winRate}%</div>
                <div><strong>Total Won:</strong> $${totalWon.toLocaleString()}</div>
                <div><strong>Level:</strong> ${currentLevel}</div>
                <div><strong>Experience:</strong> ${playerExperience} XP</div>
                <div><strong>Ad Clicks:</strong> ${adClicks.length}</div>
                <div><strong>Ad Revenue:</strong> $${adRevenue.toFixed(2)}</div>
                <div><strong>Last Save:</strong> ${new Date().toLocaleString()}</div>
            </div>
        `, {
            actions: [
                { label: 'Export Data', type: 'primary', onClick: "exportGameDataForm()" },
                { label: 'Close', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    };
    
    // Добавляем кнопку статистики в профиль
    window.addStatsButton = function() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            const modalBody = profileModal.querySelector('.modal-body');
            if (modalBody) {
                const statsButton = document.createElement('button');
                statsButton.className = 'btn btn-info w-100 mt-3';
                statsButton.innerHTML = '<i class="fas fa-chart-bar me-2"></i>Show Statistics';
                statsButton.onclick = function() {
                    const modal = bootstrap.Modal.getInstance(profileModal);
                    if (modal) modal.hide();
                    setTimeout(() => window.showStatsForm(), 300);
                };
                modalBody.appendChild(statsButton);
            }
        }
    };
    
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    loadGameState(); // Загружаем сохранённое состояние
    updateBetDisplay();
    updateBalanceDisplay();
    updateStats();
    updatePlayerLevel();
    showPage('home');
    
    // Автоматическое сохранение каждые 30 секунд
    setInterval(saveGameState, 30000);
    
    setInterval(updateLiveStats, 30000);
    
    // Показываем статистику при загрузке (только в консоли)
    console.log('📊 Текущая статистика:', {
        balance: balance,
        gamesPlayed: gamesPlayed,
        wins: wins,
        totalWon: totalWon,
        level: currentLevel,
        experience: playerExperience,
        adClicks: adClicks.length,
        adRevenue: adRevenue
    });
    
    // Show welcome form after 3 seconds
    // В welcome форме после загрузки:
setTimeout(() => {
    // ПРОВЕРЬ: Уже получали welcome бонус?
    if (bonusesClaimed.welcomeBonus) {
        showForm('info', '👋 Welcome Back!', 'Your welcome bonus was already claimed. Enjoy the game!', {
            icon: '🎰',
            actions: [
                { label: 'Start Playing', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    } else {
        showForm('info', '🎉 Welcome to Lucky Spin Slots!', 'Enjoy free casino games. Claim your welcome bonus to get started!', {
            icon: '🎰',
            actions: [
                { label: 'Claim Bonus', type: 'primary', onClick: "claimBonusForm('welcome'); document.getElementById(this.closest('.message-form').id).remove()" },
                { label: 'Start Playing', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    }
}, 3000);
    
    // Добавляем кнопку статистики
    setTimeout(addStatsButton, 1000);
    
    console.log('✅ Все системы работают! Наслаждайтесь игрой!');
    console.log('💾 LocalStorage сохранение включено. Данные сохраняются автоматически.');
});

// Автоматическое сохранение при закрытии вкладки
window.addEventListener('beforeunload', function() {
    if (typeof saveGameState === 'function') {
        saveGameState();
        console.log('💾 Игра сохранена перед закрытием вкладки');
    }
});

function checkAvailableBonuses() {
    const available = [];
    
    if (!bonusesClaimed.welcomeBonus) {
        available.push({ type: 'welcome', name: 'Welcome Bonus', amount: 1000 });
    }
    
    if (lastBonusTime.daily) {
        const hoursSince = (new Date() - new Date(lastBonusTime.daily)) / (1000 * 60 * 60);
        if (hoursSince >= 24) {
            available.push({ type: 'daily', name: 'Daily Bonus', amount: 100 });
        }
    } else {
        available.push({ type: 'daily', name: 'Daily Bonus', amount: 100 });
    }
    
    if (lastBonusTime.weekly) {
        const daysSince = (new Date() - new Date(lastBonusTime.weekly)) / (1000 * 60 * 60 * 24);
        if (daysSince >= 7) {
            available.push({ type: 'weekly', name: 'Weekly Bonus', amount: 250 });
        }
    } else {
        available.push({ type: 'weekly', name: 'Weekly Bonus', amount: 250 });
    }
    
    return available;
}

window.showAvailableBonuses = function() {
    const available = checkAvailableBonuses();
    
    if (available.length === 0) {
        showForm('info', '🎁 No Bonuses Available', 'Check back later for new bonuses!', {
            icon: '⏳',
            actions: [
                { label: 'OK', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
        return;
    }
    
    let message = '<div style="text-align:left; line-height:2;">';
    available.forEach(bonus => {
        message += `<div><strong>${bonus.name}:</strong> $${bonus.amount}</div>`;
    });
    message += '</div>';
    
    showForm('info', '🎁 Available Bonuses', message, {
        icon: '💰',
        actions: available.map(bonus => ({
            label: `Claim ${bonus.name}`,
            type: 'primary',
            onClick: `claimBonusForm('${bonus.type}'); document.getElementById(this.closest('.message-form').id).remove()`
        }))
    });
};

// Стили для уведомлений о достижениях
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
    .achievement-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        border: 2px solid #ffd700;
        border-radius: 15px;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.5s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        max-width: 350px;
    }
    
    .achievement-notification.show {
        transform: translateX(0);
    }
    
    .achievement-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .achievement-content {
        flex: 1;
    }
    
    .achievement-title {
        color: #ffd700;
        font-weight: 700;
        font-size: 1.1rem;
        margin-bottom: 5px;
    }
    
    .achievement-message {
        color: white;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(achievementStyles);