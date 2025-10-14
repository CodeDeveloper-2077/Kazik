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
    
    let balance = 1000;
    let betAmount = 10;
    let isSpinning = false;
    
    // Update bet amount display
    function updateBetDisplay() {
        betAmountElement.textContent = betAmount;
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
            return;
        }
        
        isSpinning = true;
        winMessage.textContent = "";
        balance -= betAmount;
        balanceElement.textContent = balance.toLocaleString();
        
        // Add spinning animation class
        reel1.classList.add('spinning');
        reel2.classList.add('spinning');
        reel3.classList.add('spinning');
        
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
            balanceElement.textContent = balance.toLocaleString();
            winMessage.textContent = `JACKPOT! YOU WON $${winAmount}`;
            
            // Add celebration effect
            document.querySelector('.slot-machine').classList.add('celebrate');
            setTimeout(() => {
                document.querySelector('.slot-machine').classList.remove('celebrate');
            }, 2000);
        } else {
            winMessage.textContent = "Try again!";
        }
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
    
    // Initialize
    updateBetDisplay();
    
    // Add CSS for spinning animation
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
    `;
    document.head.appendChild(style);
});