const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const Gpio = require('onoff').Gpio;
const pino20 = new Gpio(532, 'out');
const pino21 = new Gpio(533, 'out');
const port = 6065;
const { exec } = require('child_process'); // Para executar comandos de shell
const os = require('os');

const interfaces = os.networkInterfaces();


pino20.writeSync(1);
pino21.writeSync(1);

let acionarPinos = true;
let cooldownAtivo = false;

async function NodeNmcli() {
    try {
        // Lê o conteúdo do arquivo rede.json
        const data = await fs.readFile('rede.json', 'utf-8');
        
        // Converte o JSON lido para um objeto JavaScript
        const config = JSON.parse(data);

        // Monta os comandos para atualizar a configuração
        const modifyCommand = `sudo nmcli connection modify "Wired connection 1" \
            ipv4.method manual \
            ipv4.addresses ${config.ip_address} \
            ipv4.gateway ${config.gateway} \
            ipv4.dns "${config.dns}"`;

        const upCommand = `sudo nmcli connection up "Wired connection 1"`;

        // Executa o comando de modificação
        exec(modifyCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao modificar a conexão: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Erro: ${stderr}`);
                return;
            }
            console.log(`Conexão modificada: ${stdout}`);

            // Executa o comando para ativar a conexão
            exec(upCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao ativar a conexão: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Erro: ${stderr}`);
                    return;
                }
                console.log(`Conexão ativada: ${stdout}`);
            });
        });
    } catch (error) {
        console.error('Erro ao ler o arquivo rede.json:', error);
    }
}

function AcionaOn(tempo) {
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
                AcionaOff(tempo); // Chama AcionaOff após 5 segundos
            }, tempo);
        }
    } catch (error) {
        console.error('Erro ao alterar os pinos:', error.message);
    }
}

function AcionaOff(tempo) {
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
        }, (60000 - tempo));

        // Desativa o cooldown após 55 segundos
        setTimeout(() => {
            cooldownAtivo = false;
        }, (60000 - tempo));
    } catch (error) {
        console.error('Erro ao alterar os pinos:', error.message);
    }
}



function acionarSirene() {
    try {
        const estado20 = pino20.readSync();
        const estado21 = pino21.readSync();
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
  res.sendFile(path.join(__dirname, 'index.html'));
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
        if (linhas.length > 1000) {
            // Cria um novo conteúdo vazio
            const novoConteudo = '';

            // Escreve o conteúdo vazio no arquivo 'log.txt'
            await fs.writeFile(filePath, novoConteudo, 'utf-8');

            console.log('Conteúdo do arquivo log.txt limpo devido ao limite de 1000 linhas.');
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
            const horaMinutoRotina = linha.split(';')[3];
            
            //separa dias semana
            const diaSemanaRotina = linha.split(';')[4];
            const arrayDias = diaSemanaRotina.split('').map(Number);
            
            //tempo acionamento
            const tempo = (linha.split(';')[2] * 1000);
            console.log(tempo);
            
            for (var i = 0; i < arrayDias.length; i++){
                //console.log(diaSemanaAtual +' = '+ arrayDias[i]);
            } 
                       
            //console.log('vai passar na condição');
            if (horaMinutoAtual === horaMinutoRotina) {
                //console.log('passou hora');
                for (var i = 0; i < arrayDias.length; i++){
                    //console.log(diaSemanaAtual +' = '+ arrayDias[i]);
                    if (diaSemanaAtual  === arrayDias[i]){
                        //console.log('passou dias');
                        
                        // Aciona a sirene se encontrar um horário correspondente
                        AcionaOn(tempo);
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
        // Lê o conteúdo do arquivo rede.json
        const data = await fs.readFile('rede.json', 'utf-8');
        
        // Converte o JSON lido para um objeto JavaScript
        const config = JSON.parse(data);

        // Retorna o objeto como JSON
        res.json(config);
    } catch (error) {
        console.error('Erro ao ler o arquivo rede.json:', error);
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
        const tabelaHTML = `<thead><tr><th>ID</th><th>Nome</th><th>Tempo</th><th>Horário</th><th>Semana</th><th>Ações</th></tr></thead><tbody>${linhas.map((linha, index) => {
            const [id, nome, tempo, hora, semana] = linha.split(';');
            
            var diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
            
            // Converter o valor de semana para um número inteiro
            const semanaArray = semana.split('').map(Number);
            
            var semanaNova = [semanaArray.length];
                    
            // Verificando e exibindo os dias da semana
            for (let i = 0; i < semanaArray.length - 1; i++) {
                //console.log("Dia " + semanaArray[i] + ": " + diasDaSemana[semanaArray[i]]);
                semanaNova[i] = diasDaSemana[semanaArray[i]]; 
            }
            
            
            return `<tr><td>${id}</td><td>${nome}</td><td>${tempo}</td><td>${hora}</td><td>${semanaNova}</td><td><a class="default-button-red" onclick="apagarRotina(${id});">Apagar</a><a class="default-button-orange" <a onclick="atualizarRotinas(); editarRotina(${id}, '${nome}', '${tempo}', '${hora}', '${semana}');">Editar</a></td></tr>`;
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
        console.error('Erro ao ler o arquivo rotinas.rotn:', error);
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
    const caminhoDoArquivo = 'rede.json';

    try {
        // Lê o conteúdo atual do arquivo
        const conteudoAtual = await fs.readFile(caminhoDoArquivo, 'utf-8');

        // Verifica se o conteúdo é diferente antes de atualizar
        if (conteudoAtual !== novoConteudo) {
            // Limpa o arquivo antes de escrever o novo conteúdo
            await fs.writeFile(caminhoDoArquivo, novoConteudo);

            res.send('Configuração atualizada com sucesso!');
            NodeNmcli();
            // Adicione lógica adicional, se necessário, como logs ou notificações
        } else {
            res.send('Configuração já está atualizada. Nenhuma alteração feita.');
        }
    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        res.status(500).send({ erro: 'Erro ao processar a solicitação' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}\n\n\nVoce pode acessar pelo dominio de rede tambem: http://metah:6065\n\n\n`);
});
