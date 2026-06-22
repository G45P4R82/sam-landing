/* ============================================================
   SAM Data Logger — Landing Page Wizard
   Formulário multi-step com envio via FormSubmit
   ============================================================ */

const FORMSUBMIT_EMAIL = 'juanengml@gmail.com';

// ── State ────────────────────────────────────────────────────
let currentStep = 1;
const totalSteps = 3;
let numDevices = 1;
let wizardAberto = false; // evita scroll na inicialização

// ── Helpers ──────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function showStep(step) {
    for (let i = 1; i <= totalSteps; i++) {
        const panel = $(`step-${i}`);
        if (panel) panel.style.display = i === step ? 'block' : 'none';
    }
    updateProgress(step);
    currentStep = step;

    // Só faz scroll quando o wizard já foi aberto pelo usuário
    if (wizardAberto) {
        const section = document.getElementById('contratar');
        if (section) {
            const top = section.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
}

function updateProgress(active) {
    for (let i = 1; i <= totalSteps; i++) {
        const circle = $(`wp-${i}`);
        const label  = $(`wl-${i}`);
        if (!circle) continue;
        circle.classList.remove('active', 'done');
        label && label.classList.remove('active');
        if (i < active)  { circle.classList.add('done'); }
        if (i === active) { circle.classList.add('active'); label && label.classList.add('active'); }
    }
    for (let i = 1; i < totalSteps; i++) {
        const line = $(`wline-${i}`);
        if (line) line.classList.toggle('done', i < active);
    }
}

// ── Máscaras ─────────────────────────────────────────────────
function maskCNPJ(v) {
    v = v.replace(/\D/g, '').slice(0, 14);
    if (v.length <= 2)  return v;
    if (v.length <= 5)  return v.replace(/(\d{2})(\d+)/, '$1.$2');
    if (v.length <= 8)  return v.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (v.length <= 12) return v.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
}

function maskPhone(v) {
    v = v.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2)  return `(${v}`;
    if (v.length <= 7)  return v.replace(/(\d{2})(\d+)/, '($1) $2');
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return v.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

function maskCEP(v) {
    v = v.replace(/\D/g, '').slice(0, 8);
    if (v.length <= 5) return v;
    return v.replace(/(\d{5})(\d+)/, '$1-$2');
}

// ── Validação Step 1 ─────────────────────────────────────────
function validateStep1() {
    const fields = ['nome_farmacia', 'cnpj', 'responsavel', 'email', 'telefone', 'cep', 'endereco', 'cidade', 'estado'];
    for (const f of fields) {
        const el = $(f);
        if (!el || !el.value.trim()) {
            showError(`Por favor, preencha o campo "${el ? el.previousElementSibling.textContent : f}".`);
            el && el.focus();
            return false;
        }
    }
    const emailEl = $('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        showError('E-mail inválido.');
        emailEl.focus();
        return false;
    }
    const cnpjClean = $('cnpj').value.replace(/\D/g, '');
    if (cnpjClean.length !== 14) {
        showError('CNPJ inválido. Deve ter 14 dígitos.');
        $('cnpj').focus();
        return false;
    }
    hideError();
    return true;
}

// ── Validação Step 2 ─────────────────────────────────────────
function validateStep2() {
    const cards = document.querySelectorAll('.device-config');
    for (let i = 0; i < cards.length; i++) {
        const n = i + 1;
        const nome  = $(`dev_nome_${n}`);
        const ssid  = $(`dev_ssid_${n}`);
        if (!nome || !nome.value.trim()) {
            showError(`Informe o nome do Dispositivo ${n}.`);
            nome && nome.focus();
            return false;
        }
        if (!ssid || !ssid.value.trim()) {
            showError(`Informe o nome da rede Wi-Fi do Dispositivo ${n}.`);
            ssid && ssid.focus();
            return false;
        }
    }
    hideError();
    return true;
}

// ── Erro / Sucesso ───────────────────────────────────────────
function showError(msg) {
    const el = $('alert-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideError() {
    const el = $('alert-error');
    if (el) el.style.display = 'none';
}

// ── GPS ──────────────────────────────────────────────────────
function getGPS(n) {
    if (!navigator.geolocation) {
        alert('Geolocalização não suportada pelo navegador.');
        return;
    }
    const btn = $(`gps_btn_${n}`);
    if (btn) btn.textContent = 'Obtendo...';
    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude.toFixed(6);
            const lng = pos.coords.longitude.toFixed(6);
            const latEl = $(`dev_lat_${n}`);
            const lngEl = $(`dev_lng_${n}`);
            if (latEl) latEl.value = lat;
            if (lngEl) lngEl.value = lng;
            if (btn) btn.textContent = '✓ Localização obtida';
        },
        err => {
            if (btn) btn.textContent = 'Usar minha localização';
            alert('Não foi possível obter a localização: ' + err.message);
        }
    );
}

