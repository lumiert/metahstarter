const express = require('express');
const fs = require('fs').promises;  // Use o módulo 'fs' com suporte a promises
const app = express();
const Gpio = require('onoff').Gpio;
const pino20 = new Gpio(20, 'out');
const pino21 = new Gpio(21, 'out');
const port = 6065;

function alternarPinos() {
  try {
    const estado20 = pino20.readSync();
    const estado21 = pino21.readSync();

    pino20.writeSync(estado20 === 0 ? 1 : 0);
    pino21.writeSync(estado21 === 0 ? 1 : 0);
  } catch (error) {
    console.error('Erro ao alterar os pinos:', error.message);
  }
}



// Inicia o loop após 2 segundos
setTimeout(() => {
  setInterval(alternarPinos, 2000);
}, 2000);

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

            <button onclick="gravarRotina(caixa);">Gravar Rotina</button>
            
            <input type="text" id="caixa">
            
            <button onclick="atualizarRotinas();">Exibir Rotinas</button>
            
            <p id="output"></p>
            
            <script>              
                
                //UPDATE E CONVERSÃO
                
                function atualizarRotinas() {
                    fetch('/rotinas')
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('output').innerText = data;
                    });
                }
                
                
                //LEITURA E GRAVAÇÃO
                
                var caixa = document.getElementById('caixa');
                
                function gravarRotina(conteudo) {
                    // Envia uma solicitação para o servidor gravar a letra
                    fetch('/gravar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ conteudo }),
                    })
                    .then(response => response.json())
                    .then(data => console.log(data));
                    atualizarRotinas();
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

                // Inicializa o horário
                atualizarHorario();
                
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

// Rota para exibir as letras
app.get('/rotinas', async (req, res) => {
    try {
        // Lê o conteúdo do arquivo letras.txt
        const data = await fs.readFile('rotinas.json', 'utf-8');
        // Envia a resposta com o conteúdo do arquivo
        res.send(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo rotinas.txt:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.post('/gravar', express.json(), (req, res) => {
    const { rotinas } = req.body;
    fs.readFile('rotinas.json', 'utf-8')
    .then(conteudoAtual => {
        const novoConteudo = `${conteudoAtual}${conteudo}\n`;
        return fs.writeFile('rotinas.json', novoConteudo);
    })
    .then(() => {
        res.json({ mensagem: 'Letra gravada com sucesso' });
    })
    .catch(error => {
        console.error('Erro ao gravar no arquivo letras.txt:', error);
        res.status(500).json({ erro: 'Erro ao gravar no arquivo' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

