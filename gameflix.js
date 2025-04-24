// Definição dos consoles e suas informações
const consoles = [
    {
        id: 'nes',
        name: 'Nintendo Entertainment System',
        pageUrl: 'NES.html',
        folderPath: 'NES',
        gameParameter: 'nesGame',
        background: 'fundos/fundoNES.png'
    },
    {
        id: 'nintendo64',
        name: 'Nintendo 64',
        pageUrl: 'Nintendo64.html',
        folderPath: 'nintendo64',
        gameParameter: 'n64Game',
        background: 'fundos/fundoNintendo64.png'
    },
    {
        id: 'segamegadrive',
        name: 'Sega Mega Drive',
        pageUrl: 'SegaMegaDrive.html',
        folderPath: 'SegaMegaDrive',
        gameParameter: 'mdGame',
        background: 'fundos/fundoSegaMegaDrive.png'
    },
    {
        id: 'snes',
        name: 'Super Nintendo ',
        pageUrl: 'SNES.html',
        folderPath: 'SNES',
        gameParameter: 'snesGame',
        background: 'fundos/fundoSNES.png'
    },
    
   
    {
        id: 'playstation1',
        name: 'PlayStation 1',
        pageUrl: 'PlayStation1.html',
        folderPath: 'playstation1',
        gameParameter: 'ps1Game',
        background: 'fundos/fundoPlayStation1.png'
    }
];

