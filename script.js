const character = document.getElementById('character');

// Posições dos edifícios (coordenadas aproximadas)
const buildings = {
  building1: { x: 100, y: 200 },
  building2: { x: 300, y: 150 },
  lab: { x: 250, y: 50 }
};

document.getElementById('town-map').addEventListener('click', function(event) {
  const targetX = event.clientX;
  const targetY = event.clientY;

  // Lógica para mover o personagem
  moveCharacter(targetX, targetY);
});

function moveCharacter(x, y) {
  // Simples animação de movimento
  character.style.transition = 'all 1s';
  character.style.left = `${x}px`;
  character.style.top = `${y}px`;
}
