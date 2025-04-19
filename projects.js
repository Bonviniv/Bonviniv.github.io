document.body.style.cursor = `url('assets/cursor04.png'), auto`;

const techIcons = {
    HTML: '<i class="fab fa-html5"></i>',
    CSS: '<i class="fab fa-css3-alt"></i>',
    JavaScript: '<i class="fab fa-js"></i>',
    React: '<i class="fab fa-react"></i>',
    Angular: '<i class="fab fa-angular"></i>',
    TypeScript: '<svg class="tech-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3,3H21V21H3V3M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86M13,11.25H8V12.75H9.5V20H11.25V12.75H13V11.25Z"/></svg>',
    SCSS: '<i class="fab fa-sass"></i>',
    TailwindCSS: '<svg class="tech-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6C9.33 6 7.67 7.33 7 10C8 8.67 9.17 8.17 10.5 8.5C11.26 8.69 11.81 9.24 12.41 9.85C13.39 10.85 14.5 12 17 12C19.67 12 21.33 10.67 22 8C21 9.33 19.83 9.83 18.5 9.5C17.74 9.31 17.19 8.76 16.59 8.15C15.61 7.15 14.5 6 12 6M7 12C4.33 12 2.67 13.33 2 16C3 14.67 4.17 14.17 5.5 14.5C6.26 14.69 6.81 15.24 7.41 15.85C8.39 16.85 9.5 18 12 18C14.67 18 16.33 16.67 17 14C16 15.33 14.83 15.83 13.5 15.5C12.74 15.31 12.19 14.76 11.59 14.15C10.61 13.15 9.5 12 7 12Z"/></svg>',
    Python: '<i class="fab fa-python" style="color: #FFD43B;"></i>',
    Java: '<i class="fab fa-java"></i>',
    Scala: '<svg class="tech-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M4.589 4c4.537 0 13.81 1.516 14.821 3v2.957c-1.012-1.388-10.284-2.442-14.821-2.442V4zm0 5.714c4.537 0 13.81 1.516 14.821 3v2.957c-1.012-1.388-10.284-2.442-14.821-2.442V9.714zm0 5.714c4.537 0 13.81 1.516 14.821 3v2.957c-1.012-1.388-10.284-2.442-14.821-2.442v-3.515z"/></svg>',
    'C#': '<i class="fab fa-microsoft"></i>',
    MySQL: '<i class="fas fa-database"></i>',
    Unity: '<i class="fab fa-unity"></i>',
    Firebase: '<i class="fas fa-fire"></i>',
    IA: '<i class="fas fa-brain"></i>',
    Kotlin: '<svg class="tech-icon" viewBox="0 0 24 24"><path fill="#E44DD4" d="M2 2h20L12 12l-2-2-8-8zm0 20l8-8 2 2 10 6H2z"/></svg>',
    OutSystems: '<svg class="tech-icon" viewBox="0 0 24 24"><path fill="#FF3B2F" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
    Jupyter: '<i class="fab fa-python" style="color: #F37626;"></i>'
};

const projects = [
    {
        id: "portfolio",
        title: " Scriptown",
        description: "My personal website featuring a Pokémon-style demo game designed to introduce myself.                                                            Not yet supported on mobile.",
        technologies: ["HTML", "CSS", "JavaScript"],
        link: "https://bonviniv.github.io"
    },
    {
        id: "hangman",
        title: "Hangman Game",
        description: "A classic hangman game with a modern twist, featuring a real-time cloud-hosted battle royale-style multiplayer mode and API-powered word hint suggestions.",
        technologies: ["HTML", "JavaScript", "Firebase"],
        link: "hanging.html",
        repoUrl: "https://bonviniv.github.io/hanging.html"
    },
    {
        id: "stackhunt",
        title: "StackHunt",
        description: "Job search application for developers, featuring a custom bot for web scraping job boards and integration with public APIs to gather developer-focused job listings.",
        technologies: ["React", "TailwindCSS", "Python"],
        link: "stackhunt.html",
        repoUrl: "https://bonviniv.github.io/StackHunt.html"
    },
    {
        id: "tetris",
        title: "Tetris",
        description: "Classic Tetris game with modern features, including a cloud-hosted leaderboard and mobile-exclusive control modes: one emulating a classic Game Boy layout and another using modern touch gesture controls.",
        technologies: ["Angular", "TypeScript", "Firebase"],
        link: "tetris.html",
        repoUrl: "https://bonviniv.github.io/tetris.html"
    },
    {
        id: "github",
        title: "Other Projects in GitHub",
        description: "Check out my other projects with different technologies and approaches.",
        technologies: [
            "Java", "Scala", "C#", "MySQL", "Unity", "Firebase", "Kotlin", "OutSystems", "Jupyter",
            "HTML", "CSS", "JavaScript", "React", "TailwindCSS", 
            "Angular", "TypeScript", "SCSS", "Python"
        ],
        link: "https://github.com/Bonviniv"
    }
];

function createProjectCard(project) {
    const descriptionWithSpans = project.description
        .split(' ')
        .map(word => `<span>${word}</span>`)
        .join('&nbsp;');

    return `
        <div class="project-card" data-project="${project.id}">
            <h2 class="project-title">${project.title}</h2>
            <p class="project-description">${descriptionWithSpans}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `
                    <span class="tech-tag" data-tech="${tech}">
                        ${tech}
                        ${techIcons[tech] || ''}
                    </span>
                `).join('')}
            </div>
            <a href="${project.link}" class="project-link">View Project</a>
        </div>
    `;
}

function renderProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = projects.map(project => createProjectCard(project)).join('');
}

function createBackgroundIcons() {
    const icons = Object.values(techIcons);
    const columns = 200; // Increased from 20 to 200
    const iconsPerColumn = 8;
    const container = document.getElementById('background-icons');
    
    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.className = 'icon-column';
        
        for (let j = 0; j < iconsPerColumn; j++) {
            const iconWrapper = document.createElement('div');
            iconWrapper.innerHTML = icons[Math.floor(Math.random() * icons.length)];
            column.appendChild(iconWrapper);
        }
        
        container.appendChild(column);
    }
}
// Cursor animation logic
let isButtonCursor = false;
let isAnimating = false;

// Atualiza o cursor com uma sequência de imagens tipo animação
function updateCursor(frames) {
    if (isAnimating) return;
    isAnimating = true;

    let i = 0;
    const nextFrame = () => {
        if (i < frames.length) {
            document.body.style.cursor = `url('assets/${frames[i]}.png'), auto`;
            i++;
            setTimeout(nextFrame, 80); // 80ms entre frames
        } else {
            isAnimating = false;
        }
    };
    nextFrame();
}

document.addEventListener('mouseover', (e) => {
    const isClickable = e.target.closest('.project-card, .project-link, .tech-tag');
    if (isClickable && !isButtonCursor && !isAnimating) {
        isButtonCursor = true;
        document.body.style.cursor = "url('assets/cursor04.png'), auto";
    } else if (!isClickable && isButtonCursor && !isAnimating) {
        isButtonCursor = false;
        document.body.style.cursor = "url('assets/cursor01.png'), auto";
    }
});

document.addEventListener('mousedown', () => {
    if (isButtonCursor) {
        updateCursor(['cursor04', 'cursor05', 'cursor06', 'cursor04']);
    } else {
        updateCursor(['cursor01', 'cursor02', 'cursor03', 'cursor01']);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    createBackgroundIcons();
    document.body.style.cursor = "url('assets/cursor01.png'), auto";
});