const jogos = {
    'nes': [
        { 
            titulo: 'Super Mario Bros 3',
            capa: 'NES/Super Mario Bros 3/capa Super Mario Bros 3.png',
            caminho: 'NES/Super Mario Bros 3/Super Mario Bros. 3 (USA).nes',
            descricao: 'Mario embarks on a quest to save Princess Toadstool from Bowser\'s children.'
        },
        { 
            titulo: 'Castlevania',
            capa: 'NES/Castlevania/capa Castlevania.png',
            caminho: 'NES/Castlevania/Castlevania (USA).nes',
            descricao: 'Simon Belmont battles Dracula in this gothic action-platformer.'
        },
        { 
            titulo: 'Prince of Persia',
            capa: 'NES/Prince of Persia/capa Prince of Persia.png',
            caminho: 'NES/Prince of Persia/Prince of Persia (USA).nes',
            descricao: 'Guide the prince through deadly traps to defeat Jaffar and save the princess.'
          },
          { 
            titulo: 'RoboCop',
            capa: 'NES/RoboCop/capa RoboCop.png',
            caminho: 'NES/RoboCop/RoboCop (USA).nes',
            descricao: 'Play as RoboCop to battle crime and corrupt forces in dystopian Detroit.'
          },
          { 
            titulo: 'Battletoads',
            capa: 'NES/Battletoads/capa Battletoads.png',
            caminho: 'NES/Battletoads/Battletoads (USA).nes',
            descricao: 'Three toads fight through wild levels to rescue their kidnapped friends.'
          },
        { 
            titulo: 'Contra',
            capa: 'NES/Contra/capa Contra.png',
            caminho: 'NES/Contra/Contra (USA).nes',
            descricao: 'Run-and-gun action with two soldiers fighting alien forces.'
        }
    ],
    'snes': [
        { 
            titulo: 'Mega Man X',
            capa: 'SNES/Mega Man X/capa Mega Man X.png',
            caminho: 'SNES/Mega Man X/Mega Man X (USA).sfc',
            descricao: 'Fight Mavericks in this futuristic Mega Man platformer.'
        },
        { 
            titulo: 'Super Mario World',
            capa: 'SNES/Super Mario World/capa Super Mario World.png',
            caminho: 'SNES/Super Mario World/Super Mario World (USA).sfc',
            descricao: 'Mario explores Dinosaur Land with Yoshi to rescue Princess Peach.'
        },
        { 
            titulo: 'STAR FOX',
            capa: 'SNES/STAR FOX/capa STAR FOX.png',
            caminho: 'SNES/STAR FOX/Star Fox (USA).sfc',
            descricao: 'Pilot the Arwing through 3D space battles to defeat Andross.'
        },
        { 
            titulo: 'Super Metroid',
            capa: 'SNES/Super Metroid/capa Super Metroid.png',
            caminho: 'SNES/Super Metroid/Super Metroid (Japan, USA) (En,Ja).sfc',
            descricao: 'Samus explores Planet Zebes to retrieve a stolen Metroid.'
        },
        { 
            titulo: 'Teenage Mutant Ninja Turtles IV',
            capa: 'SNES/Teenage Mutant Ninja Turtles IV – Turtles In Time/capa TMNT.png',
            caminho: 'SNES/Teenage Mutant Ninja Turtles IV – Turtles In Time/Teenage Mutant Ninja Turtles IV - Turtles in Time (USA).sfc',
            descricao: 'Time-traveling brawler starring the Teenage Mutant Ninja Turtles.'
        },
        { 
            titulo: 'The Legend of Zelda A Link to the Past',
            capa: 'SNES/The Legend of Zelda A Link to the Past/capa The Legend of Zelda A Link to the Past.png',
            caminho: 'SNES/The Legend of Zelda A Link to the Past/Legend of Zelda, The - A Link to the Past (USA).sfc',
            descricao: 'Link explores two worlds to save Hyrule and Princess Zelda.'
        }
    ],
    'nintendo64': [
        { 
            titulo: 'Super Mario 64', 
            capa: 'nintendo64/Super Mario 64/capa Super Mario 64.png',
            caminho: 'nintendo64/Super Mario 64/Super Mario 64 (USA).z64',
            descricao: 'Mario leaps into 3D to rescue Peach from Bowser.'
        },
        { 
            titulo: 'The Legend of Zelda: Ocarina of Time', 
            capa: 'nintendo64/The Legend Of Zelda – Ocarina Of Time/capa The Legend Of Zelda – Ocarina Of Time.png',
            caminho: 'nintendo64/The Legend Of Zelda – Ocarina Of Time/Legend of Zelda, The - Ocarina of Time (USA) (Collectors Edition).z64',
            descricao: 'Link travels through time to thwart Ganondorf’s evil plans.'
        },
        {
            titulo: 'The Legend Of Zelda – Majoras Mask',
            capa: 'nintendo64/The Legend Of Zelda – Majoras Mask/capa The Legend of Zelda Majoras Mask.png',
            caminho: 'nintendo64/The Legend Of Zelda – Majoras Mask/Legend of Zelda, The Majoras Mask Redux.z64',
            descricao: 'Link races against time to save Termina from the moon.'
        },
        {
            titulo: 'Pokémon Stadium',
            capa: 'nintendo64/Pokémon Stadium/capa Pokémon Stadium.png',
            caminho: 'nintendo64/Pokémon Stadium/Pokemon Stadium (USA).z64',
            descricao: 'Battle Pokémon in 3D arenas with your trained team.'
        },
        {
            titulo: 'Castlevania',
            capa: 'nintendo64/Castlevania/capa Castlevania.png',
            caminho: 'nintendo64/Castlevania/Castlevania (USA).z64',
            descricao: 'Fight monsters through Dracula\'s castle in 3D.'
        },
        {
            titulo: '007 – Golden Eye',
            capa: 'nintendo64/007 – Golden Eye/capa 007 – Golden Eye.png',
            caminho: 'nintendo64/007 – Golden Eye/GoldenEye 007 (USA).z64',
            descricao: 'James Bond infiltrates enemy bases in classic spy action.'
        }
    ],
    'playstation1': [
        { 
            titulo: 'Crash Bandicoot',
            capa: 'playstation1/Crash Bandicoot/capa Crash Bandicoot.png',
            caminho: 'playstation1/Crash Bandicoot/Crash Bandicoot (USA).cue',
            caminhoBin: 'playstation1/Crash Bandicoot/Crash Bandicoot (USA).bin',
            descricao: 'Spin, jump, and run through dangerous tropical levels.'
        },
        { 
            titulo: 'Resident Evil',
            capa: 'playstation1/Resident Evil/capa Resident Evil.png',
            caminho: 'playstation1/Resident Evil/Resident Evil - Directors Cut (USA).cue',
            caminhoBin: 'playstation1/Resident Evil/Resident Evil - Directors Cut (USA).bin',
            descricao: 'Survive a zombie outbreak in a mysterious mansion.'
        }
    ],
    'segamegadrive': [
        { 
            titulo: 'Sonic the Hedgehog 2',
            capa: 'SegaMegaDrive/Sonic the Hedgehog 2/capa Sonic the Hedgehog 2.png',
            caminho: 'SegaMegaDrive/Sonic the Hedgehog 2/Sonic The Hedgehog 2 (World).md',
            descricao: 'Sonic and Tails race to stop Dr. Robotnik.'
        },
        { 
            titulo: 'Ultimate Mortal Kombat 3',
            capa: 'SegaMegaDrive/Ultimate Mortal Kombat 3/capa Ultimate Mortal Kombat 3.png',
            caminho: 'SegaMegaDrive/Ultimate Mortal Kombat 3/Ultimate Mortal Kombat 3 (USA).md',
            descricao: 'Choose your fighter and conquer the tournament with fatalities.'
        },
        { 
            titulo: 'Dune The Battle for Arrakis',
            capa: 'SegaMegaDrive/Dune The Battle for Arrakis/capa Dune The Battle for Arrakis.png',
            caminho: 'SegaMegaDrive/Dune The Battle for Arrakis/Dune - The Battle for Arrakis (USA).md',
            descricao: 'Real-time strategy battles on the desert planet Arrakis.'
        },
        { 
            titulo: 'Sonic & Knuckles',
            capa: 'SegaMegaDrive/Sonic & Knuckles/capa Sonic & Knuckles.png',
            caminho: 'SegaMegaDrive/Sonic & Knuckles/Sonic & Knuckles (World).md',
            descricao: 'Team up to defeat Robotnik and protect Angel Island.'
        },
        { 
            titulo: 'X-Men',
            capa: 'SegaMegaDrive/X-Men/capa X-Men.png',
            caminho: 'SegaMegaDrive/X-Men/X-Men (USA).md',
            descricao: 'Control mutant heroes against Magneto’s evil forces.'
        },
        { 
            titulo: 'Tetris',
            capa: 'SegaMegaDrive/Tetris/capa Tetris.png',
            caminho: 'SegaMegaDrive/Tetris/Tetris (USA) (Genesis Mini).md',
            descricao: 'Stack falling blocks and clear lines for points.'
        }
    ]
};


