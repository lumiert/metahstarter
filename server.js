const express = require('express');
const fs = require('fs').promises;
const app = express();
const Gpio = require('onoff').Gpio;
const pino20 = new Gpio(20, 'out');
const pino21 = new Gpio(21, 'out');
const port = 6065;
const os = require('os');

const interfaces = os.networkInterfaces();


pino20.writeSync(1);
pino21.writeSync(1);

let acionarPinos = true;
let cooldownAtivo = false;

function AcionaOn() {
    try {
        const estado20 = pino20.readSync();
        const estado21 = pino21.readSync();

        if (acionarPinos && !cooldownAtivo && (estado20 === 1 || estado21 === 1)) {
            // Apenas aciona se acionarPinos é verdadeiro, cooldown não está ativo e pelo menos um dos pinos está desligado
            pino20.writeSync(0);
            pino21.writeSync(0);
            //console.log('Ta on');

            // Desativa a flag acionarPinos
            acionarPinos = false;

            // Ativa o cooldown
            cooldownAtivo = true;
            
            gravaLog(obterHorarioAtual() + ' - Acionando...<br>');
            
            // Desativa o cooldown após 5 segundos
            setTimeout(() => {
                AcionaOff(); // Chama AcionaOff após 5 segundos
            }, 5000);
        }
    } catch (error) {
        console.error('Erro ao alterar os pinos:', error.message);
    }
}

function AcionaOff() {
    try {
        const estado20 = pino20.readSync();
        const estado21 = pino21.readSync();

        if (estado20 === 0 || estado21 === 0) {
            // Apenas desaciona se pelo menos um dos pinos está ligado
            pino20.writeSync(1);
            pino21.writeSync(1);
            //console.log('Ta off');
        }

        // Ativa a flag acionarPinos após 55 segundos
        setTimeout(() => {
            acionarPinos = true;
        }, 55000);

        // Desativa o cooldown após 55 segundos
        setTimeout(() => {
            cooldownAtivo = false;
        }, 55000);
    } catch (error) {
        console.error('Erro ao alterar os pinos:', error.message);
    }
}



function acionarSirene() {
    try {
        const estado20 = pino20.readSync();
        const estado21 = pino21.readSync();


        //const diaEsperado = 'Quinta-feira';
        //const hojeEhQuarta = obterDiaSemanaAtual() === diaEsperado;        
        //const horarioAtual = obterHorario();
        //const horarioEsperado = '08:31';
        //const horarioCorreto = horarioAtual === horarioEsperado;
        //console.log(horarioAtual);

        // Verifica se é quarta-feira, horário correto e se pode acionar os pinos
        //if (hojeEhQuarta && horarioCorreto && acionarPinos) {
        //    AcionaOn(); // Chama AcionaOn para acionar os pinos
        //} else {
           // console.log('Não é ' + diaEsperado + ' às ' + horarioEsperado + ' ou já acionou os pinos. Não executando a lógica.');
        //}
        
        AcionaOn(); // Chama AcionaOn para acionar os pinos // Chama AcionaOff após 5 segundos
        
        
    } catch (error) {
        console.error('Erro ao alterar os pinos:', error.message);
    }
}

// Função para obter o dia da semana
function obterDiaSemanaAtual() {
  const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const dataAtual = new Date();
  const diaSemana = dataAtual.getDay();
    //console.log('dias semana: '+ diaSemana);
  return diaSemana;
}

// Função para obter o horário atual
// Função para obter o horário atual sem segundos
function obterHoraMinuto() {
  const dataAtual = new Date();
  const horas = padZero(dataAtual.getHours());
  const minutos = padZero(dataAtual.getMinutes());
  const horarioFormatado = `${horas}:${minutos}`;
  return horarioFormatado;
}

// Função para garantir que um número seja exibido com dois dígitos (padded with zero)
function padZero(numero) {
  return numero < 10 ? `0${numero}` : numero;
}

// Rota para obter o horário atual (método GET)
app.get('/horario', (req, res) => {
    const horarioAtual = new Date().toLocaleTimeString();
    res.send(horarioAtual);
});

app.get('/mac', (req, res) => {
    const interfaces = os.networkInterfaces();

    // Verificando a interface eth0
    if ('eth0' in interfaces) {
        const eth0Details = interfaces['eth0'][0]; // Pegando o primeiro detalhe da interface eth0
        console.log(`Interface: eth0`);
        console.log(`Endereço MAC: ${eth0Details.mac}`);
        res.send(eth0Details.mac)
    } else {
        console.log('Interface eth0 não encontrada.');
    }
});