// ── Renderizar cards de devices ──────────────────────────────
function renderDeviceCards(n) {
    const container = $('devices-container');
    if (!container) return;

    // Preserva valores existentes
    const existing = {};
    document.querySelectorAll('.device-config').forEach((card, i) => {
        const idx = i + 1;
        existing[idx] = {
            nome:      $(`dev_nome_${idx}`)?.value || '',
            ssid:      $(`dev_ssid_${idx}`)?.value || '',
            senha:     $(`dev_senha_${idx}`)?.value || '',
            lat:       $(`dev_lat_${idx}`)?.value  || '',
            lng:       $(`dev_lng_${idx}`)?.value  || '',
            temp_min:  $(`dev_tmin_${idx}`)?.value || '2',
            temp_max:  $(`dev_tmax_${idx}`)?.value || '8',
        };
    });

    container.innerHTML = '';
    for (let i = 1; i <= n; i++) {
        const prev = existing[i] || {};
        container.innerHTML += `
        <div class="device-config">
            <div class="device-config-header">
                <span style="background:rgba(0,229,255,0.15);border:1px solid rgba(0,229,255,0.3);
                             border-radius:50%;width:28px;height:28px;display:flex;align-items:center;
                             justify-content:center;font-size:0.85rem;flex-shrink:0;">${i}</span>
                Dispositivo ${i}
            </div>
            <div class="form-group">
                <label>Nome / Localização do sensor *</label>
                <input type="text" id="dev_nome_${i}" placeholder="Ex: Geladeira Vacinas, Câmara Fria 2..."
                       value="${prev.nome || ''}" />
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome da rede Wi-Fi (SSID) *</label>
                    <input type="text" id="dev_ssid_${i}" placeholder="NomeDaRede" value="${prev.ssid || ''}" />
                </div>
                <div class="form-group">
                    <label>Senha do Wi-Fi</label>
                    <input type="password" id="dev_senha_${i}" placeholder="••••••••" value="${prev.senha || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Temp. mínima (°C)</label>
                    <input type="number" id="dev_tmin_${i}" step="0.5" value="${prev.temp_min || '2'}" />
                </div>
                <div class="form-group">
                    <label>Temp. máxima (°C)</label>
                    <input type="number" id="dev_tmax_${i}" step="0.5" value="${prev.temp_max || '8'}" />
                </div>
            </div>
            <div class="form-group">
                <label>Coordenadas GPS (opcional)</label>
                <div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap;">
                    <input type="text" id="dev_lat_${i}" placeholder="Latitude" style="flex:1;min-width:120px;"
                           value="${prev.lat || ''}" readonly />
                    <input type="text" id="dev_lng_${i}" placeholder="Longitude" style="flex:1;min-width:120px;"
                           value="${prev.lng || ''}" readonly />
                    <button type="button" class="btn btn-ghost btn-sm" id="gps_btn_${i}"
                            onclick="getGPS(${i})" style="white-space:nowrap;">
                        📍 Usar minha localização
                    </button>
                </div>
            </div>
        </div>`;
    }
}