// Função para carregar os jogos na interface
function carregarJogos() {
    consoles.forEach(console => {
        const jogosConsole = jogos[console.id];
        const containerJogos = document.getElementById(`${console.id}-games`);
        
        if (jogosConsole && containerJogos) {
            jogosConsole.forEach(jogo => {
                const cardJogo = criarCardJogo(jogo, console);
                containerJogos.appendChild(cardJogo);
            });
        }
    });
}

// Função para criar um card de jogo
function criarCardJogo(jogo, console) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-game-path', jogo.caminho);
    card.setAttribute('data-console', console.id);
    
    const img = document.createElement('img');
    img.src = jogo.capa;
    img.alt = jogo.titulo;
    img.onerror = function() {
        this.src = 'fundos/capa-indisponivel.jpg';
    };
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'game-info';
    
    const title = document.createElement('h3');
    title.textContent = jogo.titulo;
    
    const desc = document.createElement('p');
    desc.textContent = jogo.descricao;
    
    infoDiv.appendChild(title);
    infoDiv.appendChild(desc);
    
    card.appendChild(img);
    card.appendChild(infoDiv);
    
    // Adicionar evento de clique para iniciar o jogo
    card.addEventListener('click', () => {
        iniciarJogo(jogo, console);
    });
    
    return card;
}

// Função para iniciar um jogo
function iniciarJogo(jogo, console) {
    // Para PlayStation 1, precisamos usar o arquivo .cue em vez do .bin
    let caminhoJogo = jogo.caminho;
    
    if (console.id === 'playstation1' && caminhoJogo.endsWith('.bin')) {
        // Substitui a extensão .bin por .cue, mantendo o mesmo nome de arquivo
        caminhoJogo = caminhoJogo.replace('.bin', '.cue');
    }
    
    // Para PlayStation 1, adicione o parâmetro caminhoBin
    let url;
    if (console.id === 'playstation1' && jogo.caminhoBin) {
        // Por padrão, usamos o núcleo PSX (não o beetle-psx)
        url = `${console.pageUrl}?${console.gameParameter}=${encodeURIComponent(caminhoJogo)}&ps1Bin=${encodeURIComponent(jogo.caminhoBin)}`;
        
        // Se o jogo especificar um núcleo preferido, use-o
        if (jogo.core === 'beetle-psx') {
            url += '&coreBeetle=true';
        }
    } else {
        url = `${console.pageUrl}?${console.gameParameter}=${encodeURIComponent(caminhoJogo)}`;
    }
    
    window.location.href = url;
}

// Iniciar quando o DOM estiver carregado
// Add after your existing functions
function resetOrientation() {
    if (window.matchMedia("(orientation: landscape)").matches && 
        (window.location.pathname.endsWith('Nintendo64.html') ||
         window.location.pathname.endsWith('NES.html') ||
         window.location.pathname.endsWith('PlayStation1.html') ||
         window.location.pathname.endsWith('SegaMegaDrive.html') ||
         window.location.pathname.endsWith('SNES.html'))) {
        
        // Force portrait
        screen.orientation.lock('portrait')
            .then(() => {
                // Force back to landscape after a brief delay
                setTimeout(() => {
                    screen.orientation.lock('landscape')
                        .catch(err => console.log('Landscape lock error:', err));
                }, 100);
            })
            .catch(err => console.log('Portrait lock error:', err));
    }
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    carregarJogos();
    resetOrientation();
    
    // Efeito de scroll para a navegação
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Efeito de mudança de background do header ao scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }
    });
});