// Rota para a página principal
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Methastarter - Acionador de Sirene</title>
            <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
            <script src="jquery.js"></script>
            
        </head>
        
        <style>

            @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Quicksand:wght@300&display=swap');
            
            ::-webkit-scrollbar{
                width: 10px;
            }

            ::-webkit-scrollbar-track-piece{
                background-color: #FFF;
            }

            ::-webkit-scrollbar-thumb{
                background-color: #CBCBCB;
                outline: 2px solid #FFF;
                outline-offset: -2px;
                border: .1px solid #B7B7B7;
            }

            ::-webkit-scrollbar-thumb:hover{
                background-color: #909090;
            }
                        
            :root {
                --dark-blue-meta: #032854;
                --fog-blue-meta: #335074;
                --mid-blue-meta: #1B88CE;
                --meta-green: #13b444;
                --meta-red: #ca1d3a;
                --meta-orange: #ca621d;
                --meta-dark-gray: #333;
            }
            
            #logs {
                background-color: var(--dark-blue-meta);
                color: var(--mid-blue-meta);
                
                margin: 0;
                position: relative;
                height: 100%;
                bottom: 0;
                padding: 10px;
                overflow-y: auto;
            }
            
            body {
               background-color: #f2f2f2f2; 
               margin: 0;
               font-family: 'Quicksand';
            }

            .inner-tab {
                color: var(--dark-blue-meta);
            }
            
            .inner-tab h2 {
                text-align: center;
            }

            .tabs {
                display: flex;
                justify-content: center;
                background-color: #dadada;
                
            }
            
            .config {
                text-align: center;
            }

            .header {
                font-family: 'Roboto', 'Arial', 'Sans Serif';
                font-size: 1.2em;
                text-align: center;
                padding-block: 1px;
                color: var(--mid-blue-meta);
                background-color: #ffffff;

                justify-content: center;
            }
            
            .form {
                padding: 12px;
            }
            
            .form input {
                width: 30vw;
                align-items: center;
            }
            
            #modal {
                background-color: rgba(0,0,0,0.5);
                position: fixed;
                height: 100%;
                width: 100%;
                top: 0;
            }
            
            #inner-modal {
                text-align: center;
                position: fixed;
                background-color: #f2f2f2f2;
                max-width: 700px;
                min-width: 350px;
                left: 50%;
                top: 50vh;
                border-radius: 6px;
                padding: 18px;
                transform: translate(-50%, -50%);
            }
            
            /* DEFAULT ORANGE */

            .default-button-orange {
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Padrão */
                display: inline-block;
                margin-inline: 2px;
                color: white;
                position: relative;
                background-color: var(--meta-dark-gray);
                padding: 12px;
                text-decoration: none;
                overflow: hidden;
                transition: 0.25s;
            }

            .default-button-orange:hover {
                color: var(--meta-orange);
                transition: 0.25s;
                cursor: pointer;
            }

            .default-button-orange::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0px;
                width: 100%;
                height: 6px;
                background-color: var(--meta-orange);
                transform: scaleX(0);
                transform-origin: 0 100%;
                transition: transform 0.25s;
            }

            .default-button-orange:hover::after {
                transform: scaleX(1);
            }

            /* DEFAULT RED */

            .default-button-red {
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Padrão */
                display: inline-block;
                margin-inline: 2px;
                color: white;
                position: relative;
                background-color: var(--meta-dark-gray);
                padding: 12px;
                text-decoration: none;
                overflow: hidden;
                transition: 0.25s;
            }

            .default-button-red:hover {
                color: var(--meta-red);
                transition: 0.25s;
                cursor: pointer;
            }

            .default-button-red::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0px;
                width: 100%;
                height: 6px;
                background-color: var(--meta-red);
                transform: scaleX(0);
                transform-origin: 0 100%;
                transition: transform 0.25s;
            }

            .default-button-red:hover::after {
                transform: scaleX(1);
            }

            /* DEFAULT GREEN */

            .default-button-green {
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Padrão */
                display: inline-block;
                margin-inline: 2px;
                color: white;
                position: relative;
                background-color: var(--meta-dark-gray);
                padding: 12px;
                text-decoration: none;
                overflow: hidden;
                transition: 0.25s;
            }

            .default-button-green:hover {
                color: var(--meta-green);
                transition: 0.25s;
                cursor: pointer;
            }

            .default-button-green::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0px;
                width: 100%;
                height: 6px;
                background-color: var(--meta-green);
                transform: scaleX(0);
                transform-origin: 0 100%;
                transition: transform 0.25s;
            }

            .default-button-green:hover::after {
                transform: scaleX(1);
            }

            /* DEFAULT BLUE */

            .default-button-blue {
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Padrão */
                display: inline-block;
                margin-inline: 2px;
                color: white;
                position: relative;
                background-color: var(--meta-dark-gray);
                padding: 12px;
                text-decoration: none;
                overflow: hidden;
                transition: 0.25s;
            }

            .default-button-blue:hover {
                color: var(--mid-blue-meta);
                transition: 0.25s;
                cursor: pointer;
            }

            .default-button-blue::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0px;
                width: 100%;
                height: 6px;
                background-color: var(--mid-blue-meta);
                transform: scaleX(0);
                transform-origin: 0 100%;
                transition: transform 0.25s;
            }

            .default-button-blue:hover::after {
                transform: scaleX(1);
            }
            
            /* CENTER BUTTON */
            
            .center-button {
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Padrão */
                display: inline-block;
                margin-inline: 2px;
                color: var(--dark-blue-meta);
                position: relative;
                background-color: #dedede;
                padding: 12px;
                text-decoration: none;
                overflow: hidden;
                transition: 0.25s;
            }

            .center-button:hover {
                color: var(--mid-blue-meta);
                transition: 0.25s;
                cursor: pointer;
            }

            .center-button::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0px;
                width: 100%;
                height: 6px;
                background-color: var(--mid-blue-meta);
                transform: scaleX(0);
                transform-origin: center bottom; /* Ajuste o transform-origin para o centro da barra */
                transition: transform 0.25s;
            }

            .center-button:hover::after {
                transform: scaleX(1);
                /* Ajuste a posição vertical da barra, se necessário */
                /* top: 50%; */
                /* transform: translateX(-50%); */
            }

            
            /* HORARIO */
                
            .horario {
                display: inline-block;
                align-items: center;
            }

            .horario input {
                height: 64px;
                width: 64px;
                font-size: 2vw;
                text-align: center;
            }

            .horario-twodots {
                font-size: 3em
            }
            
            /* TABLE */
            
            .scrollable-output {
                overflow-y: auto;
                height: 46vh;
                margin-inline: 32px;
            }
            
            #output-table a {
                font-size: 0.7em;
            }
            
            .under-table {
                justify-content: center;
                position: absolute;
                margin: 32px;
                bottom: 16px;
            }
            
            #output-table {
                width: 100%;
            }
            
            table {
                width: auto;
                text-align: center;
            }
            
            table, td {
                height: 12px;
                border-collapse: collapse;
            }
            
            td {
                border-bottom: 2px solid #d0d0d0;
            }
            
            th {
                
                
                padding-block: 14px;
                background-color: #d0d0d0;
            }
            
            #custom-checkbox input {
                position: absolute;
                opacity: 0;
            }

            #custom-checkbox span {
                display: inline-block;
                width: 3em;
                height: 1em;
                padding: 2px;
                background-color: rgb(250, 151, 151);
                color: rgb(168, 37, 37);
                padding-block: 10px;
                margin-block: 16px;
                cursor: pointer;
                user-select: none;
            }

            #custom-checkbox input:checked + span {
                background-color: #004e7e; /* Cor quando marcado */
                color: white;
                user-select: none;
            }

            #custom-checkbox label {
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
            }
            
            #suporte {
                text-align: center;
            }
            
        </style>
        
        <body>
            <div class="header"><h1>Methastarter</h1><h5 style="display: block;">Horário Atual: <span id="horarioAtual">Carregando...</span></h5></div>
            <div class="tabs">
                <a id="arotinas" onclick="tab(rotinas);" class="default-tab center-button">Rotinas</a>
                <a id="alogs" onclick="tab(logs);" class="default-tab center-button">Logs</a>
                <a id="asuporte" onclick="tab(suporte);" class="default-tab center-button">Suporte</a>
                <a id="aconfig" onclick="tab(config); puxaConfig();" class="default-tab center-button">Configuração</a>
            </div>
            
            <div class="inner-tab" id="rotinas">
                <h2>Registro de Rotinas:</h2>
                
                <div class="scrollable-output">
                    <table id="output-table">
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Horário</th>
                            <th>Semana</th>
                        </tr>

                    </table>
                </div>
                
                <div class="under-table">
                    <a class="default-button-green" onclick="novaRotina();">Nova Rotina</a>
                </div>
                
                <div id="modal" hidden>
                    <div id="inner-modal">
                        
                        <div class="form">
                            <p hidden>Id: </p> <input type="text" id="id" hidden>
                            
                            <div class="horario">
                                <input id="hora1" type="number" min="1" max="24" oninput="formatarInput(this);">
                            </div>
                            <span class="horario-twodots">:</span>
                            <div class="horario">
                                <input id="hora2" type="number" min="1" max="59" oninput="formatarInput(this);">
                            </div>
                            
                            <p>Nome: </p> <input type="text" id="desc">

                            <p>Semana: </p> 
                            
                            <label id="custom-checkbox">
                                <input id="DOM" type="checkbox">
                                <span>DOM</span>
                            </label>
                            <label id="custom-checkbox">
                                <input id="SEG" type="checkbox">
                                <span>SEG</span>
                            </label>
                            <label id="custom-checkbox">
                                <input id="TER" type="checkbox">
                                <span>TER</span>
                            </label>
                            <label id="custom-checkbox">
                                <input id="QUA" type="checkbox">
                                <span>QUA</span>
                            </label>
                            <label id="custom-checkbox">
                                <input id="QUI" type="checkbox">
                                <span>QUI</span>
                            </label>
                            <label id="custom-checkbox">
                                <input id="SEX" type="checkbox">
                                <span>SEX</span>
                            </label>
                            <label id="custom-checkbox">
                                <input id="SAB" type="checkbox">
                                <span>SAB</span>
                            </label>
                        </div>
                        
                        <a class="default-button-green" onclick="atualizarRotinas(); gravarRotina();">Salvar</a>
                    
                        <a class="default-button-red" onclick="ocultarModal(true); atualizarRotinas();">Cancelar</a>
                        
                        <p id="aviso-semana" hidden>Defina os dias da semana!</p>
                    </div>
                </div>
            </div>

            <div class="inner-tab" id="logs">
            </div>

            <div class="inner-tab" id="suporte">
                <h2>Como cadastrar uma rotina:</h2>
                
                <p>Comece criando uma nova rotina, defina o horário e os dias da semana que deseja acionar:</p> 
                <img style="width: 80vw;" src="/demo.jpg">
                <h2>Suporte Local</h2>
                
                <h3>E-mail: suporte@metadadosequipamentos.com.br</h3>
                <h3>Telefone: (54) 3039-0535</h3>
                
                <h4>Metha Equipamentos 2024 Todos os direitos reservados</h4>

            </div>   
            
            <div class="inner-tab config" id="config">
                <h2>Configurações de Rede:</h2>
                <p>IP: </p><input id="ip" placeholder="192.168.15.52" type="text">
                <p>Máscara: </p><input id="mascara" placeholder="255.255.255.0" type="text">
                <p>Gateway: </p><input id="gateway" placeholder="192.168.15.1" type="text">
                <p>DNS: </p><input id="dns" placeholder="8.8.8.8" type="text">
                <p>MAC: </p><p id="mac">mac-address</p>
                
                <br>
                <br>
                <br>
                <a class="default-button-green" onclick="enviarConfig()">Confirmar</a>
                
                <script>
                    function enviarConfig() {
                        const inputip = document.getElementById('ip').value;
                        const inputmascara = document.getElementById('mascara').value;
                        const inputgateway = document.getElementById('gateway').value;
                        const inputdns = document.getElementById('dns').value;
                        
                        // Construa a string no formato desejado, mantendo a estrutura
                        const novoConteudo = \`INTERFACE="eth0";IP_ADDRESS="\${inputip}";NETMASK="\${inputmascara}";GATEWAY="\${inputgateway}";DNS="\${inputdns}"


sudo ifconfig $INTERFACE $IP_ADDRESS netmask $NETMASK

sudo route add default gw $GATEWAY $INTERFACE

echo "nameserver $DNS" | sudo tee /etc/resolv.conf
                    
sudo systemctl restart networking

cd /home/acionador

sudo node /home/acionador/server.js\`;

                        // Envia a string para o servidor
                        fetch('/atualizar-configuracao', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/plain',
                            },
                            body: novoConteudo,
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Falha ao enviar as alterações para o servidor');
                            }
                            return response.text();
                        })
                        .then(data => {
                            console.log('Alterações aplicadas com sucesso:', data);
                        })
                        .catch(error => {
                            console.error('Erro ao enviar as alterações:', error);
                        });
                    }

                </script>
            </div>         
            
            <script>  
                
                //PUXA CONFIG
                
                function puxaConfig(){
                    const uIp = document.getElementById('ip').value; 
                    const uMask = document.getElementById('mascara').value; 
                    const uGat = document.getElementById('gateway').value.value; 
                    const uDns = document.getElementById('dns');
                    const uMac = document.getElementById('mac');
                    
                    fetch("/config")
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erro ao obter a configuração da rede');
                        }
                        return response.text();
                    })
                    .then(data => {
                        // Os dados retornados estão disponíveis aqui
                        console.log(data); // Exibe os dados no console do navegador
                        
                        const dataSplit = data.split(";");

                        // Agora, dataSplit é uma array contendo as partes individuais da data
                        //const interfaceName = dataSplit[0]; // Parte 1
                        document.getElementById("ip").value = dataSplit[1].match(/"(.*?)"/)[1];
                        document.getElementById("mascara").value = dataSplit[2].match(/"(.*?)"/)[1];
                        document.getElementById("gateway").value = dataSplit[3].match(/"(.*?)"/)[1];
                        document.getElementById("dns").value = dataSplit[4].match(/"(.*?)"/)[1];
                        console.log(ip)
                    })
                    
                    console.log('1111111')
                    
                    fetch("/mac")
                    .then(response => {
                        if (!response.ok){
                            throw new Error('Erro ao obter a configuração de rede')
                        }
                        return response.text()
                    })  
                    .then(data => {
                        //console.log(data)
                        document.getElementById("mac").innerText = data
                        console.log(document.getElementById("mac"))
                    }) 
                }
                     
                            
                //UIUX
                                           
                
                function ocultarModal(a) {
                    if (
                        document.getElementById('DOM').checked === false &&
                        document.getElementById('SEG').checked === false &&
                        document.getElementById('TER').checked === false &&
                        document.getElementById('QUA').checked === false &&
                        document.getElementById('QUI').checked === false &&
                        document.getElementById('SEX').checked === false &&
                        document.getElementById('SAB').checked === false &&
                        a !== true
                    ) {
                        
                        document.getElementById('aviso-semana').hidden = false;
                        
                        
                        setTimeout(() => {
                            document.getElementById('aviso-semana').hidden = true;
                        }, 2000);
                    } else {
                        const modal = document.getElementById('modal');
                        const modalBackground = document.getElementById('inner-modal');
                        modal.hidden = true;
                        modalBackground.hidden = true;
                    }        
                }
                
                function mostrarModal() {
                    const modal = document.getElementById('modal');
                    const modalBackground = document.getElementById('inner-modal');
                    modal.hidden = false;
                    modalBackground.hidden = false;
                }
                
                function novaRotina() {
                    var id = document.getElementById('id');
                    var desc = document.getElementById('desc');
                    var hora1 = document.getElementById('hora1');
                    var hora2 = document.getElementById('hora2');
                    var semana = document.getElementById('semana');
                    
                    mostrarModal();
                    
                    document.getElementById('id').value = "0";
                    document.getElementById('desc').value = "Nova Rotina";
                    document.getElementById('hora1').value = "00";
                    document.getElementById('hora2').value = "00";
                    document.getElementById('DOM').checked = false;                    
                    document.getElementById('SEG').checked = false;                    
                    document.getElementById('TER').checked = false;                    
                    document.getElementById('QUA').checked = false;                    
                    document.getElementById('QUI').checked = false;                    
                    document.getElementById('SEX').checked = false;                    
                    document.getElementById('SAB').checked = false;                    
                }
                
                const outputTable = document.getElementById('output-table');
                const tbody = outputTable.getElementsByTagName('tbody')[0];

                // Verifica se há linhas na tabela
                if (tbody.rows.length > 0) {
                    // Se há linhas, mostra a tabela
                    outputTable.hidden = false;
                } else {
                    // Se não há linhas, oculta a tabela
                    outputTable.hidden = true;
                }
                
                document.getElementById('logs').hidden = true;
                document.getElementById('suporte').hidden = true;
                document.getElementById('config').hidden = true;
                
                var arotinas = document.getElementById('arotinas');
                arotinas.style.color = 'var(--mid-blue-meta)';
                
                    function tab(tab) {
                        var tabrotinas = document.getElementById('rotinas');
                        var tablogs = document.getElementById('logs');
                        var tabsuporte = document.getElementById('suporte');
                        var tabconfig = document.getElementById('config');
                        
                        var arotinas = document.getElementById('arotinas');
                        var alogs = document.getElementById('alogs');
                        var asuporte = document.getElementById('asuporte');
                        var aconfig = document.getElementById('aconfig');
                        
                        
                        
                        switch (tab) {
                            case rotinas :
                                tabrotinas.hidden = false;
                                tablogs.hidden = true;
                                tabsuporte.hidden = true;
                                tabconfig.hidden = true;
                                
                                arotinas.style.color = 'var(--mid-blue-meta)';
                                alogs.style.color = 'var(--dark-blue-meta)';
                                asuporte.style.color = 'var(--dark-blue-meta)';
                                aconfig.style.color = 'var(--dark-blue-meta)';
                                
                                break;
                            case logs :
                                tabrotinas.hidden = true;
                                tablogs.hidden = false;
                                tabsuporte.hidden = true;
                                tabconfig.hidden = true;
                                
                                alogs.style.color = 'var(--mid-blue-meta)';
                                arotinas.style.color = 'var(--dark-blue-meta)';
                                asuporte.style.color = 'var(--dark-blue-meta)';
                                aconfig.style.color = 'var(--dark-blue-meta)';
                                
                                break;
                            case suporte :
                                tabrotinas.hidden = true;
                                tablogs.hidden = true;
                                tabsuporte.hidden = false;
                                tabconfig.hidden = true;   
                                
                                asuporte.style.color = 'var(--mid-blue-meta)';
                                alogs.style.color = 'var(--dark-blue-meta)';
                                arotinas.style.color = 'var(--dark-blue-meta)';
                                aconfig.style.color = 'var(--dark-blue-meta)';
                                                             
                                break;
                            case config :
                                tabrotinas.hidden = true;
                                tablogs.hidden = true;
                                tabsuporte.hidden = true;
                                tabconfig.hidden = false;
                                
                                aconfig.style.color = 'var(--mid-blue-meta)';
                                alogs.style.color = 'var(--dark-blue-meta)';
                                arotinas.style.color = 'var(--dark-blue-meta)';
                                asuporte.style.color = 'var(--dark-blue-meta)';
                                
                                break;
                        }
                    }
                
                //UPDATE E CONVERSÃO

                function atualizarRotinas() {
                    fetch('/rotinas')
                        .then(response => response.text())
                        .then(data => {
                            document.getElementById('output-table').getElementsByTagName('tbody')[0].innerHTML = data;
                        });
                }
                
                function updateLog() {
                    fetch('/log')
                        .then(response => response.text())
                        .then(data => {
                            document.getElementById('logs').innerHTML = data;
                        });
                }
                
                //APAGAR E EDITAR
                
                function editarRotina(id, nome, hora, semana) {
                    var idcaixa = document.getElementById('id');
                    var nomecaixa = document.getElementById('desc');
                    var hora1caixa = document.getElementById('hora1');
                    var hora2caixa = document.getElementById('hora2');

                    // Array com os nomes dos dias da semana em ordem
                    var diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

                    // Desmarcar todos os checkboxes
                    diasDaSemana.forEach(dia => {
                        document.getElementById(dia).checked = false;
                    });

                    mostrarModal();

                    idcaixa.value = id;
                    nomecaixa.value = nome;

                    // Separar a hora e os minutos
                    var [horaSeparada, minutosSeparados] = hora.split(":");

                    // Preencher os inputs correspondentes
                    hora1caixa.value = horaSeparada;
                    hora2caixa.value = minutosSeparados;

                    // Converter o valor de semana para um número inteiro
                    const semanaArray = semana.split('').map(Number);
                    
                    // Verificando e exibindo os dias da semana
                    for (let i = 0; i < semanaArray.length - 1; i++) {
                        console.log("Dia " + semanaArray[i] + ": " + diasDaSemana[semanaArray[i]]);
                        document.getElementById(diasDaSemana[semanaArray[i]]).checked = true;
                         
                    }
                }


                
                function apagarRotina(id) {
                    // Chamada para apagar a rotina com o ID fornecido
                    fetch('/apagarRotina/' + id, {
                        method: 'POST',
                    })
                    .then(response => response.text())
                    .then(message => {
                        console.log(message);
                        atualizarRotinas();
                    });
                }
                                    
                //LEITURA E GRAVAÇÃO                
                                
                function gravarRotina() {
                                   
                    const semanaStr = [
                        document.getElementById("DOM").checked ? '0' : '',
                        document.getElementById("SEG").checked ? '1' : '',
                        document.getElementById("TER").checked ? '2' : '',
                        document.getElementById("QUA").checked ? '3' : '',
                        document.getElementById("QUI").checked ? '4' : '',
                        document.getElementById("SEX").checked ? '5' : '',
                        document.getElementById("SAB").checked ? '6' : ''
                    ].join('');
                    
                    
                    var id = document.getElementById('id').value;
                    var desc = document.getElementById('desc').value;
                    var hora = document.getElementById('hora1').value + ":" + document.getElementById('hora2').value;
                    var semana = semanaStr;

                    if (id === "") {
                        id = 0;
                        console.log('ó o id: ' + id);
                    }

                    var caixa = id + ";" + desc + ";" + hora + ";" + semana + ".";
                    
                    
                    if (
                        document.getElementById('DOM').checked === false &&
                        document.getElementById('SEG').checked === false &&
                        document.getElementById('TER').checked === false &&
                        document.getElementById('QUA').checked === false &&
                        document.getElementById('QUI').checked === false &&
                        document.getElementById('SEX').checked === false &&
                        document.getElementById('SAB').checked === false
                    ){
                        document.getElementById('aviso-semana').hidden = false;
                        
                        
                        setTimeout(() => {
                            document.getElementById('aviso-semana').hidden = true;
                        }, 2000);
                        
                    }else{
                        fetch('/gravar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/plain',
                            },
                            body: caixa,
                        })
                        .then(response => response.text())
                        .then(message => {
                            console.log(message);
                            ocultarModal();
                            atualizarRotinas();  // Usa o operador de espalhamento para concatenar os arrays
                        })                    
                        .catch(error => {
                            console.error('Erro ao gravar a rotina:', error);
                        });                    
                    
                    }  
                }





                
                //RELOGIO DO CLIENT
                
                 function atualizarHorario() {
                    $.ajax({
                        url: '/horario', // Rota no servidor para obter o horário
                        method: 'GET',
                        dataType: 'text',
                        success: function (data) {
                            $('#horarioAtual').text(data); // Atualiza o conteúdo da <span>
                        },
                        error: function (error) {
                            console.error('Erro ao obter o horário:', error);
                        }
                    });
                }
                
                atualizarHorario();
                atualizarRotinas();
                
                setInterval(atualizarHorario, 1000);
                setInterval(updateLog, 4000);
                
            </script>
        </body>
        </html>
    `);
    
    
});


