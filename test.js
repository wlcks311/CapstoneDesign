var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


canvas.width = 2000;
canvas.height = 1000;

createFillArray = function(len, n) {
    return new Array(len).fill(n);
}

collisonCheckX = createFillArray(canvas.width, -1); //캔버스의 가로 길이만큼의 x좌표계 생성. 기본 원소값은 전부 -1 -> 물체가 없는 상태
defaultArr_X = createFillArray(canvas.width, -1);    //물체가 생기면 해당 x좌표를 1로 바꿔줌.


//이미지 파일들

var img_Idle_full = new Image();
img_Idle_full.src = './img/Player_idle.png'

var img_Idle_full_left = new Image();
img_Idle_full_left.src = './img/Player_idle_left.png'

var img_Walking_full = new Image();
img_Walking_full.src = './img/Player_walking.png'

var img_Walking_full_left = new Image();
img_Walking_full_left.src = './img/Player_walking_left.png'

var img_Middle_Attack_full = new Image();
img_Middle_Attack_full.src = './img/Player_attack.png'

var img_Middle_Attack_full_left = new Image();
img_Middle_Attack_full_left.src = './img/Player_attack_left.png'

var img_Block = new Image();
img_Block.src = './img/Player_block.PNG'

var img_Block_left = new Image();
img_Block_left.src = './img/Player_block_left.png'

var img_BG_test = new Image();
img_BG_test.src = './img/BG_test.png'

var img_Player_health = new Image();
img_Player_health.src = './img/Player_healthBar.png'

var img_Zombie_health = new Image();
img_Zombie_health.src = './img/Zombie_healthBar.png'

var img_Player_attacked = new Image();
img_Player_attacked.src = './img/Player_attacked.png'

var img_Player_attacked_left = new Image();
img_Player_attacked_left.src = './img/Player_attacked_left.png'

var img_Zombie_idle = new Image();
img_Zombie_idle.src = './img/Zombie_idle.png'

var img_Zombie_idle_left = new Image();
img_Zombie_idle_left.src = './img/Zombie_idle_left.png'

var img_Zombie_attack = new Image();
img_Zombie_attack.src = './img/Zombie_attack.png'

var img_Zombie_attack_left = new Image();
img_Zombie_attack_left.src = './img/Zombie_attack_left.png'

var img_Zombie_walking = new Image();
img_Zombie_walking.src = './img/Zombie_walking.png'

var img_Zombie_walking_left = new Image();
img_Zombie_walking_left.src = './img/Zombie_walking_left.png'

var img_Zombie_stunned = new Image();
img_Zombie_stunned.src = './img/Zombie_stunned.png'

var img_Zombie_stunned_left = new Image();
img_Zombie_stunned_left.src = './img/Zombie_stunned_left.png'

//애니메이션 관련 변수

var isBGmovingRight = false;
var isBGmovingLeft = false;


var refreshRate = 10; // 주사율 -> ex) 20이면 20frame 마다 다음 장면으로 넘어감
var frameCount = 0;

var attackTimer = 0; // 공격 누적 시간 기록
var attackFrame = 0; //공격 장면 프레임 정보

// 등장 캐릭터의 속성부터 object자료에 정리해두면 좋다



class BackGround {
    constructor() {
        this.BG_length = 2000;
        this.BG_CanvasLength = canvas.height;
        this.BG_x = 0;
        this.BG_count = 4;
        this.BG_xMax = (this.BG_length * this.BG_count) - this.BG_length * (canvas.width / canvas.height);
        this.ratio = this.BG_length / canvas.height;
        this.isBGmovingRight = false;
        this.isBGmovingLeft = false;
         //주인공이 화면 끝까지 이동할 수 있는 경우는 오른쪽으로 가면서 BG_x == BG_xMax이거나, 왼쪽으로 가면서 BG_x == 0 인 경우. 그 이외에는 화면이 움직여야 함
    }
    draw() {
        ctx.drawImage(img_BG_test, this.BG_x, 0, this.BG_length * (canvas.width / canvas.height), this.BG_length, 0, 0, canvas.width, canvas.height);
    }
}

bg = new BackGround();


// 몹 기본 상위 클래스
class Creature {
    constructor(x, y, width, height, CanvasLength) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.CanvasLength = CanvasLength;
        this.attackBox = {
            position_x : this.x + this.CanvasLength / 2,
            position_y : this.y - 50,
            width: 80,
            height: 50,
            atkTimer: 0
        }
        //각 동작의 총 컷 수
        this.idleLoop = 0;
        this.walkingLoop = 0;
        this.attackLoop = 0;

