class Information {
    constructor(){
        this.hp = 100
        this.score = 0
        this.level = 1
    }

    display(){
        rectMode(CENTER)
        textAlign(LEFT);
        fill(255)
        textSize(25);
        this.displayHp()
        this.displayScore()
        this.displayLevel()
        this.displayRounds()
        this.score += this.level == 1 ? 0.5 : this.level == 2 ? 1.0 : 1.5

        if(this.hp <= 0){
            game_state = 2
        }

        if(this.score >= 3000){
            this.level = 3
        }
        if(this.score >= 1000){
            this.level = 2
        }
    }
    
    //体力の表示
    displayHp(){
        textAlign(LEFT)
        fill(255)
        noStroke()
        textSize(25)
        text('HP:'+this.hp, 15, 30)
        rectMode(CORNER)
        fill(255, 180)
        noStroke()
        rect(100, 17, this.hp*2, 10)
        noFill()
        stroke(255)
        rect(100, 17, 200, 10)
    }

    //スコアの表示
    displayScore(){
        textAlign(LEFT)
        fill(255)
        noStroke()
        textSize(25)
        text('SCORE : ', 15, 70);
        textSize(35)
        text(int(this.score), 115, 70)
        for(var i=0; i<5; i++){
            textSize(35)
            noFill()
            stroke(255, 20)
            strokeWeight(i*2)
            text(int(this.score), 115, 70)
        }
    }

    //レベルの表示
    displayLevel(){
        fill(255)
        noStroke()
        textSize(25)
        text('LEVEL : ', 15, 110);
        if(this.level == 1)
            fill(255)
        else if(this.level == 2)
            fill(253, 255, 141)
        else
            fill(255, 90, 90)
        textSize(30)
        text(this.level, 110, 110)
    }

    //残弾数の表示
    displayRounds(){
        textAlign(LEFT)
        fill(255)
        noStroke()
        textSize(25)
        text('ROUNDS : '+player.attack_num, 20, 480);

        noFill()
        stroke(255)
        strokeWeight(1)
        rectMode(CORNER)
        rect(171, 455, 123, 34)

        noStroke()
        fill(255)
        for(var i=0; i<player.attack_num; i++){
            rect(173+12*i, 457, 10, 30)
        }

    }
}

//プレイヤークラス
class Player {
    constructor(){
        //位置・速度・加速度の定義
        this.location = createVector(500, 200)
        this.velocity = createVector(0, 0)
        this.accel = createVector(0, 0)
        this.topspeed = 10
        
        //弾丸の管理
        this.attack_num = 10;
        this.attack_list = []
        this.attack_time = 0
        
        //エフェクトの管理
        this.effect_num = 0
        this.effect_list = []

        this.interval = millis()
    }

    //移動
    move(){
        //加速度の更新
        if(right) this.accel.x += 0.3
        if(left) this.accel.x -= 0.3
        if(up) this.accel.y -= 0.3
        if(down) this.accel.y += 0.3
        this.accel.add(-this.accel.x/5, -this.accel.y/5)

        //速度の更新
        this.velocity.add(this.accel)
        this.velocity.add(-this.velocity.x/15, -this.velocity.y/15)
        this.velocity.limit(this.topspeed)

        //位置の更新
        this.location.add(this.velocity.x-2 < -8 ? -8 : this.velocity.x-3, this.velocity.y)
        if(this.location.x < 15) this.location.x = 15
        if(this.location.x > 985) this.location.x = 985
        if(this.location.y < 15) this.location.y = 15
        if(this.location.y > 485) this.location.y = 485
        
        //攻撃関連の処理
        if(space){
            this.addAttack(this.location.x, this.location.y)
        }
        this.displayAttack()
    }

    //プレイヤーの描画
    display(){
        rectMode(CENTER)
        noStroke()
        if(millis() - this.interval >= 700)
            fill(255)
        else
            fill(255, 200)
        rect(this.location.x, this.location.y, 30, 30)
    }

