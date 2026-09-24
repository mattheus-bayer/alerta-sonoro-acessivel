const botaoIniciar = document.getElementById("botaoIniciar");
const botaoParar = document.getElementById("botaoParar");

const emoji = document.getElementById("emoji");
const situacao = document.getElementById("situacao");
const mensagem = document.getElementById("mensagem");

const painel = document.getElementById("painel");
const barra = document.getElementById("barra");

const valorSom = document.getElementById("valorSom");

const indicador = document.getElementById("indicador");
const textoStatus = document.getElementById("textoStatus");

let audioContext;
let analisador;
let microfone;
let stream;
let animationId;

/*
    O sistema aprende aos poucos qual é o
    nível normal de som do ambiente.
*/
let nivelAmbiente = 5;

botaoIniciar.addEventListener("click", iniciarMicrofone);
botaoParar.addEventListener("click", pararMicrofone);

async function iniciarMicrofone() {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioContext = new (window.AudioContext ||
                            window.webkitAudioContext)();

        analisador = audioContext.createAnalyser();

        analisador.fftSize = 512;

        microfone =
            audioContext.createMediaStreamSource(stream);

        microfone.connect(analisador);

        botaoIniciar.disabled = true;
        botaoParar.disabled = false;

        textoStatus.innerText = "Microfone ativo";

        analisarSom();

    } catch (erro) {

        alert(
            "Não foi possível acessar o microfone. " +
            "Verifique se a permissão foi autorizada."
        );

        console.error(erro);
    }
}

function analisarSom() {

    const dados =
        new Uint8Array(analisador.fftSize);

    analisador.getByteTimeDomainData(dados);

    let soma = 0;

    for (let i = 0; i < dados.length; i++) {

        const valor =
            (dados[i] - 128) / 128;

        soma += valor * valor;
    }

    const rms =
        Math.sqrt(soma / dados.length);

    /*
       Transformamos o valor captado
       em uma escala mais fácil de visualizar.
    */

    let intensidade =
        Math.min(100, Math.round(rms * 400));

    valorSom.innerText = intensidade;

    barra.style.width = intensidade + "%";

    /*
       SENSIBILIDADE AUTOMÁTICA

       O programa aprende o nível médio
       de ruído do ambiente.
    */

    if (intensidade < nivelAmbiente * 1.5) {

        nivelAmbiente =
            nivelAmbiente * 0.98 +
            intensidade * 0.02;
    }

    /*
       Os limites são calculados
       automaticamente.
    */

    const limiteModerado =
        Math.max(12, nivelAmbiente + 10);

    const limiteAlto =
        Math.max(30, nivelAmbiente + 25);

    /*
       CLASSIFICAÇÃO DO SOM
    */

    if (intensidade < limiteModerado) {

        ambienteTranquilo();

    }

    else if (intensidade < limiteAlto) {

        ambienteModerado();

    }

    else {

        ambienteBarulhento();

    }

    animationId =
        requestAnimationFrame(analisarSom);
}


/* ============================= */
/* BAIXO RUÍDO */
/* ============================= */

function ambienteTranquilo() {

    emoji.innerText = "😊";

    situacao.innerText =
        "Ambiente tranquilo";

    mensagem.innerText =
        "Baixo nível de ruído";

    painel.className =
        "painel silencioso";

    barra.style.background =
        "#28a745";

    indicador.style.background =
        "#28a745";
}


/* ============================= */
/* RUÍDO MODERADO */
/* ============================= */

function ambienteModerado() {

    emoji.innerText = "😟";

    situacao.innerText =
        "Atenção!";

    mensagem.innerText =
        "Ruído moderado detectado";

    painel.className =
        "painel moderado";

    barra.style.background =
        "#ffc107";

    indicador.style.background =
        "#ffc107";
}


/* ============================= */
/* MUITO BARULHO */
/* ============================= */

function ambienteBarulhento() {

    emoji.innerText = "😠";

    situacao.innerText =
        "Muito barulho!";

    mensagem.innerText =
        "Nível elevado de som detectado";

    painel.className =
        "painel barulhento";

    barra.style.background =
        "#dc3545";

    indicador.style.background =
        "#dc3545";
}


/* ============================= */
/* PARAR MICROFONE */
/* ============================= */

function pararMicrofone() {

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    if (stream) {

        stream
            .getTracks()
            .forEach(track => track.stop());
    }

    if (audioContext) {
        audioContext.close();
    }

    botaoIniciar.disabled = false;
    botaoParar.disabled = true;

    textoStatus.innerText =
        "Microfone desligado";

    indicador.style.background =
        "#777";
}