        //각 동작의 현재 몇 번째 컷인지 알려주는 정보
        this.idleCut = 0;
        this.walkingCut = 0;
        this.attackCut = 0;

        //각 동작의 현재 몇 번째 프레임인지 알려주는 정보
        this.idleCount = 0;
        this.walkingCount = 0;
        this.attackCount = 0;

        // 보고 있는 방향
        this.isLookingRight = true;

        // 공격하고 있는지 여부
        this.isAttacking = false;
        this.isAttacking_motion = false;

        //움직이고 있는지 여부
        this.isMoving = false;
        this.isMovingRight = false;
        this.isMovingLeft = false;

        //맞았는지 여부
        this.isDamaged = false;
        this.damagedCount = 0;

        //체력
        this.healthMax = 3;
        this.healthCount = this.healthMax;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    setCanvasSize(CanvasLength) {
        this.CanvasLength = CanvasLength;
    }

    setAttackBoxSize(width, height) {
        this.attackBox.width = width;
        this.attackBox.height = height;
    }

    setLoops(idleLoop, walkingLoop, attackLoop) {
        this.idleLoop = idleLoop;
        this.walkingLoop = walkingLoop;
        this.attackLoop = attackLoop;
    }

    setCounts(idleCount, walkingCount, attackCount) {
        this.idleCount = idleCount;
        this.walkingCount = walkingCount;
        this.attackCount = attackCount;
    }
}

class MainCharacter extends Creature {
    constructor(x, y, width, height, CanvasLength) {
        super(x, y, width, height, CanvasLength);
        this.isBlocking = false;
        this.BlockBox = {
            x_right : this.x + this.CanvasLength - 70,
            x_left : this.x + 30,
            y : this.y + 60,
            width : 40,
            height : 70
        }
    }
    updateBlockBox(x_right, x_left, y) {
        this.BlockBox.x_right = x_right;
        this.BlockBox.x_left = x_left;
        this.BlockBox.y = y;
    }

