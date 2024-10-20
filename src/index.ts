import startGame from "./game";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

const angleInput = document.getElementById("angle") as HTMLInputElement;
const forceInput = document.getElementById("force") as HTMLInputElement;
const strikeButton = document.getElementById("strike") as HTMLButtonElement;

startGame(canvas, angleInput, forceInput, strikeButton)


document.getElementById('restart').addEventListener('click', () => {
    location.reload();
})