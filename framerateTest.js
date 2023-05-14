var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


canvas.width = 2000;
canvas.height = 1000;

var isMovingLeft = false;
var isMovingRight = false;


function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}


var x = 200;
var y = 400;

const fps = 60;
function animate() {
  // perform some animation task here
    ctx.clearRect(0,0, canvas.width, canvas.height);
    if(isMovingLeft == true) {
        x--;
    }

    else if(isMovingRight == true) {
        x++;
    }

    ctx.fillStyle = 'green'
    ctx.fillRect(x, y, 100, 100);
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps);
}
animate();








document.addEventListener('keydown', function(e) { //a키를 누르고 있을때 이벤트 발생 -> 왼쪽으로 이동 (보는 방향 전환)
    if (e.key === 'a') {
        isMovingLeft = true;
    }
})

document.addEventListener('keyup', function(e) { //a키를 누른상태에서 땠을때 발생
    if (e.key === 'a') {
        isMovingLeft = false;
    }
})

document.addEventListener('keydown', function(e) { //d키를 누르고 있을때 이벤트 발생 -> 오른쪽으로 이동 (보는 방향 전환)
    if (e.key === 'd') {
        isMovingRight = true;
    }
})

document.addEventListener('keyup', function(e) { //d키를 누른상태에서 땠을때 발생
    if (e.key === 'd') {
        isMovingRight = false;
    }
})