// ── Step 3: Resumo ───────────────────────────────────────────
function buildSummary() {
    // Dados da farmácia
    const farmData = [
        ['Farmácia',      $('nome_farmacia')?.value],
        ['CNPJ',          $('cnpj')?.value],
        ['Responsável',   $('responsavel')?.value],
        ['E-mail',        $('email')?.value],
        ['Telefone',      $('telefone')?.value],
        ['CEP',           $('cep')?.value],
        ['Endereço',      $('endereco')?.value],
        ['Cidade / UF',   `${$('cidade')?.value} / ${$('estado')?.value}`],
    ];

    let farmHTML = '<div class="summary-block"><h4>Dados da Farmácia</h4>';
    farmData.forEach(([k, v]) => {
        farmHTML += `<div class="summary-row"><span>${k}</span><span>${v || '—'}</span></div>`;
    });
    farmHTML += '</div>';

    let devHTML = '';
    for (let i = 1; i <= numDevices; i++) {
        const lat = $(`dev_lat_${i}`)?.value;
        const lng = $(`dev_lng_${i}`)?.value;
        devHTML += `
        <div class="summary-block">
            <h4>Dispositivo ${i}</h4>
            <div class="summary-row"><span>Nome</span><span>${$(`dev_nome_${i}`)?.value || '—'}</span></div>
            <div class="summary-row"><span>Rede Wi-Fi</span><span>${$(`dev_ssid_${i}`)?.value || '—'}</span></div>
            <div class="summary-row"><span>Senha Wi-Fi</span><span>${$(`dev_senha_${i}`)?.value ? '••••••••' : '(não informada)'}</span></div>
            <div class="summary-row"><span>Temp. mín/máx</span><span>${$(`dev_tmin_${i}`)?.value}°C / ${$(`dev_tmax_${i}`)?.value}°C</span></div>
            <div class="summary-row"><span>GPS</span><span>${lat && lng ? `${lat}, ${lng}` : 'Não informado'}</span></div>
        </div>`;
    }

    const container = $('summary-container');
    if (container) container.innerHTML = farmData + devHTML;

    // Monta o HTML no container
    if (container) {
        container.innerHTML = farmHTML + devHTML;
    }
}

// ── Montar e-mail e enviar via FormSubmit ────────────────────
function buildEmailBody() {
    const lines = [];

    lines.push('=== NOVO PEDIDO — SAM Data Logger ===\n');
    lines.push('--- DADOS DA FARMÁCIA ---');
    lines.push(`Farmácia:     ${$('nome_farmacia')?.value}`);
    lines.push(`CNPJ:         ${$('cnpj')?.value}`);
    lines.push(`Responsável:  ${$('responsavel')?.value}`);
    lines.push(`E-mail:       ${$('email')?.value}`);
    lines.push(`Telefone:     ${$('telefone')?.value}`);
    lines.push(`CEP:          ${$('cep')?.value}`);
    lines.push(`Endereço:     ${$('endereco')?.value}`);
    lines.push(`Cidade / UF:  ${$('cidade')?.value} / ${$('estado')?.value}`);
    lines.push(`Nº de devices: ${numDevices}\n`);

    for (let i = 1; i <= numDevices; i++) {
        const lat = $(`dev_lat_${i}`)?.value;
        const lng = $(`dev_lng_${i}`)?.value;
        lines.push(`--- DISPOSITIVO ${i} ---`);
        lines.push(`Nome:       ${$(`dev_nome_${i}`)?.value}`);
        lines.push(`Wi-Fi SSID: ${$(`dev_ssid_${i}`)?.value}`);
        lines.push(`Wi-Fi Senha:${$(`dev_senha_${i}`)?.value || '(não informada)'}`);
        lines.push(`Temp mín:   ${$(`dev_tmin_${i}`)?.value}°C`);
        lines.push(`Temp máx:   ${$(`dev_tmax_${i}`)?.value}°C`);
        lines.push(`GPS:        ${lat && lng ? `${lat}, ${lng}` : 'Não informado'}`);
        lines.push('');
    }

    return lines.join('\n');
}

