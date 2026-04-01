/**
 * ARQUITETURA DE SOFTWARE AVANÇADA (Vanilla JS)
 * Agência Elite Digital
 */

// 1. Classe da Ilha Dinâmica
class DynamicIsland {
    constructor() {
        this.island = document.getElementById('dynamicIsland');
        this.isOpen = false;
        this.init();
    }

    init() {
        // Clica para abrir/fechar
        this.island.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Clica fora para fechar
        document.body.addEventListener('click', () => {
            if (this.isOpen) this.close();
        });

        // Links do menu fecham a ilha
        const links = this.island.querySelectorAll('.menu-link');
        links.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.island.classList.add('expanded');
        this.isOpen = true;
    }

    close() {
        this.island.classList.remove('expanded');
        this.isOpen = false;
    }
}

// 2. Classe do Simulador de ROI Interativo
class ROICalculator {
    constructor() {
        this.inputs = ['inp-orcamento', 'inp-cpl', 'inp-taxa', 'inp-ticket'];
        this.init();
    }

    init() {
        this.inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.calculate());
        });
        this.calculate(); // Cálculo inicial
    }

    formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    formatCompact(value) {
        if (value >= 1000000) return 'R$ ' + (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return 'R$ ' + (value / 1000).toFixed(1) + 'k';
        return 'R$ ' + value.toFixed(0);
    }

    calculate() {
        const orcamento = parseFloat(document.getElementById('inp-orcamento').value) || 0;
        const cpl = parseFloat(document.getElementById('inp-cpl').value) || 1;
        const taxa = (parseFloat(document.getElementById('inp-taxa').value) || 0) / 100;
        const ticket = parseFloat(document.getElementById('inp-ticket').value) || 0;

        const leads = orcamento / cpl;
        const vendas = leads * taxa;
        const faturamento = vendas * ticket;
        const lucro = faturamento - orcamento;

        // Atualiza DOM
        document.getElementById('val-invest').innerText = this.formatCompact(orcamento);
        document.getElementById('val-return').innerText = this.formatCompact(faturamento);
        
        const txtLucro = document.getElementById('txt-lucro');
        txtLucro.innerText = this.formatCurrency(lucro);

        // Lógica Avançada do Gráfico CSS
        const barInvest = document.getElementById('bar-invest');
        const barReturn = document.getElementById('bar-return');

        if (faturamento > orcamento && orcamento > 0) {
            let razao = orcamento / faturamento;
            barReturn.style.height = '85%';
            barInvest.style.height = Math.max(10, 85 * razao) + '%';
            txtLucro.style.color = '#0f0'; // Lucro = Verde
        } else if (orcamento >= faturamento && orcamento > 0) {
            let razao = faturamento / orcamento;
            barInvest.style.height = '85%';
            barReturn.style.height = Math.max(10, 85 * razao) + '%';
            txtLucro.style.color = '#ff3333'; // Prejuízo = Vermelho
        } else {
            barInvest.style.height = '10%';
            barReturn.style.height = '10%';
            txtLucro.style.color = '#aaa';
        }
    }
}

// 3. Sistema de Abas (Tabs)
function initTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Adiciona no alvo
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// 4. Animação de Scroll (Intersection Observer - Nível Sênior)
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Opcional: observer.unobserve(entry.target) para animar só uma vez
            }
        });
    }, { threshold: 0.15 }); // Ativa quando 15% do elemento aparece na tela

    reveals.forEach(element => {
        observer.observe(element);
    });
}

// 5. Métricas em Tempo Real (Simulador)
function initLiveMetrics() {
    let leads = 1240;
    let ads = 8432;
    setInterval(() => {
        if (Math.random() > 0.4) {
            leads += Math.floor(Math.random() * 4);
            document.getElementById('leads-counter').innerText = leads.toLocaleString();
        }
        ads += Math.floor(Math.random() * 7);
        document.getElementById('ads-counter').innerText = ads.toLocaleString();
    }, 2500);
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    new DynamicIsland();
    new ROICalculator();
    initTabs();
    initScrollAnimations();
    initLiveMetrics();
});
