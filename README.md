# SAM — Landing Page

> Site institucional do **SAM — Sistema de Acompanhamento Medicamentoso**.

**Ao vivo:** [https://sam.tarslabs.io](https://sam.tarslabs.io)  
**Plataforma:** [https://sam.ngrok-free.dev](https://sam.ngrok-free.dev)

---

## O que é

Landing page estática do SAM, hospedada no GitHub Pages com domínio customizado `sam.tarslabs.io`.

Apresenta o produto para farmácias e hospitais e oferece um fluxo completo de contratação — do primeiro acesso até a pré-configuração do dispositivo IoT — sem precisar de backend.

---

## Estrutura

```
sam-landing/
├── index.html      # Página única com todas as seções + wizard
├── style.css       # Tema Aurora Glassmorphism (dark mode)
├── wizard.js       # Lógica do formulário multi-step + envio via FormSubmit
└── CNAME           # Domínio customizado: sam.tarslabs.io
```

---

## Seções da página

| Seção | Descrição |
|---|---|
| **Hero** | Headline, tagline, CTA "Contratar agora" e "Acessar plataforma" |
| **Como funciona** | 3 passos: Contrate → Plugue → Monitore |
| **Benefícios** | 6 cards: monitoramento 24/7, alertas, relatórios, mapa, plug & play, segurança |
| **Planos** | CTA de contato personalizado |
| **Contratar** | Wizard multi-step de onboarding |

---

## Wizard de onboarding

Formulário multi-step que guia o cliente do cadastro à pré-configuração do dispositivo:

**Step 1 — Dados da farmácia**
- Nome, CNPJ (com máscara), responsável técnico
- E-mail, telefone/WhatsApp (com máscara)
- CEP, endereço, cidade, estado
- Quantidade de dispositivos

**Step 2 — Configuração dos dispositivos**
- Nome/localização de cada sensor (ex: "Geladeira Vacinas")
- Rede Wi-Fi (SSID + senha) — pré-gravado de fábrica antes do envio
- Limites de temperatura (mín/máx)
- GPS via browser (opcional)

**Step 3 — Resumo e confirmação**
- Revisão de todos os dados antes de enviar
- Envio via [FormSubmit](https://formsubmit.co) — sem backend necessário
- E-mail chega em `contato.olheai@gmail.com` com assunto `NOVO CLIENTE SAM DATA LOGGER -> <nome da farmácia>`

---

## Tecnologias

- **HTML/CSS/JS puro** — zero dependências, zero build step
- **Tema Aurora Glassmorphism** — dark mode com backdrop-filter blur e orbs animados
- **FormSubmit** — envio de formulário por e-mail sem backend
- **GitHub Pages** — hospedagem estática gratuita
- **Domínio customizado** via CNAME: `sam.tarslabs.io → g45p4r82.github.io`
- **SSL automático** — certificado HTTPS emitido pelo GitHub

---

## Desenvolvimento local

Não precisa de nada instalado — é HTML puro:

```bash
# Clona o repositório
git clone https://github.com/G45P4R82/sam-landing.git
cd sam-landing

# Sobe um servidor local simples
python3 -m http.server 8080
```

Acesse: **http://localhost:8080**

---

## Deploy

O deploy é automático via push para a branch `main`. O GitHub Pages publica em segundos.

```bash
git add .
git commit -m "sua mensagem"
git push
```

---

## Configuração do domínio customizado

O arquivo `CNAME` na raiz contém:
```
sam.tarslabs.io
```

No provedor de DNS do `tarslabs.io`, existe um registro:
```
Tipo:  CNAME
Host:  sam
Valor: g45p4r82.github.io
```

---

## Repositório da plataforma

O código do backend Django (API IoT, dashboard, alertas) está em:  
[github.com/G45P4R82/sam-data-logger](https://github.com/G45P4R82/sam-data-logger) (privado)

---

Desenvolvido por [TarsLabs](https://tarslabs.io)
