// script.js - Полностью рабочий сайт со всеми формами вместо всплывающих сообщений

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
        
        // Автоматическое удаление через 5 секунд, если не требуется действие
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
    }
    
    function addExperience(points) {
        playerExperience += points;
        updatePlayerLevel();
        
        if (playerExperience === 100 || playerExperience === 500 || playerExperience === 1000) {
            showForm('success', '🎉 Level Up!', `You are now ${currentLevel}!`);
        }
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
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('play-btn') || e.target.classList.contains('mini-play-btn')) {
            const gameName = e.target.closest('.game-card, .game-mini-card')?.querySelector('h3, h6')?.textContent || 'Game';
            showForm('info', `🎮 Loading ${gameName}`, 'The game is loading... Good luck!');
            showPage('home');
            addExperience(15);
        }
        
        if (e.target.classList.contains('claim-btn')) {
            const bonusName = e.target.closest('.promotion-card')?.querySelector('h3, h4')?.textContent || 'Bonus';
            const bonusAmount = bonusName.includes('Welcome') ? 1000 : 
                               bonusName.includes('Free') ? 200 : 
                               bonusName.includes('Cashback') ? 150 : 100;
            
            balance += bonusAmount;
            updateBalanceDisplay();
            addExperience(30);
            
            showForm('success', '🎉 Bonus Claimed!', `${bonusName} claimed! $${bonusAmount} added to your balance!`);
            showAchievement("Bonus Hunter!", `Claimed ${bonusName}`);
        }
        
        if (e.target.classList.contains('support-btn')) {
            const action = e.target.textContent;
            if (action.includes('Chat')) {
                showForm('info', '💬 Live Chat', 'Connecting you to a support agent...', {
                    progress: 75,
                    actions: [
                        { label: 'Continue', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
                    ]
                });
            } else if (action.includes('Email')) {
                showForm('info', '📧 Email Support', 'Email: support@luckyspinslots.com', {
                    inputs: '<textarea placeholder="Type your message here..." rows="3"></textarea>',
                    actions: [
                        { label: 'Send Email', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove(); alert('Email sent successfully!')" },
                        { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
                    ]
                });
            } else if (action.includes('Call')) {
                showForm('info', '📞 Call Support', 'Call us at: 1-800-LUCKY-SPIN', {
                    actions: [
                        { label: 'Dial Now', type: 'primary', onClick: "document.getElementById(this.closest('.message-form').id).remove(); alert('Calling support...')" },
                        { label: 'Cancel', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
                    ]
                });
            }
        }
        
        if (e.target.classList.contains('deposit-btn')) {
            const amount = parseInt(e.target.textContent.replace('+$', '')) || 100;
            deposit(amount);
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
        showForm('success', '🎁 Ad Bonus!', `You earned a $25 bonus for checking ${productName}!`, {
            icon: '💰'
        });
        balance += 25;
        updateBalanceDisplay();
        addExperience(10);
    };
    
    window.giveAdBonus = function(productKey) {
        balance += 25;
        updateBalanceDisplay();
        showForm('success', '🎁 Bonus Added!', '+$25 bonus for clicking ad!', {
            icon: '💰'
        });
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
        balance += amount;
        updateBalanceDisplay();
        showForm('success', '🎉 Bonus Claimed!', `Claimed ${type} bonus! +$${amount} added!`, {
            icon: '💰'
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
    
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    updateBetDisplay();
    updateBalanceDisplay();
    updateStats();
    updatePlayerLevel();
    showPage('home');
    
    setInterval(updateLiveStats, 30000);
    
    // Show welcome form after 3 seconds
    setTimeout(() => {
        showForm('info', '🎉 Welcome to Lucky Spin Slots!', 'Enjoy free casino games. Claim your welcome bonus to get started!', {
            icon: '🎰',
            actions: [
                { label: 'Claim Bonus', type: 'primary', onClick: "claimBonusForm('welcome'); document.getElementById(this.closest('.message-form').id).remove()" },
                { label: 'Start Playing', type: 'secondary', onClick: "document.getElementById(this.closest('.message-form').id).remove()" }
            ]
        });
    }, 3000);
    
    console.log('✅ Все системы работают! Наслаждайтесь игрой!');
});

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