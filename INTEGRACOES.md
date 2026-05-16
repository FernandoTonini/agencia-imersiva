# 🔌 Guia de Integrações — The Agência

Este guia te explica passo-a-passo como conectar o quiz aos seus canais de notificação.

**Todas as configurações ficam em UM SÓ LUGAR**: no topo do arquivo `quiz.html`, dentro do bloco `CONFIG`.

```js
const CONFIG = {
  WHATSAPP_NUMBER: '5511999999999',
  WEBHOOK_URL: '',
  SHEETS_WEBHOOK: '',
  EMAILJS_PUBLIC_KEY: '',
  EMAILJS_SERVICE_ID: '',
  EMAILJS_TEMPLATE_ID: ''
};
```

**As integrações são independentes**: você pode habilitar só uma, todas, ou nenhuma. Se um campo estiver vazio (`''`), aquela integração é silenciosamente pulada.

---

## 1️⃣ WhatsApp da Agência (botão de contato)

**O que faz:** No final do quiz, o cliente clica num botão e abre o WhatsApp para falar contigo direto.

**Como configurar:**

1. Pega o seu número de WhatsApp com DDI + DDD (ex: 55 11 98765-4321)
2. Tira tudo que não é número: vira `5511987654321`
3. Em `quiz.html`, troca:

```js
WHATSAPP_NUMBER: '5511999999999',  // ← seu número aqui
```

✅ **Pronto. Sem nada externo.**

---

## 2️⃣ Google Sheets (cada lead vira linha em planilha)

**O que faz:** Toda vez que alguém termina o quiz, uma linha nova aparece automaticamente em uma planilha sua. Você abre o Google Sheets e vê todos os leads em tempo real.

**Passo-a-passo:**

