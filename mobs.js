var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

class NormalZombie {
    constructor() {
        this.img_length = 0;   // 스프라이트 이미지 한컷의 길이
        this.cvs_length = 150; // 실제 캔버스에 그릴 길이
        this.x = 0;
        this.y = 0;
        this.move_range = 100; // 몹이 무작위로 움직이는 최대 범위
        this.move_randNum = 0; // 몹이 무작위로 움직이는 범위
        this.moveCount = 0;
        this.speed = 1;        // 몹 움직이는 속도
        this.xMax_left = 0;
        this.xMax_right = 0;
        this.isMoving = false;
        this.isMovingDone = true;
        this.healthBar = {
            color : 'yellow',
            width : this.cvs_length,
            height : 10,
            healthFullCount : 3, //총 체력
            healthCurrentCount : 3 //현재 체력
        }
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    setFixedRange(xMax_left, xMax_right) {
        this.xMax_left = xMax_left;
        this.xMax_right = xMax_right;
    }
    setMoveRange(move_range) {
        this.move_range = move_range;
    }
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.cvs_length, this.cvs_length);
    }
    move() {
        
        this.isMoving = true;
        
        if (this.isMovingDone == true) { // 움직임이 끝난 상태일 때
            this.move_randNum = Math.floor(Math.random() * this.move_range);
            // floor -> 정수로 반올림, random -> 0~1사이 난수 발생 여기선 move_range만큼 곱해줌
            this.moveCount = 0;
        }

        else { //움직임이 끝나지 않았을 때
            if (this.move_randNum <= 15) { //난수가 일정 수보다 작으면 가만히 서 있는 걸로
                this.isMoving = false;
                this.moveCount+=this.speed;
            }

            else { //움직이는 경우
                if ((this.move_randNum % 2 == 0) && this.moveCount < this.move_randNum) { //짝수인 경우 -> 오른쪽으로 이동
                    this.x+=this.speed;
                    this.moveCount+=this.speed;
                }
                else if (this.moveCount < this.move_randNum) {//홀수인 경우 -> 왼쪽으로 이동
                    this.x-=this.speed;
                    this.moveCount+=this.speed;
                }

                else if (this.moveCount == this.move_randNum) {
                    this.isMovingDone == true;
                }
            }
        }
    }
}

nz1 = new NormalZombie();

//export { nz1 }