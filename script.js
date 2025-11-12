// script.js
document.addEventListener('DOMContentLoaded', function() {
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
    
    let balance = 1000;
    let betAmount = 10;
    let isSpinning = false;
    let gamesPlayed = 0;
    let wins = 0;
    let totalWon = 0;
    
    // Initialize Bootstrap modal
    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
    
    // AdSense configuration with explicit sizes
    const adConfigs = [
        { 
            containerId: 'ad-container-1', 
            adSlot: '3663384197',
            width: 300,
            height: 250
        },
        { 
            containerId: 'ad-container-2', 
            adSlot: '3663384197',
            width: 300,
            height: 250
        },
        { 
            containerId: 'ad-container-3', 
            adSlot: '9518346104',
            width: 300,
            height: 250
        }
    ];

    // Wait for page to be fully rendered
    function initializeAds() {
        // Wait a bit for layout to stabilize
        setTimeout(() => {
            loadAdsWithRetry();
        }, 2000);
    }

    function loadAdsWithRetry(retryCount = 0) {
        if (typeof adsbygoogle === 'undefined') {
            if (retryCount < 5) {
                setTimeout(() => loadAdsWithRetry(retryCount + 1), 500);
            }
            return;
        }

        adConfigs.forEach((config, index) => {
            const container = document.getElementById(config.containerId);
            if (container && !container.hasAttribute('data-ad-loaded')) {
                
                // Clear container
                container.innerHTML = '';
                
                // Create ad element with explicit dimensions
                const adElement = document.createElement('ins');
                adElement.className = 'adsbygoogle';
                adElement.style.display = 'block';
                adElement.style.width = config.width + 'px';
                adElement.style.height = config.height + 'px';
                adElement.style.margin = '0 auto';
                adElement.setAttribute('data-ad-client', 'ca-pub-5498731823693191');
                adElement.setAttribute('data-ad-slot', config.adSlot);
                
                container.appendChild(adElement);
                container.setAttribute('data-ad-loaded', 'true');
                
                // Load ad with increasing delays
                setTimeout(() => {
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        console.log(`Ad ${index + 1} loaded successfully`);
                    } catch (error) {
                        console.error(`Error loading ad ${index + 1}:`, error);
                        // Retry once
                        setTimeout(() => {
                            try {
                                (adsbygoogle = window.adsbygoogle || []).push({});
                            } catch (e) {
                                showAdFallback(container);
                            }
                        }, 1000);
                    }
                }, index * 1500);
            }
        });
    }

    // Show fallback content
    function showAdFallback(container) {
        container.innerHTML = `
            <div class="ad-fallback">
                <div class="ad-fallback-content">
                    <div class="ad-size">Advertisement</div>
                    <div class="ad-message">300 x 250</div>
                    <div class="ad-cta">Your ad here</div>
                </div>
            </div>
        `;
    }

    // Reload ads when page changes
    function reloadAds() {
        setTimeout(() => {
            if (typeof adsbygoogle !== 'undefined') {
                adConfigs.forEach((config, index) => {
                    const container = document.getElementById(config.containerId);
                    if (container && container.hasAttribute('data-ad-loaded')) {
                        setTimeout(() => {
                            try {
                                (adsbygoogle = window.adsbygoogle || []).push({});
                            } catch (error) {
                                console.error(`Error reloading ad ${index + 1}:`, error);
                            }
                        }, index * 800);
                    }
                });
            }
        }, 500);
    }
    
    // Update bet amount display
    function updateBetDisplay() {
        betAmountElement.textContent = betAmount;
    }
    
    // Update balance display
    function updateBalanceDisplay() {
        balanceElement.textContent = balance.toLocaleString();
        modalBalance.textContent = balance.toLocaleString();
    }
    
    // Spin animation for a single reel
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
    
    // Main spin function
    async function spin() {
        if (isSpinning) return;
        
        if (balance < betAmount) {
            winMessage.textContent = "Insufficient balance!";
            winMessage.style.color = "#ff0055";
            return;
        }
        
        isSpinning = true;
        winMessage.textContent = "";
        balance -= betAmount;
        gamesPlayed++;
        updateBalanceDisplay();
        
        // Add spinning animation class
        reel1.classList.add('spinning');
        reel2.classList.add('spinning');
        reel3.classList.add('spinning');
        
        // Disable spin button during spin
        spinBtn.disabled = true;
        
        // Spin reels with different durations for visual effect
        const spin1 = spinReel(reel1, 1000);
        const spin2 = spinReel(reel2, 1500);
        const spin3 = spinReel(reel3, 2000);
        
        // Wait for all reels to stop
        const results = await Promise.all([spin1, spin2, spin3]);
        
        // Remove spinning animation class
        reel1.classList.remove('spinning');
        reel2.classList.remove('spinning');
        reel3.classList.remove('spinning');
        
        // Re-enable spin button
        spinBtn.disabled = false;
        
        // Check for win
        checkWin(results);
        isSpinning = false;
    }
    
    // Check if the spin resulted in a win
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
            
            winMessage.textContent = `JACKPOT! YOU WON $${winAmount}`;
            winMessage.style.color = "#00ffb0";
            
            // Add celebration effect
            document.querySelector('.slot-machine').classList.add('celebrate');
            setTimeout(() => {
                document.querySelector('.slot-machine').classList.remove('celebrate');
            }, 2000);
        } else {
            winMessage.textContent = "Try again!";
            winMessage.style.color = "#ff8800";
        }
        
        updateStats();
    }
    
    // Update game statistics
    function updateStats() {
        document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = gamesPlayed;
        document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = wins;
        document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = totalWon;
    }
    
    // Deposit money
    function deposit(amount) {
        balance += amount;
        updateBalanceDisplay();
        
        // Show deposit confirmation
        const originalText = winMessage.textContent;
        winMessage.textContent = `+$${amount} Added to Balance!`;
        winMessage.style.color = "#00ffb0";
        
        setTimeout(() => {
            winMessage.textContent = originalText;
        }, 2000);
    }
    
    // Page navigation system
    function showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) {
            activePage.classList.add('active');
        }
        
        // Update page title
        const pageTitles = {
            'home': 'Lucky Spin Slots - Play Free Online',
            'games': 'Our Games - Lucky Spin Slots',
            'promotions': 'Promotions - Lucky Spin Slots',
            'leaderboard': 'Leaderboard - Lucky Spin Slots',
            'support': 'Support - Lucky Spin Slots'
        };
        
        document.title = pageTitles[pageId] || 'Lucky Spin Slots';
        
        // Reload ads when switching pages
        reloadAds();
    }
    
    // FAQ functionality
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }
    
    // Initialize timer for promotions
    function initPromoTimer() {
        // Calculate time until next Friday
        const now = new Date();
        const daysUntilFriday = (5 - now.getDay() + 7) % 7;
        const nextFriday = new Date(now);
        nextFriday.setDate(now.getDate() + daysUntilFriday);
        nextFriday.setHours(0, 0, 0, 0);
        
        function updateTimer() {
            const now = new Date();
            const diff = nextFriday - now;
            
            if (diff <= 0) {
                // It's Friday!
                document.getElementById('fridayTimer').textContent = "Available Now!";
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('fridayTimer').textContent = `${days}d ${hours}h ${minutes}m`;
        }
        
        updateTimer();
        setInterval(updateTimer, 60000); // Update every minute
    }
    
    // Event listeners
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
    
    // Profile modal
    profileBtn.addEventListener('click', function() {
        profileModal.show();
    });
    
    // Deposit buttons
    document.querySelectorAll('.deposit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseInt(this.getAttribute('data-amount'));
            deposit(amount);
        });
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        this.innerHTML = mobileNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('data-page');
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
                l.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile menu if open
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
            
            // Show the selected page
            showPage(pageId);
        });
    });
    
    // Play buttons on games page
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('play-btn')) {
            // Navigate to home page and show slot machine
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === 'home') {
                    link.classList.add('active');
                }
            });
            showPage('home');
            
            // Show message about the game
            winMessage.textContent = "Welcome to Lucky Slots! Place your bet and spin to win!";
            winMessage.style.color = "#ffd700";
        }
    });
    
    // Time filters on leaderboard
    document.querySelectorAll('.time-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            document.querySelectorAll('.time-filter').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            // Here you would typically load different leaderboard data
        });
    });
    
    // Support buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('support-btn')) {
            const action = e.target.textContent;
            let message = '';
            
            switch(action) {
                case 'Start Chat':
                    message = "Live chat support will be available soon!";
                    break;
                case 'Send Email':
                    message = "Redirecting to email support...";
                    break;
                case 'View FAQ':
                    message = "FAQ section is now expanded below.";
                    // Expand all FAQ items
                    document.querySelectorAll('.faq-item').forEach(item => {
                        item.classList.add('active');
                    });
                    break;
                default:
                    message = "Support feature coming soon!";
            }
            
            winMessage.textContent = message;
            winMessage.style.color = "#00ffb0";
            
            // Navigate to home to show the message
            showPage('home');
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === 'home') {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Claim buttons on promotions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('claim-btn')) {
            const promotion = e.target.closest('.promotion-card');
            const title = promotion.querySelector('h3').textContent;
            
            let message = '';
            let bonusAmount = 0;
            
            switch(title) {
                case 'Welcome Bonus':
                    message = "Welcome bonus claimed! $1000 added to your balance!";
                    bonusAmount = 1000;
                    break;
                case 'Free Spins Friday':
                    message = "50 Free Spins added to your account!";
                    break;
                case 'Cashback Bonus':
                    message = "Cashback bonus activated! You'll receive 10% cashback weekly.";
                    break;
                case 'VIP Program':
                    message = "Welcome to our VIP program! Exclusive rewards unlocked.";
                    break;
                default:
                    message = "Bonus claimed successfully!";
            }
            
            if (bonusAmount > 0) {
                deposit(bonusAmount);
            }
            
            winMessage.textContent = message;
            winMessage.style.color = "#00ffb0";
            
            // Navigate to home to show the message
            showPage('home');
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === 'home') {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Initialize
    updateBetDisplay();
    updateBalanceDisplay();
    updateStats();
    initFAQ();
    initPromoTimer();
    showPage('home'); // Show home page by default
    
    // Initialize ads after page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(initializeAds, 1000);
    });
    
    // Add CSS for spinning animation and ads
    const style = document.createElement('style');
    style.textContent = `
        .spinning {
            animation: spin 0.1s infinite;
        }
        
        @keyframes spin {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
        
        .celebrate {
            animation: celebrate 0.5s;
        }
        
        @keyframes celebrate {
            0%, 100% { box-shadow: 0 0 40px rgba(0, 0, 0, 0.8); }
            50% { box-shadow: 0 0 60px gold; }
        }
        
        /* Ad fallback styles */
        .ad-fallback {
            background: #1a0b2e;
            width: 100%;
            height: 250px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .ad-fallback-content {
            text-align: center;
            color: #666;
        }
        
        .ad-fallback .ad-size {
            font-size: 1rem;
            margin-bottom: 8px;
            color: #888;
        }
        
        .ad-fallback .ad-message {
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .ad-fallback .ad-cta {
            font-size: 0.8rem;
            opacity: 0.7;
        }
        
        /* Ensure ads are properly sized and visible */
        .adsbygoogle {
            border-radius: 10px;
            overflow: hidden;
            margin: 0 auto;
            min-width: 300px;
            min-height: 250px;
        }
        
        .ad-slot {
            min-height: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
});