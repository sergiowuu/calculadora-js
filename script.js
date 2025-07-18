document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');
    const historyList = document.getElementById('history-list');
    const historyContainer = document.getElementById('historyContainer');
    const toggleHistoryBtn = document.getElementById('toggle-history');

    // --- VARIÁVEIS DE ESTADO ---
    let currentExpression = ''; // Armazena a expressão matemática atual.
    let history = []; // Armazena o histórico de cálculos como um array de objetos.

    // --- MANIPULADORES DE EVENTOS ---

    // Alterna a visibilidade do painel de histórico.
    toggleHistoryBtn.addEventListener('click', () => {
        historyContainer.classList.toggle('show');
    });

    // Adiciona um evento de clique a todos os botões da calculadora.
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            const dataValue = button.dataset.value;

            // Roteia a ação com base no ID ou tipo do botão.
            if (button.id === 'clear') {
                clearDisplay();
            } else if (button.id === 'backspace') {
                deleteLastChar();
            } else if (button.id === 'equals') {
                calculate();
            } else {
                appendToDisplay(dataValue !== undefined ? dataValue : value);
            }
        });
    });

    // --- FUNÇÕES DA CALCULADORA ---

    // Concatena o valor do botão à expressão atual.
    function appendToDisplay(value) {
        currentExpression += value;
        display.value = currentExpression;
    }

    // Limpa o display e a expressão atual.
    function clearDisplay() {
        currentExpression = '';
        display.value = '';
    }

    // Remove o último caractere da expressão.
    function deleteLastChar() {
        currentExpression = currentExpression.slice(0, -1);
        display.value = currentExpression;
    }

    // Função principal que avalia a expressão matemática.
    function calculate() {
        if (currentExpression === '') return;

        let expressionToEvaluate = currentExpression;

        try {
            // Fecha automaticamente quaisquer parênteses que foram deixados abertos.
            const openParens = (expressionToEvaluate.match(/\(/g) || []).length;
            const closedParens = (expressionToEvaluate.match(/\)/g) || []).length;
            if (openParens > closedParens) {
                expressionToEvaluate += ')'.repeat(openParens - closedParens);
            }

            // Converte a expressão para uma sintaxe válida em JavaScript para o cálculo.
            let evalExpression = expressionToEvaluate
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(');

            // Executa o cálculo usando a função eval().
            const result = eval(evalExpression);

            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Resultado inválido");
            }
            
            // Salva e exibe o resultado.
            addToHistory(expressionToEvaluate, result);
            display.value = result;
            currentExpression = result.toString();

        } catch (error) {
            // Em caso de erro na expressão, exibe 'Erro' no display.
            display.value = 'Erro';
            currentExpression = '';
            console.error("Erro no cálculo:", error); 
        }
    }

    // --- FUNÇÕES DO HISTÓRICO ---

    // Adiciona um cálculo ao array de histórico e atualiza a interface.
    function addToHistory(expression, result) {
        const historyItem = { expression, result };
        history.push(historyItem);
        renderHistory();
    }

    // Renderiza a lista de histórico na tela.
    function renderHistory() {
        historyList.innerHTML = ''; 
        history.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.expression}</span> = <strong>${item.result}</strong>`;
            
            // Adiciona um evento que permite recolocar um cálculo antigo no display.
            li.addEventListener('click', () => {
                currentExpression = item.expression;
                display.value = currentExpression;
                // Esconde o histórico em telas pequenas após o clique.
                if (window.innerWidth <= 820) {
                    historyContainer.classList.remove('show');
                }
            });
            historyList.appendChild(li);
        });
    }
});