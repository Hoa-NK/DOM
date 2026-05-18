const btnChange = document.getElementById('btn-change');
const colorCodeText = document.getElementById('color-code');
const bodyElement = document.body;

function getRandomHexColor() {
    const letters = '0123456789abcdef';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

btnChange.addEventListener('click', function() {

    const newColor = getRandomHexColor();
    
    bodyElement.style.backgroundColor = newColor;
    
    colorCodeText.textContent = newColor;
});