    //エフェクトの追加
    addEffect(){
        const effect = new Effect(this.location.x, this.location.y)
        if(this.effect_list.length < 50){
            this.effect_list.push(effect)
        }
        else{
            this.effect_list[this.effect_num % 50] = effect
        }
        if(this.effect_num++ >= 50)
            this.effect_num = 0
    }

    //エフェクトの描画
    displayEffect(){
        this.addEffect()
        
        for(var i=0; i<this.effect_list.length; i++){
            this.effect_list[i].move()
            this.effect_list[i].display()
        }
    }

    //攻撃の追加
    addAttack(){
        if(this.attack_num > 0 && (millis() - this.attack_time) > 200){
            const attack = new PlayerAttack(this.location.x, this.location.y)
            this.attack_list.push(attack)
            this.attack_num--
            this.attack_time = millis()
            space = false
        }
    }

    //攻撃の描画
    displayAttack(){
        for(var i=0; i<this.attack_list.length; i++){
            this.attack_list[i].move()
            this.attack_list[i].display()
        }
    }

    damage(x){
        if(millis() - this.interval >= 700){
            info.hp -= x
            this.interval = millis()
        }
    }
}

//エフェクトクラス
class Effect {
    //位置の定義
    constructor(x, y){
        this.location = createVector(x, y)
        this.angle = random(0, 6.28)
        this.velocity = createVector(cos(this.angle)*2-5, sin(this.angle)*2)
        this.opacity = 150
    }

    //移動
    move(){
        this.location.add(this.velocity)
    }

    //弾丸の描画
    display() {
        ellipseMode(CENTER)
        noStroke()
        fill(255, this.opacity)
        ellipse(int(this.location.x), int(this.location.y), 10, 10)
        this.opacity -= 5
        if(this.opacity <= 0)
            this.opacity = 0
    }
}

//エネミークラス
class Enemy {
    //位置・攻撃の定義
    constructor(){
        this.velocity = createVector(-4, 0)
        this.location = createVector(1015, int(random(10, 490)))
        this.attack_list = []
        this.attack_time = 0
    }

    //移動
    move(){
        //位置の更新
        this.location.add(this.velocity)
        
        //攻撃の管理
        this.addAttack()
        this.displayAttack();
        
        //撃ち落されたかどうか
        if(player.attack_list.length > 0){
        this.drop()
        }
        
        //プレイヤーとの接触
        this.collision()
    }

    //エネミーの描画
    display(){
        noStroke()
        fill(255, 0, 85)
        beginShape()
            vertex(this.location.x-15,this.location.y)
            vertex(this.location.x+15,this.location.y-15)
            vertex(this.location.x+15,this.location.y+15)
        endShape(CLOSE)
    }

    //攻撃の追加
    addAttack(){
        if(millis() - this.attack_time > 0){
        const attack = new EnemyAttack(this.location.x, this.location.y)
        this.attack_list.push(attack)
        this.attack_time = millis() + int(random(50, 1000))
        }
    }

    //攻撃の描画
    displayAttack(){
        for(var i=0; i<this.attack_list.length; i++){
            this.attack_list[i].move()
            this.attack_list[i].display()
            this.attack_list[i].collision()
        }
    }

    //撃ち落されたときの処理
    drop(){
        for(var i=0; i<player.attack_list.length; i++){
            if(dist(this.location.x, this.location.y, player.attack_list[i].location.x, player.attack_list[i].location.y) < 15){
                this.location.x = -50
                player.attack_list[i].location.x = 1050
                info.score += 300
            }
        }
    }

    //プレイヤーとの接触
    collision(){
        if(dist(player.location.x, player.location.y, this.location.x, this.location.y) < 40){
            this.location.x = -50
            player.damage(30)
        }
    }
}

//エネミー描画クラス
class EnemyList{
    //エネミー全体の管理
    constructor(){
        this.enemy_num = 0
        this.enemy_list = []
        this.counter = 0
    }