### 2.1. Crie a planilha
1. Abre [sheets.google.com](https://sheets.google.com)
2. Cria uma planilha nova chamada **"Leads The Agência"**
3. Na primeira linha (cabeçalho), cole isso:

```
Data | ID | Tier | Score | Nome | Empresa | WhatsApp | Email | Instagram | Estágio | Gargalo | Marketing | Budget | Urgência | Decisor | Prioridades | Contexto
```

### 2.2. Abre o Apps Script
1. No menu da planilha: **Extensões → Apps Script**
2. Abre uma tela de código. Apaga o que tem lá e cola:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const a = data.answers || {};
  
  const getVal = (k) => {
    const v = a[k];
    if (!v) return '';
    if (v.value) return v.value;
    if (v.labels) return v.labels.join(' | ');
    return v.label || '';
  };
  
  sheet.appendRow([
    new Date(data.createdAt),
    data.id,
    (data.tier || '').toUpperCase(),
    data.score,
    data.contact?.name || '',
    data.contact?.biz || '',
    data.contact?.phone || '',
    data.contact?.email || '',
    data.contact?.ig || '',
    getVal('stage'),
    getVal('bottleneck_early') || getVal('bottleneck_grow') || getVal('bottleneck_scale') || getVal('why_now'),
    getVal('mkt_history'),
    getVal('budget'),
    getVal('urgency'),
    getVal('decision'),
    getVal('priorities'),
    getVal('context')
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Clica em **Salvar** (ícone disquete) e dá um nome ao projeto

### 2.3. Implanta como Web App
1. Clica no botão azul **Implantar → Nova implantação**
2. Em "Selecionar tipo" (ícone engrenagem), escolhe **Aplicativo da Web**
3. Configurações:
   - **Descrição**: "Webhook leads"
   - **Executar como**: Eu mesmo
   - **Quem tem acesso**: **Qualquer pessoa** (importante!)
4. Clica em **Implantar**
5. Autoriza com sua conta Google (clica em "Avançado" → "Acessar..." se aparecer aviso)
6. **COPIA a URL** que aparece em "URL do aplicativo da Web" (algo como `https://script.google.com/macros/s/.../exec`)

### 2.4. Cola no quiz.html
```js
SHEETS_WEBHOOK: 'https://script.google.com/macros/s/SUA-URL-COPIADA/exec',
```

✅ **Pronto.** Toda submissão vai cair na planilha automaticamente.

---

## 3️⃣ E-mail Automático (via EmailJS)

**O que faz:** Cada novo lead te dispara um e-mail formatado com todas as informações.

**Passo-a-passo:**

### 3.1. Cria conta no EmailJS
1. Vai em [emailjs.com](https://www.emailjs.com) e cria conta grátis (200 e-mails/mês de graça)
2. No dashboard, vai em **Email Services → Add New Service**
3. Conecta seu Gmail (ou outro provedor) e clica em "Create Service"
4. Anota o **Service ID** (algo tipo `service_xyz123`)

### 3.2. Cria o template
1. Vai em **Email Templates → Create New Template**
2. Em "Subject" coloca: `🔥 Novo lead {{tier}} · {{name}} ({{biz}})`
3. Em "Content" cola:

```
Olá!

Você recebeu um novo lead pelo diagnóstico estratégico.

═══ CLASSIFICAÇÃO ═══
Tier: {{tier}}
Score: {{score}} pts
ID: {{lead_id}}

═══ CONTATO ═══
Nome: {{name}}
Empresa: {{biz}}
WhatsApp: {{phone}}
E-mail: {{email}}
Instagram: {{ig}}

═══ RESPOSTAS ═══
{{answers_summary}}

═══ TIMESTAMP ═══
{{created_at}}

---
Acesse o CRM para mais detalhes e sugestões de estratégia.
```

4. Em "To Email" coloca o seu e-mail (onde quer receber as notificações)
5. Salva o template e anota o **Template ID** (algo tipo `template_abc456`)

### 3.3. Pega a Public Key
1. Vai em **Account → General**
2. Copia o **Public Key** (algo tipo `kqXyZ123aBcDeFg`)

### 3.4. Cola no quiz.html
```js
EMAILJS_PUBLIC_KEY: 'kqXyZ123aBcDeFg',
EMAILJS_SERVICE_ID: 'service_xyz123',
EMAILJS_TEMPLATE_ID: 'template_abc456',
```

✅ **Pronto.** Próximo lead → e-mail na sua caixa.

---

## 4️⃣ Webhook Universal (Make/Zapier/n8n)

**O que faz:** Envia o lead para uma plataforma de automação. De lá, você pode rotear para qualquer lugar:
- WhatsApp do seu time (via WhatsApp Cloud API)
- Telegram (notificação instantânea)
- Slack
- Discord
- ClickUp / Notion / Trello
- Pipedrive / HubSpot / RD Station

**Recomendação:** Use Make.com (mais simples e generoso no free tier).

### 4.1. Cria conta no Make.com
1. Vai em [make.com](https://www.make.com) → cria conta grátis (1000 operações/mês grátis)

### 4.2. Cria um cenário
1. **Create a new scenario**
2. Adiciona módulo **Webhooks → Custom webhook**
3. Clica em **Add** → dá um nome (ex: "Leads The Agência")
4. **COPIA a URL** gerada (algo como `https://hook.eu2.make.com/abc123xyz`)
5. Clica em **OK**

### 4.3. Adiciona ações ao cenário
Clica no `+` à direita e adiciona o que quiser:

**Para receber no Telegram (RECOMENDADO — instantâneo e grátis):**
- Adiciona módulo **Telegram Bot → Send a Text Message**
- No primeiro uso: cria um bot pelo [@BotFather](https://t.me/botfather) no Telegram, pega o token
- Configura para mandar uma mensagem tipo:
  ```
  🔥 NOVO LEAD {{tier}}
  
  {{contact.name}} · {{contact.biz}}
  📱 {{contact.phone}}
  📧 {{contact.email}}
  
  Score: {{score}} pts
  ```

**Para receber no WhatsApp:**
- Opção 1: Módulo **WhatsApp Business Cloud** (free tier Meta)
- Opção 2: Use Z-API, Twilio ou similar (pago)

**Para Slack/Discord/Email:** Make tem módulos prontos.

### 4.4. Cola a URL no quiz.html
```js
WEBHOOK_URL: 'https://hook.eu2.make.com/abc123xyz',
```

### 4.5. Ativa o cenário
No Make, liga o switch verde do cenário (canto inferior esquerdo) para "ON".

✅ **Pronto.** A cada lead, o Make dispara as ações configuradas.

---

## 🔐 Acessar o CRM web

Depois de fazer deploy no Vercel, acesse:

```
https://SEU-DOMINIO.vercel.app/crm.html
```

**Senha padrão:** `theagencia2026`

Para trocar a senha, edite no `crm.html` a linha:
```js
const CRM_PASSWORD='theagencia2026';  // ← troque aqui
```

---

## ⚠️ Importante sobre segurança

Como o site é estático (sem backend), os valores em `CONFIG` ficam visíveis no código-fonte do navegador. Isso é OK para:

- ✅ Número de WhatsApp (já é público)
- ✅ Public Key do EmailJS (foi feita para isso)
- ✅ URL de webhook do Make/Apps Script (são "obscuras" mas funcionais)

**NÃO COLOQUE EM `CONFIG`**:
- ❌ Tokens de bot do Telegram diretamente
- ❌ Chaves privadas de API
- ❌ Senhas de banco de dados

Use o Make/Zapier como camada intermediária para esconder credenciais sensíveis.

---

## 🆘 Não está funcionando?

1. Abre o site no Chrome
2. Aperta F12 → aba **Console**
3. Faz uma submissão de teste no quiz
4. Se aparecer mensagem `[webhook] falhou`, `[sheets] falhou` ou `[email] falhou` no console, é problema na configuração daquele canal específico (URL errada, permissões, etc)
5. Cada canal é independente — um falhar não derruba os outros

Qualquer dúvida, me chama.
