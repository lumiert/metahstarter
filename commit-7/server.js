const express = require('express');
const fs = require('fs').promises;
const app = express();
const Gpio = require('onoff').Gpio;
const pino20 = new Gpio(20, 'out');
const pino21 = new Gpio(21, 'out');
const port = 6065;

pino20.writeSync(1);
pino21.writeSync(1);

let acionarPinos = true;

function AcionaOn() {
    
    if (acionarPinos === true) {
    pino20.writeSync(0);
    pino21.writeSync(0); 
    console.log('Ta on');
    }
    // Desativa a flag acionarPinos após 5 segundos
    
    setTimeout(() => {
        acionarPinos = false;
        AcionaOff(); // Chama AcionaOff após 5 segundos
    }, 5000);
}

function AcionaOff() {
    pino20.writeSync(1);
    pino21.writeSync(1);
    console.log('Ta off');

    // Ativa a flag acionarPinos após 55 segundos
    setTimeout(() => {
        acionarPinos = true;
    }, 55000);
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
        
        AcionaOn(); // Chama AcionaOn para acionar os pinos
        
        
    } catch (error) {
        console.error('Erro ao alterar os pinos:', error.message);
    }
}

// Função para obter o dia da semana
function obterDiaSemanaAtual() {
  const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const dataAtual = new Date();
  const diaSemana = diasDaSemana[dataAtual.getDay()];

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

// Rota para a página principal
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Atualizador de Horário</title>
            <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
        </head>
        <body>
            <h1>Horário Atual: <span id="horarioAtual">Carregando...</span></h1>            
            
            <p>Id: </p> <input type="text" id="id">
            
            <p>Descrição: </p> <input type="text" id="desc">
            
            <p>Hora: </p> <input type="text" id="hora">
            
            <p>Semana: </p> <input type="text" id="semana">
            
            <br><br>
            
            <button onclick="gravarRotina();">Gravar Rotina</button>
            
            <button onclick="atualizarRotinas();">Exibir Rotinas</button>
            
            
            <ul id="output"></ul>
            
            <script>              
                atualizarHorario();
                atualizarRotinas();
                
                //UPDATE E CONVERSÃO
                
                function atualizarRotinas() {
                    fetch('/rotinas')
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('output').innerHTML = data;
                    });
                }
                
                
                //LEITURA E GRAVAÇÃO                
                
                
                function gravarRotina() {
                    
                    var id = document.getElementById('id').value;
                    var desc = document.getElementById('desc').value;
                    var hora = document.getElementById('hora').value;
                    var semana = document.getElementById('semana').value;
                    
                    
                    console.log('Vai passar na condição');
                    if (id === "") {
                        id = 0;
                        console.log('ó o id: ' + id);
                    }
                
                    var caixa = id + ";" + desc + ";" + hora + ";" + semana + ".";
                    
                    // Envia uma solicitação para o servidor gravar a rotina
                    fetch('/gravar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                        body: caixa, // Use a propriedade correta
                    })
                    .then(response => response.text())
                    .then(data => {
                        console.log(data);
                        atualizarRotinas();
                    })
                    .catch(error => console.error('Erro ao gravar a rotina:', error));
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

                // Atualiza o horário a cada 1 segundo
                setInterval(atualizarHorario, 1000);
                
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

async function verificarHorariosRotinas() {
    try {
        // Lê o conteúdo do arquivo rotinas.txt
        const data = await fs.readFile('rotinas.txt', 'utf-8');

        // Divida as linhas do arquivo em um array
        const linhas = data.split('.').filter(linha => linha.trim() !== '');

        // Obtem o horário atual
        const horaMinutoAtual = obterHoraMinuto();

        // Verifica se o horário atual está presente nas rotinas
        for (const linha of linhas) {
            const horaMinutoRotina = linha.split(';')[2];
            if (horaMinutoAtual === horaMinutoRotina) {
                // Aciona a sirene se encontrar um horário correspondente
                AcionaOn();
                break;  // Para a verificação após encontrar uma correspondência
            }
        }
    } catch (error) {
        console.error('Erro ao verificar os horários das rotinas:', error);
    }
}

setInterval(verificarHorariosRotinas, 1000);


// LÊ  
app.get('/rotinas', async (req, res) => {
    try {
        // Lê o conteúdo do arquivo rotinas.txt
        const data = await fs.readFile('rotinas.txt', 'utf-8');

        // Divida as linhas do arquivo em um array
        const linhas = data.split('.').filter(linha => linha.trim() !== '');

        // Gera uma lista HTML a partir das linhas
        const listaHTML = `${linhas.map((linha, index) => `<li>${linha}</li>`).join('')}`;
        // Envia a resposta com a lista HTML
        res.send(listaHTML);
    } catch (error) {
        console.error('Erro ao ler o arquivo rotinas.txt:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// GRAVA 

app.post('/gravar', express.text(), async (req, res) => {
    const novaRotina = req.body;
    try {
        const data = await fs.readFile('rotinas.txt', 'utf-8');
        let linhas = data.split('\n');

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

        // Atualiza o arquivo com as modificações
        await fs.writeFile('rotinas.txt', linhas.join('\n'));

        res.send('Rotina gravada com sucesso!');
    } catch (error) {
        console.error('Erro ao gravar no arquivo rotinas.txt:', error);
        res.status(500).send({ erro: 'Erro ao gravar no arquivo' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