async function submitOrder() {
    const btn = $('btn-submit');
    const alertErr = $('alert-error');
    const alertOk  = $('alert-success');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Enviando...';
    }
    hideError();

    const payload = {
        nome_farmacia: $('nome_farmacia')?.value,
        cnpj:          $('cnpj')?.value,
        responsavel:   $('responsavel')?.value,
        email:         $('email')?.value,
        telefone:      $('telefone')?.value,
        cep:           $('cep')?.value,
        endereco:      $('endereco')?.value,
        cidade:        $('cidade')?.value,
        estado:        $('estado')?.value,
        num_devices:   numDevices,
        mensagem:      buildEmailBody(),
        _subject:      `NOVO CLIENTE SAM DATA LOGGER -> ${$('nome_farmacia')?.value}`,
        _template:     'table',
        _captcha:      'false',
    };

    try {
        const res = await fetch(`https://formsubmit.co/${FORMSUBMIT_EMAIL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            // Esconde o wizard e mostra sucesso
            $('wizard-form').style.display = 'none';
            if (alertOk) alertOk.style.display = 'block';
            window.scrollTo({ top: $('contratar').offsetTop - 80, behavior: 'smooth' });
        } else {
            throw new Error(`Status ${res.status}`);
        }
    } catch (err) {
        showError('Ocorreu um erro ao enviar. Tente novamente ou entre em contato via WhatsApp.');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Pedido';
        }
    }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Máscaras
    $('cnpj')?.addEventListener('input', e => { e.target.value = maskCNPJ(e.target.value); });
    $('telefone')?.addEventListener('input', e => { e.target.value = maskPhone(e.target.value); });
    $('cep')?.addEventListener('input', e => { e.target.value = maskCEP(e.target.value); });

    // Seletor de quantidade de devices
    const qtyInput = $('qty-devices');
    if (qtyInput) {
        qtyInput.addEventListener('change', () => {
            numDevices = parseInt(qtyInput.value) || 1;
            renderDeviceCards(numDevices);
        });
    }

    // Botão Step 1 → Step 2
    $('btn-next-1')?.addEventListener('click', () => {
        if (validateStep1()) {
            numDevices = parseInt($('qty-devices')?.value) || 1;
            renderDeviceCards(numDevices);
            showStep(2);
        }
    });

    // Botão Step 2 → Step 3
    $('btn-next-2')?.addEventListener('click', () => {
        if (validateStep2()) {
            buildSummary();
            showStep(3);
        }
    });

    // Botões Voltar
    $('btn-back-2')?.addEventListener('click', () => showStep(1));
    $('btn-back-3')?.addEventListener('click', () => showStep(2));

    // Envio final
    $('btn-submit')?.addEventListener('click', submitOrder);

    // Botão de abrir wizard
    $('btn-abrir-wizard')?.addEventListener('click', abrirWizard);

    // Links do HERO e PRICING ("Contratar agora", "Solicitar proposta") — abrem o wizard
    document.querySelectorAll('.hero-actions a[href="#contratar"], #pricing a[href="#contratar"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            abrirWizard();
        });
    });

    // Link da NAVBAR ("Contratar") — só scroll suave até a seção, sem abrir wizard
    document.querySelectorAll('nav a[href="#contratar"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const section = document.getElementById('contratar');
            if (section) {
                const top = section.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Inicia no step 1 (wizard ainda oculto)
    renderDeviceCards(1);
    showStep(1);
});

function abrirWizard() {
    wizardAberto = true;

    const cta    = document.getElementById('contratar-cta');
    const wizard = document.getElementById('contratar-wizard');
    if (cta)    cta.style.display    = 'none';
    if (wizard) wizard.style.display = 'block';

    // Duplo rAF garante que o layout já foi recalculado antes do scroll
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const section = document.getElementById('contratar');
            if (!section) return;
            const top = section.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}