function obterHorarioAtual() {
    const dataAtual = new Date();
    const horarioFormatado = dataAtual.toLocaleString();
    return horarioFormatado;
}

async function apagarLog() {
    try {
        const filePath = 'log.txt';

        // Lê o conteúdo do arquivo 'log.txt'
        const data = await fs.readFile(filePath, 'utf-8');

        // Divida as linhas do arquivo em um array
        const linhas = data.split('\n').filter(linha => linha.trim() !== '');

        // Verifica se o número de linhas é maior que 200
        if (linhas.length > 200) {
            // Cria um novo conteúdo vazio
            const novoConteudo = '';

            // Escreve o conteúdo vazio no arquivo 'log.txt'
            await fs.writeFile(filePath, novoConteudo, 'utf-8');

            console.log('Conteúdo do arquivo log.txt limpo devido ao limite de 200 linhas.');
        }
    } catch (error) {
        console.error('Erro ao limpar o arquivo log.txt:', error);
    }
}

async function verificarHorariosRotinas() {
    try {
        // Lê o conteúdo do arquivo rotinas.txt
        const data = await fs.readFile('rotinas.txt', 'utf-8');

        // Divida as linhas do arquivo em um array
        const linhas = data.split('.').filter(linha => linha.trim() !== '');

        // Obtem o horário atual
        const horaMinutoAtual = obterHoraMinuto();
        const diaSemanaAtual = obterDiaSemanaAtual();
        

        // Verifica se o horário atual está presente nas rotinas
        for (const linha of linhas) {
            const horaMinutoRotina = linha.split(';')[2];
            
            //separa dias semana
            const diaSemanaRotina = linha.split(';')[3];
            const arrayDias = diaSemanaRotina.split('').map(Number);
            
            for (var i = 0; i < arrayDias.length; i++){
                //console.log(diaSemanaAtual +' = '+ arrayDias[i]);
            } 
                       
            //console.log('vai passar na condição');
            if (horaMinutoAtual === horaMinutoRotina) {
                //console.log('passou hora');
                for (var i = 0; i < arrayDias.length; i++){
                    console.log(diaSemanaAtual +' = '+ arrayDias[i]);
                    if (diaSemanaAtual  === arrayDias[i]){
                        //console.log('passou dias');
                        
                        // Aciona a sirene se encontrar um horário correspondente
                        AcionaOn();
                        break;  // Para a verificação após encontrar uma correspondência
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar os horários das rotinas:', error);
    }
}

setInterval(verificarHorariosRotinas, 1000);

// PUXA CONFIG  

app.get('/config', async (req, res) => {
    try {
        // Lê o conteúdo do arquivo config.json
        const data = await fs.readFile('start.sh', 'utf-8');
        
        const dataSplit = data.split('\n');
        
        const config = dataSplit[0]
        
        configSplit = config.split(';');
        
        const [interface, ip, mask, gat, dns] = configSplit;

        // Converte os dados para uma string e envia como resposta em texto
        const configText = `ip: ${config.ip}, mask: ${config.mask}, gat: ${config.gat}, dns: ${config.dns}`;

        res.send(config);
    } catch (error) {
        console.error('Erro ao ler o arquivo config.json:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// LÊ  

app.get('/rotinas', async (req, res) => {
    try {
        // Lê o conteúdo do arquivo rotinas.txt
        const data = await fs.readFile('rotinas.txt', 'utf-8');

        // Divida as linhas do arquivo em um array
        const linhas = data.split('\n').filter(linha => linha.trim() !== '');

        // Gera uma tabela HTML a partir das linhas com títulos nas colunas
        const tabelaHTML = `<thead><tr><th>ID</th><th>Nome</th><th>Horário</th><th>Semana</th><th>Ações</th></tr></thead><tbody>${linhas.map((linha, index) => {
            const [id, nome, hora, semana] = linha.split(';');
            
            var diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
            
            // Converter o valor de semana para um número inteiro
            const semanaArray = semana.split('').map(Number);
            
            var semanaNova = [semanaArray.length];
                    
            // Verificando e exibindo os dias da semana
            for (let i = 0; i < semanaArray.length - 1; i++) {
                //console.log("Dia " + semanaArray[i] + ": " + diasDaSemana[semanaArray[i]]);
                semanaNova[i] = diasDaSemana[semanaArray[i]]; 
            }
            
            
            return `<tr><td>${id}</td><td>${nome}</td><td>${hora}</td><td>${semanaNova}</td><td><a class="default-button-red" onclick="apagarRotina(${id});">Apagar</a><a class="default-button-orange" <a onclick="atualizarRotinas(); editarRotina(${id}, '${nome}', '${hora}', '${semana}');">Editar</a></td></tr>`;
        }).join('')}</tbody>`;
        
        const vazio = `<h1>Não há rotinas para exibir, cadastre uma nova!</h1>`
        
        if (linhas.length === 0){
            // Envia a resposta vazia
            res.send(vazio);            
        }else{
            // Envia a resposta com a tabela HTML
            res.send(tabelaHTML);
        }
        
    } catch (error) {
        console.error('Erro ao ler o arquivo rotinas.txt:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// DELETA

app.post('/apagarRotina/:id', async (req, res) => {
    try {
        const idToRemove = req.params.id;
        // Lógica para remover a rotina com o ID fornecido do arquivo rotinas.txt

        // Exemplo de como remover uma linha com o ID fornecido
        // Você pode ajustar isso de acordo com a estrutura real do seu arquivo rotinas.txt
        const data = await fs.readFile('rotinas.txt', 'utf-8');
        const linhas = data.split('\n');
        const novaLista = linhas.filter(linha => {
            const [id] = linha.split(';');
            return id !== idToRemove;
        });
        await fs.writeFile('rotinas.txt', novaLista.join('\n'), 'utf-8');
        
        res.send('Rotina removida com sucesso.');
        gravaLog(obterHorarioAtual() + ' - Rotina excluída...<br>');
    } catch (error) {
        console.error('Erro ao remover a rotina:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// GRAVA 

app.post('/gravar', express.text(), async (req, res) => {
    const novaRotina = req.body;
    try {
        const data = await fs.readFile('rotinas.txt', 'utf-8');
        let linhas = data.split('\n').filter(linha => linha.trim() !== '');

        // Encontrar o último ID existente
        const ultimoId = linhas.reduce((maxId, linha) => {
            const id = parseInt(linha.split(';')[0]);
            return id > maxId ? id : maxId;
        }, 0);

        // Verificar se o ID fornecido é 0
        const novaRotinaArray = novaRotina.split(';');
        if (parseInt(novaRotinaArray[0]) === 0) {
            novaRotinaArray[0] = (ultimoId + 1).toString(); // Substituir 0 pelo próximo ID disponível
        }

        // Atualizar novaRotina com os dados modificados, se necessário
        const novaRotinaAtualizada = novaRotinaArray.join(';');

        // Verificar se já existe uma rotina com o mesmo ID
        const indiceRotinaExistente = linhas.findIndex(linha => {
            const idExistente = linha.split(';')[0];
            const idNovaRotina = novaRotinaAtualizada.split(';')[0];
            return idExistente === idNovaRotina;
        });

        if (indiceRotinaExistente !== -1) {
            // Se já existe, atualiza a linha correspondente
            linhas[indiceRotinaExistente] = novaRotinaAtualizada;
        } else {
            // Se não existe, adiciona uma nova linha
            linhas.push(novaRotinaAtualizada);
        }

        // Limpa o arquivo antes de escrever o novo conteúdo
        await fs.writeFile('rotinas.txt', '');

        // Reescreve o arquivo com as modificações
        await fs.appendFile('rotinas.txt', linhas.join('\n'));

        res.send('Rotina gravada com sucesso!');
        gravaLog(obterHorarioAtual() + ' - Rotina gravada...<br>');
    } catch (error) {
        console.error('Erro ao gravar no arquivo rotinas.txt:', error);
        res.status(500).send({ erro: 'Erro ao gravar no arquivo' });
    }
});

// LOG

app.get('/log', async (req, res) => {
    apagarLog();
    try {
        // Lê o conteúdo do arquivo rotinas.txt
        const data = await fs.readFile('log.txt', 'utf-8');

        // Divida as linhas do arquivo em um array
        const linhas = data.split('\n').filter(linha => linha.trim() !== '');

        // Gera uma lista HTML a partir das linhas
        const listaHTML = `${linhas.map((linha, index) => 'obterHoraMinuto()' + '${linha}').join('')}`;
        // Envia a resposta com a lista HTML
        res.send(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo rotinas.txt:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

function gravaLog(log){
    try {        
        console.log(log);

        // Atualiza o arquivo com as modificações
        fs.appendFile('log.txt', log + '\n');
        
    } catch (error) {
        console.error('Erro ao gravar no arquivo log.txt:', error);
    }
}

// CONFIGURAÇÃO

app.post('/atualizar-configuracao', express.text(), async (req, res) => {
    const novoConteudo = req.body;
    const caminhoDoArquivo = 'start.sh';

    try {
        // Lê o conteúdo atual do arquivo
        const conteudoAtual = await fs.readFile(caminhoDoArquivo, 'utf-8');

        // Verifica se o conteúdo é diferente antes de atualizar
        if (conteudoAtual !== novoConteudo) {
            // Limpa o arquivo antes de escrever o novo conteúdo
            await fs.writeFile(caminhoDoArquivo, novoConteudo);

            res.send('Configuração atualizada com sucesso!');
            // Adicione lógica adicional, se necessário, como logs ou notificações
        } else {
            res.send('Configuração já está atualizada. Nenhuma alteração feita.');
        }
    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        res.status(500).send({ erro: 'Erro ao processar a solicitação' });
    }
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
