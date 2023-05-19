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
img_Idle_full.src = 'Player_idle.png'

var img_Idle_full_left = new Image();
img_Idle_full_left.src = 'Player_idle_left.png'

var img_Walking_full = new Image();
img_Walking_full.src = 'Player_walking.png'

var img_Walking_full_left = new Image();
img_Walking_full_left.src = 'Player_walking_left.png'

var img_Middle_Attack_full = new Image();
img_Middle_Attack_full.src = 'Player_attack.png'

var img_Middle_Attack_full_left = new Image();
img_Middle_Attack_full_left.src = 'Player_attack_left.png'

var img_Block = new Image();
img_Block.src = 'Player_block.PNG'

var img_Block_left = new Image();
img_Block_left.src = 'Player_block_left.png'

var img_BG_test = new Image();
img_BG_test.src = 'BG_test.png'

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
            x_right : this.x + this.CanvasLength - 20,
            x_left : this.x + 20,
            y : this.y + 40,
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
        this.updateBlockBox(this.x + this.CanvasLength - 30, this.x + 30, this.y + 40); //플레이어의 움직임에 따라 해당 좌표를 방어 상자에 갱신
        if (this.isAttacking_motion == true) { //공격 하는 경우 -> 움직일 수 없음
            this.attack()
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

p1 = new MainCharacter(400, 350, 500, 500, 200);
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


class NormalZombie extends Creature {
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
        this.x_attackLeft = this.x - 50; //몹이 왼쪽에서 플레이어를 공격 할 수 있는 범위
        this.x_attackRight = this.x + this.CanvasLength + 50; 
        this.isMovingDone = true;
        this.isDead = false;
        this.color = 'green';
        this.attackBox.width = 160;
        this.isStunned = false;
        this.stunCount = 0;
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
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, 550, 5, 30);
        ctx.fillRect(this.x + this.width, 550, 5, 30);

    }

    comeBackToPosition() {
        if(this.x < (this.xMax_left + this.xMax_right) / 2) { //왼쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.isLookingRight = true;
                collisonCheckX[this.x] = -1;
                collisonCheckX[this.x + this.CanvasLength + 1] = 1;
                this.x++;
            }
        }
        else if ((this.xMax_left + this.xMax_right) / 2 < this.x) {  // 오른쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.isLookingRight = false;
                collisonCheckX[this.x - 1] = 1;
                collisonCheckX[this.x + this.CanvasLength] = -1;
                this.x--;
            }
        }
    }

    stun() {
        if (this.stunCount < 120) {
            this.stunCount++;
        }
        else {
            this.isStunned = false;
            this.stunCount = 0;
        }
    }

    attack() {
        ctx.fillStyle = 'red';

        if (this.isLookingRight == true) { // 오른쪽 보고있는 경우
            if (this.attackBox.atkTimer <= this.attackBox.width) { //오른쪽 공격 진행중
                //공격 상자 늘리기 전에 플레이어의 방어 확인
                if (p1.isBlocking == true && (this.attackBox.position_x + this.attackBox.atkTimer + 1) == p1.BlockBox.x_left) { 
                    // 플레이어의 왼쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                else {
                    this.attackBox.atkTimer++;
                    if (collisonCheckX[this.attackBox.position_x + this.attackBox.atkTimer] == 0) { //공격이 플레이어에게 닿은 경우
                        p1.isDamaged = true;
                    }
                    ctx.fillRect(this.attackBox.position_x, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
                }
            }

            else { //공격 종료

                if (p1.isDamaged == true) { //플레이어가 해당 몬스터의 공격을 받았을 경우
                    console.log('p1 damaged');
                }

                //플레이어 공격받은 여부 초기화
                p1.isDamaged = false;
                this.attackBox.atkTimer = 0;
                this.isAttacking = false;
            }
        }

        else { //왼쪽을 보고 있는 경우
            if (this.attackBox.atkTimer <= this.attackBox.width) { //왼쪽 공격 진행중
                //공격 상자 늘리기 전에 플레이어의 방어 확인
                if (p1.isBlocking == true && (this.attackBox.position_x - this.attackBox.atkTimer - 1) == p1.BlockBox.x_right) {
                    // 플레이어의 오른쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                else {
                    this.attackBox.atkTimer++;
                    if (collisonCheckX[this.attackBox.position_x - this.attackBox.atkTimer] == 0) {//공격이 플레이어에게 닿은 경우
                        p1.isDamaged = true;
                    }
                    ctx.fillRect(this.attackBox.position_x - this.attackBox.atkTimer, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
                }
            }

            else { //공격 종료

                if (p1.isDamaged == true) { //플레이어가 해당 몬스터의 공격을 받았을 경우
                    console.log('p1 damaged');
                }

                //플레이어 공격받은 여부 초기화
                p1.isDamaged = false;
                this.attackBox.atkTimer = 0;
                this.isAttacking = false;
            }
        }
    }

    move(p1_x_left, p1_x_right) {

        //몹의 공격 범위 갱신
        this.x_detectLeft = this.x - 150;
        this.x_detectRight = this.x + this.CanvasLength + 150;

        this.x_attackLeft = this.x - 50;
        this.x_attackRight = this.x + this.CanvasLength + 50;
        this.isMoving = true;

        this.attackBox.position_x = this.x + this.CanvasLength / 2;

        if (this.isDead == false) { // 몹이 살아있으면 움직임
            for (var i = 0; i <= this.CanvasLength; i++) {
                collisonCheckX[this.x + i] = 1;
            }

            if (this.isAttacking == true) { // 공격중인 경우
                this.attack();
            }

            else if (this.isStunned == true) { //공격이 막혀 잠시 스턴에 걸린 경우
                this.stun();
            }

            else if((this.x_detectLeft <= p1_x_right && p1_x_right < this.x) || (this.x + this.CanvasLength < p1_x_left && p1_x_left <= this.x_detectRight)) {  // 플레이어가 탐지 범위 안에 들어온 경우
                if ((this.x_attackLeft < p1_x_right && p1_x_right < this.x) || (this.x + this.CanvasLength < p1_x_left && p1_x_left < this.x_attackRight)) { //플레이어가 공격 범위 안에 들어온 경우
                    this.isAttacking = true;
                }

                else { //탐지 범위 안에 들어왔지만 공격 범위는 아닌 경우 -> 플레이어 따라가기
                    if (this.x_detectLeft < p1_x_right && p1_x_right < this.x) { //왼쪽으로 이동
                        this.isLookingRight = false;
                        collisonCheckX[this.x - 1] = 1;
                        collisonCheckX[this.x + this.CanvasLength] = -1;
                        this.x--;
                    }

                    else if (this.x + this.CanvasLength < p1_x_left && p1_x_left <= this.x_detectRight) { //오른쪽으로 이동
                        this.isLookingRight = true;
                        collisonCheckX[this.x] = -1;
                        collisonCheckX[this.x + this.CanvasLength + 1] = 1;
                        this.x++;
                    }
                }
            }

            else if((this.x < this.xMax_left) || (this.xMax_right < this.x + this.CanvasLength)) {//지정된 구역을 벗어난 경우
                this.color = 'green';
                this.comeBackToPosition();
            }

            else { // 탐지가 된것도 아니고, 지정된 구역을 벗어난 경우도 아닌 경우 -> 일반 무작위 움직임
                this.color = 'green';
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
                    }
        
                }
        
                else { //움직임이 끝나지 않았을 때
                    if (this.move_randNum <= 10 && this.moveCount < this.move_randNum) { //난수가 일정 수보다 작으면 가만히 서 있는 걸로
                        this.isMoving = false;
                        this.moveCount+=this.speed;
                    }
        
                    else { //움직이는 경우
                        if ((this.move_randNum % 2 == 0) && this.moveCount < this.move_randNum) { //짝수인 경우 -> 오른쪽으로 이동
                            if (this.x + this.width + this.speed <= this.xMax_right) { //고정 범위 안에 있는 경우
                                collisonCheckX[this.x] = -1;
                                collisonCheckX[this.x + this.CanvasLength + 1] = 1;
                                this.isLookingRight = true;
                                this.x+=this.speed;
                                this.moveCount+=this.speed;
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.isMovingDone = true;
                            }
        
                        }
                        else if (this.moveCount < this.move_randNum) {//홀수인 경우 -> 왼쪽으로 이동
                            if (this.x - this.speed >= this.xMax_left) { //고정 범위 안에 있는 경우
                                collisonCheckX[this.x - 1] = 1;
                                collisonCheckX[this.x + this.CanvasLength] = -1;
                                this.isLookingRight = false;
                                this.x-=this.speed;
                                this.moveCount+=this.speed;
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.isMovingDone = true;
                            }
                        }
        
                        else if (this.moveCount >= this.move_randNum) {
                            this.isMovingDone = true;
                            this.moveCount = 0;
                        }
                    }
                }
            }
        }
    }

    checkAttacked(atkTimer) {//공격이 해당 물체에 가해졌는지 확인
        if ((collisonCheckX[atkTimer] == 1) && (this.x <= atkTimer && atkTimer <= this.x + this.width)) {
            console.log('nz damaged')
        }

    }
}

