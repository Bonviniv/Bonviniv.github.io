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
    },
    {
        id: 'gba',
        name: 'Game Boy Advance',
        pageUrl: 'GBA.html',
        folderPath: 'GBA',
        gameParameter: 'gbaGame',
        background: 'fundos/fundoGBA.png'
    },
    {
        id: 'ds',
        name: 'Nintendo DS',
        pageUrl: 'DS.html',
        folderPath: 'DS',
        gameParameter: 'dsGame',
        background: 'fundos/fundoDS.png'
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
    ],
    'gba': [
    
    {
        titulo: 'Pokémon Fire Red Version',
        capa: 'GBA/Pokemon Fire Red/capa Pokemon Fire Red.png',
        caminho: 'GBA/Pokemon Fire Red/Pokemon - FireRed Version (USA).gba',
        descricao: 'Remake of original Pokémon Red with enhanced graphics and gameplay.'
    },
    {
        titulo: 'Pokémon LeafGreen Version',
        capa: 'GBA/Pokémon LeafGreen Version/capa Pokémon LeafGreen Version.png',
        caminho: 'GBA/Pokemon LeafGreen Version/Pokemon - LeafGreen Version (USA).gba',
        descricao: 'Explore Kanto and collect Pokémon in this enhanced classic remake.'
    },
    {
        titulo: 'Pokémon Ruby Version',
        capa: 'GBA/Pokémon Ruby Version/capa Pokémon Ruby Version.png',
        caminho: 'GBA/Pokémon Ruby Version/Pokemon - Ruby Version (USA).gba',
        descricao: 'Battle Team Magma and explore the Hoenn region with exclusive Pokémon.'
    },
    {
        titulo: 'Pokémon Sapphire Version',
        capa: 'GBA/Pokémon Sapphire Version/capa Pokémon Sapphire Version.png',
        caminho: 'GBA/Pokémon Sapphire Version/Pokemon - Sapphire Version (USA).gba',
        descricao: 'Fight Team Aqua and complete your Pokédex in the water-filled Hoenn region.'
    },
    {
        titulo: 'Pokémon Emerald Version',
        capa: 'GBA/Pokémon Emerald Version/capa Pokémon Emerald Version.png',
        caminho: 'GBA/Pokémon Emerald Version/Pokemon - Emerald Version (USA, Europe).gba',
        descricao: 'Catch and battle Pokémon in the Hoenn region with new features.'
    }
],
'ds': [
    {
        titulo: 'Mario Kart DS',
        capa: 'DS/Mario Kart DS/capa Mario Kart DS.png',
        caminho: 'DS/Mario Kart DS/Mario Kart DS (USA) (En,Fr,De,Es,It).nds',
        descricao: 'Race with classic Nintendo characters in fast-paced kart battles.'
    },
    {
        titulo: 'New Super Mario Bros',
        capa: 'DS/New Super Mario Bros/capa New Super Mario Bros.png',
        caminho: 'DS/New Super Mario Bros/New Super Mario Bros. (USA).nds',
        descricao: 'Mario returns in a fresh 2D adventure with new moves and bosses.'
    },
    {
        titulo: 'Pokémon Black and White 2',
        capa: 'DS/Pokémon Black and White 2/capa Pokémon Black and White 2.png',
        caminho: 'DS/Pokémon Black and White 2/Pokemon Black 2  251 Edition V2.1 Complete.nds',
        descricao: 'Explore Unova in this enhanced sequel with new Pokémon and storyline.'
    },
    {
        titulo: 'Pokémon HeartGold Version',
        capa: 'DS/Pokémon HeartGold Version/capa Pokémon HeartGold Version.png',
        caminho: 'DS/Pokémon HeartGold Version/Pokemon - HeartGold Version (USA).nds',
        descricao: 'Remake of Pokémon Gold with walking Pokémon and added features.'
    },
    {
        titulo: 'Pokémon Platinum',
        capa: 'DS/Pokémon Platinum/capa Pokémon Platinum.png',
        caminho: 'DS/Pokémon Platinum/Pokemon - Platinum Version (USA).nds',
        descricao: 'A refined version of Diamond and Pearl with new content and story.'
    },
    {
        titulo: 'Pokémon SoulSilver Version',
        capa: 'DS/Pokémon SoulSilver Version/capa Pokémon SoulSilver Version.png',
        caminho: 'DS/Pokémon SoulSilver Version/Pokemon - SoulSilver Version (USA).nds',
        descricao: 'Journey through Johto with your favorite Pokémon following you.'
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

// Add recommended download links for DS games
const dsDownloadLinks = {
    'DS/Mario Kart DS/Mario Kart DS (USA) (En,Fr,De,Es,It).nds': 'https://romsfun.com/download/mario-kart-ds-117541/8',
    'DS/New Super Mario Bros/New Super Mario Bros. (USA).nds': 'https://romsfun.com/download/new-super-mario-bros-2-2020/9',
    'DS/Pokémon Black and White 2/Pokemon Black 2  251 Edition V2.1 Complete.nds': 'https://romsfun.com/download/pokemon-black-and-white-2-1962/1',
    'DS/Pokémon HeartGold Version/Pokemon - HeartGold Version (USA).nds': 'https://romsfun.com/download/pokemon-heartgold-version-118824/2',
    'DS/Pokémon Platinum/Pokemon - Platinum Version (USA).nds': 'https://romsfun.com/download/pokemon-platinum-1910/3',
    'DS/Pokémon SoulSilver Version/Pokemon - SoulSilver Version (USA).nds': 'https://romsfun.com/download/pokemon-soulsilver-version-118860/3'
};

// Add the DS file upload modal HTML
function createDSModal() {
    const modal = document.createElement('div');
    modal.className = 'ds-modal';
    modal.innerHTML = `
        <div class="ds-modal-content">
            <h2>Upload ROM File</h2>
            <p>Please select your .nds ROM file to play this game.</p>
            <input type="file" accept=".nds" id="ds-file-input" class="ds-file-input">
            <div class="ds-modal-buttons">
                <button id="ds-upload-btn" class="ds-btn">Play Game</button>
                <button id="ds-cancel-btn" class="ds-btn">Cancel</button>
            </div>
            <p class="ds-download-text">Don't have the ROM? <a href="#" id="ds-download-link" target="_blank">Download here</a></p>
        </div>
    `;
    return modal;
}

// Modify the iniciarJogo function
function iniciarJogo(jogo, console) {
    let caminhoJogo = jogo.caminho;
    
    // Special handling for DS games
    if (console.id === 'ds') {
        const modal = createDSModal();
        document.body.appendChild(modal);
        
        const fileInput = modal.querySelector('#ds-file-input');
        const uploadBtn = modal.querySelector('#ds-upload-btn');
        const cancelBtn = modal.querySelector('#ds-cancel-btn');
        const downloadLink = modal.querySelector('#ds-download-link');
        
        // Set download link if available
        if (dsDownloadLinks[caminhoJogo]) {
            downloadLink.href = dsDownloadLinks[caminhoJogo];
        }
        
        uploadBtn.addEventListener('click', () => {
            const file = fileInput.files[0];
            if (file) {
                const objectUrl = URL.createObjectURL(file);
                window.location.href = `${console.pageUrl}?${console.gameParameter}=${encodeURIComponent(objectUrl)}`;
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        return;
    }
    
    // Rest of the function remains the same for other consoles
    if (console.id === 'playstation1' && caminhoJogo.endsWith('.bin')) {
        caminhoJogo = caminhoJogo.replace('.bin', '.cue');
    }
    
    let url;
    if (console.id === 'playstation1' && jogo.caminhoBin) {
        url = `${console.pageUrl}?${console.gameParameter}=${encodeURIComponent(caminhoJogo)}&ps1Bin=${encodeURIComponent(jogo.caminhoBin)}`;
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
        
        // Use alternative orientation handling
        if (window.screen && window.screen.orientation) {
            try {
                window.screen.orientation.unlock();
                window.screen.orientation.lock('landscape')
                    .catch(err => console.log('Orientation lock not supported:', err));
            } catch (err) {
                console.log('Orientation API not supported');
            }
        }
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
