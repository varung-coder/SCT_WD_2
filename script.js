document.addEventListener('DOMContentLoaded', () => {
    // ================================================
    // DOM REFERENCES
    // ================================================
    const currentOperandElement = document.getElementById('current-operand');
    const previousOperandElement = document.getElementById('previous-operand');
    const displayContainer = document.querySelector('.display-container');
    const historyPanel = document.getElementById('history-panel');
    const historyList = document.getElementById('history-list');
    const historyToggle = document.getElementById('history-toggle');
    const clearHistoryBtn = document.getElementById('clear-history');
    const toast = document.getElementById('toast');
    const body = document.body;

    // ================================================
    // STATE
    // ================================================
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let shouldResetScreen = false;
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

    // ================================================
    // INIT
    // ================================================

    initSineWaveCanvas();
    createFloatingFormulas();
    renderHistory();
    setupRippleEffect();

    // ================================================
    // 3D MATH BACKGROUND — SINE WAVE CANVAS
    // ================================================
    function initSineWaveCanvas() {
        const canvas = document.getElementById('wave-canvas');
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        let time = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw 3 layered sine/cosine wave curves
            const waves = [
                { amp: 50,  freq: 0.008, speed: 0.015, yOff: 0.3,  color: 'rgba(100,180,255,0.08)',  width: 2 },
                { amp: 70,  freq: 0.005, speed: 0.01,  yOff: 0.55, color: 'rgba(60,220,180,0.06)',  width: 1.5 },
                { amp: 35,  freq: 0.012, speed: 0.02,  yOff: 0.75, color: 'rgba(180,120,255,0.07)',  width: 1.5 },
            ];

            waves.forEach(w => {
                ctx.beginPath();
                ctx.strokeStyle = w.color;
                ctx.lineWidth = w.width;

                const baseY = canvas.height * w.yOff;
                for (let x = 0; x < canvas.width; x++) {
                    const y = baseY + Math.sin(x * w.freq + time * w.speed) * w.amp
                                    + Math.cos(x * w.freq * 0.7 + time * w.speed * 1.3) * (w.amp * 0.4);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            });

            // Draw a subtle axis cross-hair in center
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(canvas.width, cy);
            ctx.stroke();

            time++;
            requestAnimationFrame(draw);
        }

        draw();
    }

    // ================================================
    // 3D MATH BACKGROUND — FLOATING FORMULAS
    // ================================================
    function createFloatingFormulas() {
        const container = document.getElementById('formulas-layer');
        const formulas = [
            'π ≈ 3.14159',
            'e ≈ 2.71828',
            'E = mc²',
            'a² + b² = c²',
            '∫ f(x)dx',
            '∑ n²',
            'sin(θ)',
            'cos(2π)',
            'lim x→∞',
            '∇ · F',
            'dx/dt',
            'f\'(x)',
            'log₂(n)',
            'Δy/Δx',
            'i² = −1',
            'φ = 1.618',
            'n! = n×(n−1)!',
            '∂f/∂x',
            'det(A)',
            'λ₁, λ₂',
            '∮ B·dl',
            'P(A|B)',
            'σ² = Var(X)',
            'ℝ → ℝ',
        ];

        for (let i = 0; i < 18; i++) {
            const el = document.createElement('div');
            el.classList.add('math-formula');
            el.textContent = formulas[Math.floor(Math.random() * formulas.length)];

            // Spread across viewport width
            el.style.left = `${Math.random() * 92 + 4}%`;
            // Start from below the screen
            el.style.bottom = `-${Math.random() * 10 + 5}%`;

            const size = Math.random() * 1.2 + 0.9;
            el.style.fontSize = `${size}rem`;

            // Longer durations = slower, more elegant drift
            const duration = Math.random() * 30 + 25;
            el.style.animationDuration = `${duration}s`;
            // Negative delay so they're already mid-flight on load
            el.style.animationDelay = `${Math.random() * -40}s`;

            container.appendChild(el);
        }
    }

    // ================================================
    // BUTTON EVENTS
    // ================================================
    document.querySelectorAll('.btn-number').forEach(button => {
        button.addEventListener('click', () => {
            appendNumber(button.getAttribute('data-number'));
            updateDisplay();
        });
    });

    document.querySelectorAll('.btn-operator').forEach(button => {
        button.addEventListener('click', () => {
            chooseOperation(button.getAttribute('data-operator'));
            updateDisplay();
        });
    });

    document.querySelectorAll('.btn-action').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            if (action === 'clear') clear();
            if (action === 'delete') deleteNumber();
            if (action === 'percentage') applyPercentage();
            if (action === 'toggle-sign') toggleSign();
            updateDisplay();
        });
    });

    document.querySelector('.btn-equals').addEventListener('click', () => {
        compute();
        updateDisplay();
    });

    // ================================================
    // KEYBOARD SUPPORT
    // ================================================
    window.addEventListener('keydown', handleKeyboardInput);



    // ================================================
    // HISTORY TOGGLE
    // ================================================
    historyToggle.addEventListener('click', () => {
        if (historyPanel.classList.contains('hidden')) {
            historyPanel.style.display = 'flex';
            setTimeout(() => historyPanel.classList.remove('hidden'), 10);
        } else {
            historyPanel.classList.add('hidden');
            setTimeout(() => {
                if (historyPanel.classList.contains('hidden')) {
                    historyPanel.style.display = '';
                }
            }, 500);
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    });

    // ================================================
    // COPY TO CLIPBOARD
    // ================================================
    displayContainer.addEventListener('click', copyToClipboard);

    // ================================================
    // RIPPLE EFFECT
    // ================================================
    function setupRippleEffect() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousedown', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ================================================
    // CORE CALCULATOR LOGIC
    // ================================================
    function appendNumber(number) {
        if (currentOperand === 'Error') clear();
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentOperand.includes('.')) return;

        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            currentOperand = currentOperand.toString() + number.toString();
        }
    }

    function chooseOperation(op) {
        if (currentOperand === 'Error') return;
        if (currentOperand === '') return;

        if (previousOperand !== '' && !shouldResetScreen) {
            compute();
        }

        operation = op;
        previousOperand = currentOperand;
        shouldResetScreen = true;
    }

    function compute() {
        if (operation === undefined || currentOperand === '' || previousOperand === '') return;

        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        let computation;
        const expressionStr = `${previousOperand} ${operation} ${currentOperand}`;

        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    currentOperand = 'Error';
                    operation = undefined;
                    previousOperand = '';
                    updateActiveOperator();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle floating point precision
        computation = Math.round(computation * 10000000000) / 10000000000;

        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
        shouldResetScreen = true;

        addToHistory(expressionStr, currentOperand);
    }

    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
    }

    function deleteNumber() {
        if (shouldResetScreen || currentOperand === 'Error') {
            currentOperand = '0';
            return;
        }
        currentOperand = currentOperand.toString().slice(0, -1);
        if (currentOperand === '' || currentOperand === '-') currentOperand = '0';
    }

    function applyPercentage() {
        if (currentOperand === 'Error') return;
        const current = parseFloat(currentOperand);
        if (isNaN(current)) return;
        currentOperand = (current / 100).toString();
    }

    function toggleSign() {
        if (currentOperand === 'Error') return;
        if (currentOperand === '0') return;
        if (currentOperand.startsWith('-')) {
            currentOperand = currentOperand.slice(1);
        } else {
            currentOperand = '-' + currentOperand;
        }
    }

    // ================================================
    // DISPLAY UPDATE
    // ================================================
    function updateDisplay() {
        currentOperandElement.innerText = formatNumber(currentOperand);
        if (operation != null) {
            previousOperandElement.innerText = `${formatNumber(previousOperand)} ${operation}`;
        } else {
            previousOperandElement.innerText = '';
        }

        currentOperandElement.scrollLeft = currentOperandElement.scrollWidth;
        updateActiveOperator();
    }

    function updateActiveOperator() {
        document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active-op'));

        if (operation && shouldResetScreen) {
            const opBtn = Array.from(document.querySelectorAll('.btn-operator')).find(
                btn => btn.getAttribute('data-operator') === operation
            );
            if (opBtn) opBtn.classList.add('active-op');
        }
    }

    // ================================================
    // HELPERS
    // ================================================
    function formatNumber(number) {
        if (number === 'Error' || number === '-') return number;
        if (number === '') return '';

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    function handleKeyboardInput(e) {
        let keyProcessed = false;

        if (e.key >= '0' && e.key <= '9') { appendNumber(e.key); keyProcessed = true; }
        if (e.key === '.') { appendNumber('.'); keyProcessed = true; }
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            compute();
            triggerKeyVisual('Enter');
            keyProcessed = true;
        }
        if (e.key === 'Backspace') { deleteNumber(); keyProcessed = true; }
        if (e.key === 'Escape') { clear(); keyProcessed = true; }
        if (e.key === '+') { chooseOperation('+'); keyProcessed = true; }
        if (e.key === '-') { chooseOperation('−'); keyProcessed = true; }
        if (e.key === '*') { chooseOperation('×'); keyProcessed = true; }
        if (e.key === '/') {
            e.preventDefault();
            chooseOperation('÷');
            keyProcessed = true;
        }
        if (e.key === '%') { applyPercentage(); keyProcessed = true; }

        if (keyProcessed) {
            if (e.key !== 'Enter') triggerKeyVisual(e.key);
            updateDisplay();
        }
    }

    function triggerKeyVisual(key) {
        const btn = document.querySelector(`.btn[data-key="${key}"]`);
        if (btn) {
            btn.classList.add('active-key');

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            btn.appendChild(ripple);

            setTimeout(() => {
                btn.classList.remove('active-key');
                ripple.remove();
            }, 150);
        }
    }

    // ================================================
    // HISTORY
    // ================================================
    function addToHistory(expression, result) {
        if (result === 'Error') return;

        history.unshift({ expression, result });
        if (history.length > 50) history.pop();

        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-history-msg">No history yet</div>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                <div class="hist-expr">${item.expression} =</div>
                <div class="hist-result">${formatNumber(item.result)}</div>
            `;

            historyItem.addEventListener('click', () => {
                currentOperand = item.result.toString();
                operation = undefined;
                previousOperand = '';
                shouldResetScreen = true;
                updateDisplay();
                if (window.innerWidth <= 800) {
                    historyToggle.click();
                }
            });

            historyList.appendChild(historyItem);
        });
    }

    // ================================================
    // CLIPBOARD & TOAST
    // ================================================
    function copyToClipboard() {
        if (currentOperand === 'Error' || currentOperand === '') return;

        navigator.clipboard.writeText(currentOperand).then(() => {
            showToast();
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
});
