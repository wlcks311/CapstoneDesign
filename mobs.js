class NormalZombie {
    constructor() {
        this.img_length = 0;   // 스프라이트 이미지 한컷의 길이
        this.cvs_length = 150; // 실제 캔버스에 그릴 길이
        this.x = 0;
        this.y = 0;
        this.move_range = 100; // 몹이 무작위로 움직이는 범위 
        this.speed = 1;        // 몹 움직이는 속도
        this.xMax_left = 0;
        this.xMax_right = 0;
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
}