nz1 = new NormalZombie(200, 400, 150, 150, 150);

var obstacle = new Obstacle();

// var obstacle2 = new Obstacle();
// obstacle2.x = 200;
// obstacle2.color = 'blue';

nz1.setFixedRange(150, 500);


var obstacle3 = new Obstacle();
obstacle3.x = 1100;

var obstacle4 = new Obstacle();
obstacle4.x = 1400;


const fps = 60;
function animate() {
  // perform some animation task here
  ctx.clearRect(0,0, canvas.width, canvas.height);
  isBGmovingRight = false;
  isBGmovingLeft = false;
  bg.draw()

  for (var i = 0; i <= p1.CanvasLength - 60; i++) { //플레이어가 서 있는 곳은 0 으로 표시
    collisonCheckX[p1.x + 30 + i] = 0;
}

  //충돌이 없는 경우에만 주인공의 x, y좌표 갱신
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 550, canvas.width, 250);

  ctx.fillStyle = 'red';
  ctx.fillRect(150, 550, 5, 100);
  ctx.fillRect(500, 550, 5, 100);

  ctx.fillStyle = 'blue';
  ctx.fillRect(p1.x +30, 550 , 5, 50);
  ctx.fillRect(p1.x + p1.CanvasLength -30, 550 , 5, 50);

  ctx.fillStyle = 'yellow'
  ctx.fillRect(nz1.x_detectLeft, 550, 5, 40);
  ctx.fillRect(nz1.x_detectRight, 550, 5, 40);

  //좌표계를 이용해 충돌 확인 
  if ((p1.isMovingLeft == true && collisonCheckX[p1.x + 28] == -1) && p1.isAttacking == false) { //왼쪽 충돌 여부 확인 후 왼쪽으로 이동
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
          collisonCheckX[p1.x + 28] = 0;
          collisonCheckX[p1.x + 29] = 0;
          collisonCheckX[p1.x + p1.CanvasLength - 30] = -1;
          collisonCheckX[p1.x + p1.CanvasLength - 31] = -1;
          p1.x-=2;
          p1.attackBox.position_x-=2;
      }
  }
  

  if ((p1.isMovingRight == true && collisonCheckX[p1.x + p1.CanvasLength - 28] == -1) && p1.isAttacking == false) { //오른쪽 충돌 여부 확인 후 오른쪽으로 이동
      if (((p1.x + p1.CanvasLength) >= 1700) && bg.BG_x < bg.BG_xMax) { //배경화면 왼쪽으로 이동하는 경우 (캐릭터가 오른쪽으로 이동)
          bg.isBGmovingLeft = true;
          bg.BG_x+=bg.ratio * 2;
          obstacle.x-=2;
          //obstacle2.x-=2;
          obstacle3.x-=2;
          obstacle4.x-=2;
      }

      else { //플레이어가 이동하면서 위치 정보 갱신 (오른쪽으로 이동)
        collisonCheckX[p1.x + 30] = -1;
        collisonCheckX[p1.x + 31] = -1;
        collisonCheckX[p1.x + p1.CanvasLength - 29] = 0;
        collisonCheckX[p1.x + p1.CanvasLength - 28] = 0;
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
  nz1.move(p1.x + 30, p1.x + p1.CanvasLength - 30)
  obstacle3.draw()
  obstacle4.draw()
  p1.draw()



    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps);
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
    if (e.key === 'a') {
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
    if (e.key === 'd') {
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
    if (e.key === 'r') {
        p1.isBlocking = true;
    }
})

document.addEventListener('keyup', function(e) { //r키를 누른상태에서 땠을때 발생 -> 방어동작 해제
    if (e.key === 'r') {
        p1.isBlocking = false;
    }
})