    //エネミーの追加
    addEnemy(){
        const enemy = new Enemy()
        if(this.enemy_list.length < 20){
            this.enemy_list.push(enemy)
        }
        else{
            this.enemy_list[this.enemy_num % 20] = enemy
        }
        this.enemy_num++
        if(this.enemy_num >= 20)
            this.enemy_num = 0
    }

    //エネミー全体の描画
    displayEnemy(){
        this.counter--
        if(this.counter <= 0){
            this.addEnemy()
            this.counter = int(random(30, info.level == 1 ? 60 : info.level == 2 ? 50 : 30))
        }
        
        for(var i=0; i<this.enemy_list.length; i++){
            this.enemy_list[i].move()
            this.enemy_list[i].display()
        }
    }
}


//各キーの判定
var up, down, left, right, space;

//ゲームの状態
var game_state=0;
var opacity=0

var player;
var info;

//初期化
function setup(){
    let canvas = createCanvas(1000, 500);
    textFont('Bahnschrift');
}

//描画
function draw(){
    background(0);
    fill(255);
    switch(game_state) {
        case 0:
            drawTitle();
            break;
        case 1:
            drawGame();
            break;
        case 2:
            drawScore()
            break;
    }
}

//プレイヤー攻撃クラス
class PlayerAttack {
    //位置の定義
    constructor(x, y){
        this.location = createVector(x, y)
        this.velocity = createVector(4, 0)
    }

    //位置の更新
    move(){
        this.location.add(this.velocity)
    }

    //攻撃の描画
    display(){
        rectMode(CENTER)
        fill(255)
        rect(this.location.x, this.location.y, 14, 4)
    }
}

//エネミー攻撃クラス
class EnemyAttack {
    //位置の定義
    constructor(x, y){
        this.velocity = createVector(-8, 0)
        this.location = createVector(x, y)
    }

    //位置の更新
    move(){
        this.location.add(this.velocity)
    }

    //攻撃の描画
    display(){
        rectMode(CENTER)
        fill(255, 0, 85)
        rect(this.location.x, this.location.y, 14, 4)
    }

    //衝突
    collision(){
        if(dist(player.location.x, player.location.y, this.location.x, this.location.y) < 20){
            this.location.x = -10
            player.damage(15)
        }
    }
}

//タイトル画面を描画する関数
function drawTitle() {
    background(0);
    fill(255)
    textAlign(CENTER);
    textSize(50);
    text('LONG FLIGHT', 500, 250);
    fill(255, opacity)
    textSize(30)
    text("Press the arrow key...", 500, 300)

    if(opacity <= 255){
        opacity+=3
    }

    if(opacity >= 255){
        //ゲームスタート
        if(right||left||up||down){
            game_state = 1;
            player = new Player()
            draw_enemy = new EnemyList() 
            info = new Information()
            opacity = 0
        }
    }
}

//ゲーム画面を描画する関数
function drawGame() {
    background(0);
    draw_enemy.displayEnemy()
    player.move()
    player.display()
    player.displayEffect()
    info.display()
}

//スコア画面を描画する関数
function drawScore(){
    background(0);
    textAlign(CENTER);
    fill(255)
    textSize(40);
    text('Your score is', 500, 150);
    textSize(80)
    fill(255, 200, 200)
    text(int(info.score), 500, 250)
    textSize(45)
    fill(255, opacity)
    text('Thank you for playing!', 500, 330)

    if(opacity <= 255){
        opacity+=3
    }

    if(opacity >= 255){
        if(right||left||up||down){
            game_state = 0;
            opacity = 0
        }
    }
}

function keyPressed() {
    if(keyCode == LEFT_ARROW) left = true;
    if(keyCode == RIGHT_ARROW) right = true;
    if(keyCode == UP_ARROW) up = true;
    if(keyCode == DOWN_ARROW) down = true;
    if(key == ' ') space = true;
}

function keyReleased(){
    if(keyCode == LEFT_ARROW) left = false;
    if(keyCode == RIGHT_ARROW) right = false;
    if(keyCode == UP_ARROW) up = false;
    if(keyCode == DOWN_ARROW) down = false;
    space = false
}