    attack() {
        if (this.isLookingRight == true) {
            if (attackFrame < 30 && (this.attackCount <= 1)) {
                attackFrame+=6;
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if (attackFrame < 30 && (this.attackCount == 2)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount <= 4)) {
                attackFrame+=5
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount == 5)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if(attackFrame == 30) {
                attackFrame = 0;
                if (this.attackCount == this.attackLoop - 1) {
                    this.attackCount = 0;
                    this.isAttacking_motion = false; //공격 동작 종료
                }

                else {
                    this.attackCount++;
                }
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
        }

        else if (this.isLookingRight == false) {
            if (attackFrame < 30 && (this.attackCount <= 1)) {
                attackFrame+=6;
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if (attackFrame < 30 && (this.attackCount == 2)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount <= 4)) {
                attackFrame+=5
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount == 5)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if(attackFrame == 30) {
                attackFrame = 0;
                if (this.attackCount == this.attackLoop - 1) {
                    this.attackCount = 0;
                    this.isAttacking_motion = false; //공격 동작 종료
                }

                else {
                    this.attackCount++;
                }
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
        }
    }

    draw() {
        this.updateBlockBox(this.x + this.CanvasLength - 70, this.x + 30, this.y + 60); //플레이어의 움직임에 따라 해당 좌표를 방어 상자에 갱신

        if (this.isAttacking_motion == true) { //공격 하는 경우 -> 움직일 수 없음
            this.attack()
        }

        //플레이어가 몬스터에게 맞은 경우 -> 맞은 모션
        else if(this.isDamaged == true) {
            if (this.isLookingRight == true) { //오른쪽을 보고있다가 맞은 경우
                if (this.damagedCount < 60) {
                    this.damagedCount++;
                    if (this.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
                else if (this.damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    this.isDamaged = false;
                    this.damagedCount = 0;
                }
            }

            else if(this.isLookingRight == false) { //왼쪽을 보고 있다가 맞은 경우
                if (this.damagedCount < 60) {
                    this.damagedCount++;
                    if (this.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked_left, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked_left, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
                else if (this.damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked_left, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    this.isDamaged = false;
                    this.damagedCount = 0;
                }
            }
        }

        // 공격중이 아닌 경우
        else {
            if (this.isBlocking == true) {
                ctx.fillStyle = 'blue';
                if(this.isLookingRight == true) { //오른쪽 보고있는 경우 -> 오른쪽 방어
                    ctx.drawImage(img_Block, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    ctx.fillRect(this.BlockBox.x_right, this.BlockBox.y, this.BlockBox.width, this.BlockBox.height);
                }

                else if (this.isLookingRight == false) { //왼쪽 보고있는 경우 -> 왼쪽 방어
                    ctx.drawImage(img_Block_left, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    ctx.fillRect(this.BlockBox.x_left, this.BlockBox.y, this.BlockBox.width, this.BlockBox.height);
                }
            }

            else if (this.isMoving == true) { //걷는 경우
                if (this.isLookingRight == true) { //오른쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Walking_full, this.width * this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.walkingCount == this.walkingLoop - 1) {
                            this.walkingCount = 0;
                        }
                        else {
                            this.walkingCount++;
                        }
                        ctx.drawImage(img_Walking_full, this.width * this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
        
                else { // 왼쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Walking_full_left, this.width *this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.walkingCount == this.walkingLoop - 1) {
                            this.walkingCount = 0;
                        }
                        else {
                            this.walkingCount++;
                        }
                        ctx.drawImage(img_Walking_full_left, this.width *this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
            }
    
            else { // 가만히 서 있는 경우
                if (this.isLookingRight == true) { //오른쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Idle_full, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.idleCount == this.idleLoop - 1) {
                            this.idleCount = 0;
                        }
                        else {
                            this.idleCount++;
                        }
                        ctx.drawImage(img_Idle_full, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
        
                else { // 왼쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Idle_full_left, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.idleCount == this.idleLoop - 1) {
                            this.idleCount = 0;
                        }
                        else {
                            this.idleCount++;
                        }
                        ctx.drawImage(img_Idle_full_left, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
            }

        }

        
    }

}

p1 = new MainCharacter(500, 350, 500, 500, 200);
p1.setLoops(4, 8, 6);

class Obstacle { //장애물 클래스
    constructor() {
        this.x = 900;
        this.y = 400;//등장하는 위치
        this.width = 50;
        this.height = 150;
        this.color = 'red'
        this.isDead = false; // 체력이 0이되면 isDead -> true
        this.healthBar = {
            color : 'yellow',
            position_x : this.x,
            position_y : this.y - 20,
            width : this.width,
            height : 10,
            healthFullCount : 3, //총 체력
            healthCurrentCount : 3 //현재 체력
        }
    }
    
    draw() {


        if (this.healthBar.healthCurrentCount == 0) {
            this.isDead = true;
        }
        //물체가 생성될때 충돌 여부를 확인할 수 있게 '이 x좌표에 오면 충돌한걸로 알리겠다' 라는 의미
        
        var i;
        if (this.isDead == true) { //죽으면 좌표계에 없는걸로 취급
            for (i = 0; i < this.width; i++) {
                collisonCheckX[this.x + i] = -1;
            }
        }
        else {
            for (i = 0; i < this.width; i++) {
                collisonCheckX[this.x + i] = 1;
            }
        }

        ctx.fillStyle = this.healthBar.color;
        if(this.healthBar.healthCurrentCount > 0) {
            ctx.fillRect(this.x, this.y - 20, this.healthBar.width * (this.healthBar.healthCurrentCount / this.healthBar.healthFullCount), this.healthBar.height);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

    } //만약 물체도 움직이는 경우도 해결 해야함
    checkAttacked(atkTimer) {//공격이 해당 물체에 가해졌는지 확인
        if ((collisonCheckX[atkTimer] == 1) && (this.x <= atkTimer && atkTimer <= this.x + this.width)) {
            this.healthBar.healthCurrentCount--;
        }

    }
}


class NormalZombie extends Creature { //좀비 클래스
    constructor(x, y, width, height, CanvasLength) {
        super(x, y, width, height, CanvasLength);
        this.move_range = 100; // 몹이 무작위로 움직이는 최대 범위
        this.move_randNum = 0; // 몹이 무작위로 움직이는 범위
        this.moveCount = 0;
        this.speed = 1;        // 몹 움직이는 속도
        this.xMax_left = 0;
        this.xMax_right = 0;
        this.x_detectLeft = this.x - 150; //몹이 왼쪽에서 플레이어를 감지 할 수 있는 범위
        this.x_detectRight = this.x + this.CanvasLength + 150; //몹이 오른쪽에서 플레이어를 감지 할 수 있는 범위
        this.x_attackLeft = this.x + 30; //몹이 왼쪽에서 플레이어를 공격 할 수 있는 범위
        this.x_attackRight = this.x + this.CanvasLength - 30; 
        this.isMovingDone = true;
        this.isDead = false;
        this.color = 'green';
        this.attackBox.width = 100;
        this.isStunned = false;
        this.stunCount = 0;
        this.stunAnimaitonCount = 0;
        this.stunLoop = 0;
        this.waitCount = 0;
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

    setStunLoop(stunLoop) {
        this.stunLoop = stunLoop;
    }

    draw() {
        //몬스터의 체력을 표시하는 사진
        ctx
        ctx.drawImage(img_Zombie_health, this.width * (this.healthMax - this.healthCount), 0, this.width, this.height, this.x, this.y - 40, this.CanvasLength, this.CanvasLength);
        //이동하고있는 중이 아닌 경우
        if (this.isMoving == false) { 
            if (this.isStunned == true) {//공격이 막혀 스턴 상태일 경우 스턴 2초 (120) 3컷
                if (this.isLookingRight == true) {//오른쪽
                    if (this.stunCount % 40 < 39) {
                        ctx.drawImage(img_Zombie_stunned, this.width * this.stunAnimaitonCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.stunCount % 40 == 39) {
                        this.stunAnimaitonCount++;
                        this.stunAnimaitonCount = this.stunAnimaitonCount % this.stunLoop;
                        ctx.drawImage(img_Zombie_stunned, this.width * this.stunAnimaitonCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }

                else { //왼쪽
                    if (this.stunCount % 40 < 39) {
                        ctx.drawImage(img_Zombie_stunned_left, this.width * this.stunAnimaitonCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.stunCount % 40 == 39) {
                        this.stunAnimaitonCount++;
                        this.stunAnimaitonCount = this.stunAnimaitonCount % this.stunLoop;
                        ctx.drawImage(img_Zombie_stunned_left, this.width * this.stunAnimaitonCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
            }

             // 텀이 끝나고 공격하고 있는 중인경우
            else if (this.isAttacking == true && this.waitCount == 30) {
                if (this.isLookingRight == true) { // 오른쪽
                    if (this.attackCount < 10) {
                        ctx.drawImage(img_Zombie_attack, this.width * 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount < 20) {
                        ctx.drawImage(img_Zombie_attack, this.width * 1, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount < 40) {
                        ctx.drawImage(img_Zombie_attack, this.width * 2, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount < 50) {
                        ctx.drawImage(img_Zombie_attack, this.width * 3, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount == 50) {
                        ctx.drawImage(img_Zombie_attack, this.width * 3, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                        this.attackCount = 0;
                    }
                    this.attackCount++;
                }
                else { //왼쪽
                    if (this.attackCount < 10) {
                        ctx.drawImage(img_Zombie_attack_left, this.width * 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount < 20) {
                        ctx.drawImage(img_Zombie_attack_left, this.width * 1, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount < 40) {
                        ctx.drawImage(img_Zombie_attack_left, this.width * 2, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount < 50) {
                        ctx.drawImage(img_Zombie_attack_left, this.width * 3, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if (this.attackCount == 50) {
                        ctx.drawImage(img_Zombie_attack_left, this.width * 3, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                        this.attackCount = 0;
                    }
                    this.attackCount++;

                }
            }

            //가만히 숨쉬는 경우
            else {
                if (this.isLookingRight == true) {//오른쪽
                    if (this.idleCount < 30) {
                        ctx.drawImage(img_Zombie_idle, this.width * this.idleCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if(this.idleCount == 30) {
                        this.idleCount = 0;
                        this.idleCut++;
                        this.idleCut = this.idleCut % this.idleLoop;
                        ctx.drawImage(img_Zombie_idle, this.width * this.idleCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    this.idleCount++;
                }
                else { //왼쪽
                    if (this.idleCount < 30) {
                        ctx.drawImage(img_Zombie_idle_left, this.width * this.idleCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else if(this.idleCount == 30) {
                        this.idleCount = 0;
                        this.idleCut++;
                        this.idleCut = this.idleCut % this.idleLoop;
                        ctx.drawImage(img_Zombie_idle_left, this.width * this.idleCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    this.idleCount++;
                }
            }
        }

        //움직이는 경우
        else { 
            if (this.isLookingRight == true) {//오른쪽
                if (this.walkingCount < 30) {
                    ctx.drawImage(img_Zombie_walking, this.width * this.walkingCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                }
                else if(this.walkingCount == 30) {
                    this.walkingCount = 0;
                    this.walkingCut++;
                    this.walkingCut = this.walkingCut % this.walkingLoop;
                    ctx.drawImage(img_Zombie_walking, this.width * this.walkingCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                }
                this.walkingCount++;
            }
            else { //왼쪽
                if (this.walkingCount < 30) {
                    ctx.drawImage(img_Zombie_walking_left, this.width * this.walkingCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                }
                else if(this.walkingCount == 30) {
                    this.walkingCount = 0;
                    this.walkingCut++;
                    this.walkingCut = this.walkingCut % this.walkingLoop;
                    ctx.drawImage(img_Zombie_walking_left, this.width * this.walkingCut, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                }
                this.walkingCount++;
            }
        }
        
    }

    comeBackToPosition() {
        console.log('come back to position');
        this.isMoving = true;
        if(this.x < (this.xMax_left + this.xMax_right) / 2) { //왼쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.isLookingRight = true;
                collisonCheckX[this.x + 50] = -1;
                collisonCheckX[this.x + this.CanvasLength - 49] = 1;
                this.x++;
            }
        }
        else if ((this.xMax_left + this.xMax_right) / 2 < this.x) {  // 오른쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.isLookingRight = false;
                collisonCheckX[this.x + 49] = 1;
                collisonCheckX[this.x + this.CanvasLength - 50] = -1;
                this.x--;
            }
        }
    }

    stun() {
        this.isMoving = false;
        if (this.stunCount < 120) {
            this.stunCount++;
        }
        else {
            this.isStunned = false;
            this.stunCount = 0;
        }
    }

    attack() {
        this.isMoving = false;
        ctx.fillStyle = 'red';
        console.log('attack');

        if (this.isLookingRight == true) { // 오른쪽 보고있는 경우
            if (this.attackBox.atkTimer <= this.attackBox.width) { //오른쪽 공격 진행중. 공격범위 -> 100, 프레임당 2. 50프레임 소모
                //공격 상자 늘리기 전에 플레이어의 방어 확인
                if (p1.isBlocking == true && (this.attackBox.position_x + this.attackBox.atkTimer + 1) >= p1.BlockBox.x_left) { 
                    // 플레이어의 왼쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                else {
                    if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                        this.waitCount++;
                    }

                    else if (this.waitCount == 30) {
                        this.attackBox.atkTimer+=2;
                    }


                    if (collisonCheckX[this.attackBox.position_x + this.attackBox.atkTimer] == 0) { //공격이 플레이어에게 닿은 경우
                        p1.isDamaged = true;
                    }
                    ctx.fillRect(this.attackBox.position_x, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
                }
            }

            else { //공격 종료
                if (p1.isDamaged == true) { //플레이어가 해당 몬스터의 공격을 받았을 경우
                    p1.healthCount--;
                }

                //몬스터 공격 정보 초기화
                this.waitCount = 0;
                this.attackBox.atkTimer = 0;
                this.isAttacking = false;
            }
        }

        else { //왼쪽을 보고 있는 경우
            if (this.attackBox.atkTimer <= this.attackBox.width) { //왼쪽 공격 진행중
                //공격 상자 늘리기 전에 플레이어의 방어 확인
                if (p1.isBlocking == true && (this.attackBox.position_x - this.attackBox.atkTimer - 1) <= p1.BlockBox.x_right) {
                    // 플레이어의 오른쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                else {
                    if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                        this.waitCount++;
                    }

                    else if (this.waitCount == 30) {
                        this.attackBox.atkTimer+=2;
                    }
                    
                    if (collisonCheckX[this.attackBox.position_x - this.attackBox.atkTimer] == 0) {//공격이 플레이어에게 닿은 경우
                        p1.isDamaged = true;
                    }
                    ctx.fillRect(this.attackBox.position_x - this.attackBox.atkTimer, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
                }
            }

            else { //공격 종료
                if (p1.isDamaged == true) { //플레이어가 해당 몬스터의 공격을 받았을 경우
                    p1.healthCount--;
                }

                //몬스터 공격 정보 초기화
                this.waitCount = 0;
                this.attackBox.atkTimer = 0;
                this.isAttacking = false;
            }
        }
    }

    move(p1_x_left, p1_x_right) {

        //몹의 공격 범위 갱신
        this.x_detectLeft = this.x - 150;
        this.x_detectRight = this.x + this.CanvasLength + 150;

        this.x_attackLeft = this.x + 30;
        this.x_attackRight = this.x + this.CanvasLength - 30;

        this.attackBox.position_x = this.x + this.CanvasLength / 2;

        if (this.isDead == false) { // 몹이 살아있으면 움직임
            for (var i = 0; i <= this.CanvasLength - 100; i++) {
                collisonCheckX[this.x + 50 + i] = 1;
            }

            if (this.isAttacking == true) { // 공격중인 경우
                this.attack();
            }

            else if (this.isStunned == true) { //공격이 막혀 잠시 스턴에 걸린 경우
                this.stun();
            }
             // 플레이어가 탐지 범위 안에 들어온 경우
            else if((this.x_detectLeft <= p1_x_right && p1_x_right < this.x + 50) || (this.x + this.CanvasLength - 50 < p1_x_left && p1_x_left <= this.x_detectRight)) { 
                //플레이어가 공격 범위 안에 들어온 경우
                if ((this.x_attackLeft < p1_x_right && p1_x_right < this.x + 50) || (this.x + this.CanvasLength - 50 < p1_x_left && p1_x_left < this.x_attackRight)) {
                    this.isAttacking = true;
                }

                else { //탐지 범위 안에 들어왔지만 공격 범위는 아닌 경우 -> 플레이어 따라가기
                    if (this.x_detectLeft < p1_x_right && p1_x_right < this.x + 50) { //왼쪽으로 이동
                        this.isMoving = true;
                        this.isLookingRight = false;
                        collisonCheckX[this.x + 49] = 1;
                        collisonCheckX[this.x + this.CanvasLength - 50] = -1;
                        this.x--;
                    }

                    else if (this.x + this.CanvasLength - 50 < p1_x_left && p1_x_left <= this.x_detectRight) { //오른쪽으로 이동
                        this.isMoving = true;
                        this.isLookingRight = true;
                        collisonCheckX[this.x + 50] = -1;
                        collisonCheckX[this.x + this.CanvasLength - 49] = 1;
                        this.x++;
                    }
                }
            }

            else if((this.x + 50 < this.xMax_left) || (this.xMax_right < this.x + this.CanvasLength - 40)) {//지정된 구역을 벗어난 경우
                this.comeBackToPosition();
            }

            else { // 탐지가 된것도 아니고, 지정된 구역을 벗어난 경우도 아닌 경우 -> 일반 무작위 움직임
                if (this.isMovingDone == true) { // 움직임이 끝난 상태일 때
                    if (this.moveCount < 90) {// 1.5초 동안 잠시 멈췄다가
                        this.isMoving = false;
                        this.moveCount++;
                    }
                    
                    else { // 다시 움직임 재개
                        this.moveCount = 0;
                        this.move_randNum = Math.floor(Math.random() * this.move_range);
                        // floor -> 정수로 반올림, random -> 0~1사이 난수 발생 여기선 move_range만큼 곱해줌
            
                        this.isMovingDone = false;
                        console.log('move again');
                    }
        
                }
        
                else { //움직임이 끝나지 않았을 때
                    if (this.move_randNum <= 10 && this.moveCount < this.move_randNum) { //난수가 일정 수보다 작으면 가만히 서 있는 걸로
                        this.isMoving = false;
                        this.moveCount+=this.speed;
                        console.log('small number');
                    }
        
                    else { //움직이는 경우

                        if ((this.move_randNum % 2 == 0) && this.moveCount < this.move_randNum) { //짝수인 경우 -> 오른쪽으로 이동
                            if (this.x + this.CanvasLength + this.speed <= this.xMax_right) { //고정 범위 안에 있는 경우
                                this.isMoving = true;
                                collisonCheckX[this.x + 50] = -1;
                                collisonCheckX[this.x + this.CanvasLength -49] = 1;
                                this.isLookingRight = true;
                                this.x+=this.speed;
                                this.moveCount+=this.speed;
                                console.log('is moving');
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.isMoving = false;
                                this.isMovingDone = true;
                                console.log('is moving done edge');
                            }
        
                        }
                        else if ((this.move_randNum % 2 == 1) && this.moveCount < this.move_randNum) {//홀수인 경우 -> 왼쪽으로 이동
                            console.log(this.x - this.speed);
                            if (this.x - this.speed >= this.xMax_left) { //고정 범위 안에 있는 경우
                                this.isMoving = true;
                                collisonCheckX[this.x + 49] = 1;
                                collisonCheckX[this.x + this.CanvasLength - 50] = -1;
                                this.isLookingRight = false;
                                this.x-=this.speed;
                                this.moveCount+=this.speed;
                                console.log('is moving left');
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.isMoving = false;
                                this.isMovingDone = true;
                                console.log('is moving done edge');
                            }
                        }
        
                        else if (this.moveCount >= this.move_randNum) {
                            this.isMoving = false;
                            this.isMovingDone = true;
                            this.moveCount = 0;
                        }
                    }
                }
            }
        }

        else if (this.isDead == true) { //몹이 죽었을 경우
            for (i = 0; i <= this.width; i++) {
                collisonCheckX[this.x + i] = -1;
            }
        }
    }

    checkAttacked(atkTimer) {//공격이 해당 물체에 가해졌는지 확인
        if ((collisonCheckX[atkTimer] == 1) && (this.x <= atkTimer && atkTimer <= this.x + this.CanvasLength)) {
            this.healthCount--;
            if (this.healthCount == 0) {
                console.log('nz1 dead');
                this.isDead = true;
            }
        }

    }
}

nz1 = new NormalZombie(200, 350, 500, 500, 200);

var obstacle = new Obstacle();

// var obstacle2 = new Obstacle();
// obstacle2.x = 200;
// obstacle2.color = 'blue';

nz1.setFixedRange(150, 500);
nz1.setStunLoop(3);
nz1.setLoops(6, 7, 4);

var obstacle3 = new Obstacle();
obstacle3.x = 1100;

var obstacle4 = new Obstacle();
obstacle4.x = 1400;



// 애니메이션 함수 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


const fps = 60;
function animate() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  isBGmovingRight = false;
  isBGmovingLeft = false;
//  bg.draw()

  for (var i = 0; i <= p1.CanvasLength - 80; i++) { //플레이어가 서 있는 곳은 0 으로 표시
    collisonCheckX[p1.x + 40 + i] = 0;
}

  //충돌이 없는 경우에만 주인공의 x, y좌표 갱신
  ctx.fillStyle = 'gray';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 550, canvas.width, 250);

  ctx.fillStyle = 'red';
  ctx.fillRect(150, 550, 5, 100);
  ctx.fillRect(500, 550, 5, 100);

  ctx.fillRect(nz1.x_attackLeft, 550, 5, 40);
  ctx.fillRect(nz1.x_attackRight, 550, 5, 40);

  ctx.fillStyle = 'blue';
  ctx.fillRect(p1.x + 40, 550 , 5, 50);
  ctx.fillRect(p1.x + p1.CanvasLength - 40, 550 , 5, 50);

  ctx.fillStyle = 'yellow'
  ctx.fillRect(nz1.x_detectLeft, 550, 5, 40);
  ctx.fillRect(nz1.x_detectRight, 550, 5, 40);

  ctx.fillRect(nz1.x + 50, 550, 5, 40);
  ctx.fillRect(nz1.x + nz1.CanvasLength - 50, 550, 5, 40);

  ctx.drawImage(img_Player_health, (p1.healthMax - p1.healthCount) * 500, 0, 500, 500, 10, 15, 300, 300);

  //좌표계를 이용해 충돌 확인 
  if ((p1.isMovingLeft == true && collisonCheckX[p1.x + 38] == -1) && (p1.isAttacking == false && p1.isBlocking == false && p1.isDamaged == false)) { //왼쪽 충돌 여부 확인 후 왼쪽으로 이동
      if ((p1.x <= 300) && bg.BG_x > 0) { //배경화면 오른쪽으로 이동하는 경우 (캐릭터가 왼쪽으로 이동)
          bg.isBGmovingRight = true;
          bg.BG_x-=bg.ratio * 2;
          obstacle.x+=2;
          //obstacle2.x+=2;
          obstacle3.x+=2;
          obstacle4.x+=2;
          //캐릭터가 왼쪽으로 이동(실제론 가만히 있음)하므로 물체들이 오른쪽으로 이동해야함
      }

      else if (p1.x > 0) { //플레이어가 이동하면서 위치 정보 갱신 (왼쪽으로 이동)
          collisonCheckX[p1.x + 38] = 0;
          collisonCheckX[p1.x + 39] = 0;
          collisonCheckX[p1.x + p1.CanvasLength - 40] = -1;
          collisonCheckX[p1.x + p1.CanvasLength - 41] = -1;
          p1.x-=2;
          p1.attackBox.position_x-=2;
      }
  }
  

  if ((p1.isMovingRight == true && collisonCheckX[p1.x + p1.CanvasLength - 38] == -1) && (p1.isAttacking == false && p1.isBlocking == false && p1.isDamaged == false)) { //오른쪽 충돌 여부 확인 후 오른쪽으로 이동
      if (((p1.x + p1.CanvasLength) >= 1700) && bg.BG_x < bg.BG_xMax) { //배경화면 왼쪽으로 이동하는 경우 (캐릭터가 오른쪽으로 이동)
          bg.isBGmovingLeft = true;
          bg.BG_x+=bg.ratio * 2;
          obstacle.x-=2;
          //obstacle2.x-=2;
          obstacle3.x-=2;
          obstacle4.x-=2;
      }

      else { //플레이어가 이동하면서 위치 정보 갱신 (오른쪽으로 이동)
        collisonCheckX[p1.x + 40] = -1;
        collisonCheckX[p1.x + 41] = -1;
        collisonCheckX[p1.x + p1.CanvasLength - 39] = 0;
        collisonCheckX[p1.x + p1.CanvasLength - 38] = 0;
        p1.x+=2;
        p1.attackBox.position_x+=2;
      }

  }
  
  //공격 중인 경우
  if (p1.isAttacking == true) {
       //오른쪽 공격인 경우
      if(p1.isLookingRight == true) {
          if(attackTimer >= p1.attackBox.width) {
              obstacle.checkAttacked(p1.attackBox.position_x + p1.attackBox.width);
              //obstacle2.checkAttacked(p1.attackBox.position_x + p1.attackBox.width);
              obstacle3.checkAttacked(p1.attackBox.position_x + p1.attackBox.width);
              obstacle4.checkAttacked(p1.attackBox.position_x + p1.attackBox.width);
              nz1.checkAttacked(p1.attackBox.position_x + p1.attackBox.width);
              p1.isAttacking = false;
              attackTimer = 0;
          }
          else { 
              ctx.fillStyle = 'green';
              ctx.fillRect(p1.attackBox.position_x, p1.attackBox.position_y, attackTimer, p1.attackBox.height);
              attackTimer+=2;
          }
          
      }
      //왼쪽 공격인 경우
      else if(p1.isLookingRight == false) {
          if(attackTimer >= p1.attackBox.width) {
              obstacle.checkAttacked(p1.attackBox.position_x - p1.attackBox.width);
              //obstacle2.checkAttacked(p1.attackBox.position_x - p1.attackBox.width);
              obstacle3.checkAttacked(p1.attackBox.position_x - p1.attackBox.width);
              obstacle4.checkAttacked(p1.attackBox.position_x - p1.attackBox.width);
              nz1.checkAttacked(p1.attackBox.position_x - p1.attackBox.width);
              p1.isAttacking = false;
              attackTimer = 0;
          }
          else {
              ctx.fillStyle = 'green';
              ctx.fillRect(p1.attackBox.position_x - attackTimer, p1.attackBox.position_y, attackTimer, p1.attackBox.height);
              attackTimer+=2;
          }
      }
  }

  obstacle.draw()
  //obstacle2.draw()
  nz1.draw()
  nz1.move(p1.x + 40, p1.x + p1.CanvasLength - 40)
  obstacle3.draw()
  obstacle4.draw()
  p1.draw()



    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps); // 60분의 1초 당 애니메이션 함수 호출 -> 초당 60프레임
}
animate();


//이벤트 리스너들

// document.addEventListener('keydown', function(e) { //w키를 누르고 있을때 이벤트 발생 -> 위로 이동
//     if (e.key === 'w') {
//         movingUp = true;
//         isMoving = true;
//     }
// })

// document.addEventListener('keyup', function(e) { //w키를 누른상태에서 땠을때 발생
//     if (e.key === 'w') {
//         movingUp = false;
//         isMoving = false;
//     }
// })

// document.addEventListener('keydown', function(e) { //s키를 누르고 있을때 이벤트 발생 -> 아래로 이동
//     if (e.key === 's') {
//         movingDown = true;
//         isMoving = true;
//     }
// })

// document.addEventListener('keyup', function(e) { //s키를 누른상태에서 땠을때 발생
//     if (e.key === 's') {
//         movingDown = false;
//         isMoving = false;
//     }
// })

document.addEventListener('keydown', function(e) { //a키를 누르고 있을때 이벤트 발생 -> 왼쪽으로 이동 (보는 방향 전환)
    if (e.key === 'a' && (p1.isDamaged == false && p1.isAttacking == false && p1.isBlocking == false)) {
        p1.isMovingLeft = true;
        p1.isLookingRight = false;
        p1.isMoving = true;
    }
})

document.addEventListener('keyup', function(e) { //a키를 누른상태에서 땠을때 발생
    if (e.key === 'a') {
        p1.isMovingLeft = false;
        p1.isMoving = false;
    }
})

document.addEventListener('keydown', function(e) { //d키를 누르고 있을때 이벤트 발생 -> 오른쪽으로 이동 (보는 방향 전환)
    if (e.key === 'd' && (p1.isDamaged == false && p1.isAttacking == false && p1.isBlocking == false)) {
        p1.isMovingRight = true;
        p1.isLookingRight = true;
        p1.isMoving = true;
    }
})

document.addEventListener('keyup', function(e) { //d키를 누른상태에서 땠을때 발생
    if (e.key === 'd') {
        p1.isMovingRight = false;
        p1.isMoving = false;
    }
})

document.addEventListener('keydown', function(e) { //f키를 누를시 발생
    if (e.key === 'f') {
        p1.isAttacking = true;
        p1.isAttacking_motion = true;
    }
})

document.addEventListener('keydown', function(e) { //r키를 누르고 있을때 이벤트 발생 -> 방어동작
    if (e.key === 'r' && (p1.isDamaged == false)) {
        p1.isBlocking = true;
    }
})

document.addEventListener('keyup', function(e) { //r키를 누른상태에서 땠을때 발생 -> 방어동작 해제
    if (e.key === 'r') {
        p1.isBlocking = false;
    }
})