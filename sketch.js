/** プレイヤーの情報を保持する*/
class Information {
    /** コンストラクタ*/
    constructor(){
        /** @param {number} start_time ゲーム開始時間 */
        this.start_time = millis()
        /** @param {number} hp 体力 */
        this.hp = 100
        /** @param {number} score スコア */
        this.score = 0
        /** @param {number} level レベル */
        this.level = 1
        /** @param {number} interval_time 前回ダメージを受けた時間 */
        this.interval_time = -1000
    }

    /** drawで行う処理*/
    draw(){
        this.update()
        this.drawHp()
        this.drawScore()
        this.drawLevel()
        this.drawRounds()
    }

    /** レベル/スコアの更新を行う*/
    update(){
        if(millis() - this.start_time >= 3000){
            this.score += this.level == 1 ? 0.5 : this.level == 2 ? 1.0 : 1.5
        }else{
            this.drawCount()
        }

        if(this.hp <= 0){
            game_state = 2
        }

        if(this.score >= 3000){
            this.level = 3
        } else if(this.score >= 1000){
            this.level = 2
        }
    }
    
    /** 体力を表示する*/
    drawHp(){
        textAlign(LEFT)
        fill(255)
        noStroke()
        textSize(25)
        text('HP:'+Math.max(0, this.hp), 15, 30)
        rectMode(CORNER)
        fill(255, 180)
        noStroke()
        rect(100, 17, this.hp*2, 10)
        noFill()
        strokeWeight(1)
        stroke(255)
        rect(100, 17, 200, 10)
    }

    /** スコアを表示する*/
    drawScore(){
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

    /** レベルを表示する*/
    drawLevel(){
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

    /** 残弾を表示する*/
    drawRounds(){
        //残段数チャージの表示
        textAlign(CENTER)
        fill(255)
        noStroke()
        textSize(15)
        text('ROUNDS', 60, 432);
        textSize(35)
        text(player.attack_num, 60, 467)

        noFill()
        stroke(255)
        strokeWeight(1)
        ellipseMode(CENTER)
        ellipse(60, 440, 80, 80)
        ellipse(60, 440, 100, 100)

        strokeWeight(5)
        arc(60, 440, 90, 90, -1.570796, player.attack_charge * 6.283184 - 1.570796)

        //残段数の表示
        noFill()
        stroke(255)
        strokeWeight(1)
        rectMode(CORNER)
        rect(125, 453, 123, 34)

        noStroke()
        fill(255)
        for(var i=0; i<player.attack_num; i++){
            rect(127+12*i, 455, 10, 30)
        }

    }

    /** カウントを表示する */
    drawCount(){
        var count = millis() - this.start_time
        textAlign(CENTER)
        fill(255)
        noStroke()
        textSize(50)
        text(3 - int(count/1000), 500, 248);

        noFill()
        stroke(255)
        strokeWeight(1)
        ellipseMode(CENTER)

        strokeWeight(5)
        arc(500, 230, 90, 90, -1.570796, count/1000 * 6.283184 - 1.570796)
    }

    /**
     * 体力を減らす
     * @param {number} x ダメージ数
     */
    damage(x){
        if(millis() - this.interval_time >= 700){
            this.hp -= x
            this.interval_time = millis()
        }
    }
}

/** プレイヤーの情報を保持する*/
class Player {
    /** コンストラクタ*/
    constructor(){
        /** @param {Vector} location 位置 */
        this.location = createVector(500, 200)
        /** @param {Vector} velocity 速度 */
        this.velocity = createVector(0, 0)
        /** @param {Vector} accel 加速度 */
        this.accel = createVector(0, 0)
        /** @param {number} topspeed 最高速度 */
        this.topspeed = 10
        
        /** @param {number} attack_num 残段数 */
        this.attack_num = 10;
        /** @param {Array} attack_list 弾丸クラスのリスト */
        this.attack_list = []
        /** @param {number} attack_interval 弾丸を発射した直近の時間 */
        this.attack_interval = 0
        /** @param {number} attack_charge 弾丸のチャージ率 */
        this.attack_charge = 1
        
        /** @param {number} effect_num エフェクトを作成した直近の番号 */
        this.effect_num = 0
        /** @param {number} effect_list エフェクトクラスのリスト  */
        this.effect_list = []

        /** @param {number} angle 角度/向き */
        this.angle = 0
        /** @param {number} target_no ターゲットのエネミーの番号 */
        this.target_no = -1
    }

    /** drawで行う処理*/
    draw(){
        this.setTarget()
        this.move()
        this.drawPlayer()
        this.addEffect()
        this.drawEffect()

        if(space){
            this.addAttack(this.location.x, this.location.y)
        }
        this.drawAttack()

        //チャージ関連の処理
        this.updateCharge()
    }

    /** 位置を更新する*/
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
    }

    /** プレイヤーを描画する*/
    drawPlayer(){
        //プレイヤー本体
        rectMode(CENTER)
        noStroke()
        if(millis() - info.interval_time >= 700)
            fill(255)
        else if(int(millis()/130) % 2 == 0){
            fill(250, 255, 80, 230)
        } else
            fill(250, 255, 80, 130)
        rect(this.location.x, this.location.y, 30, 30)

        //射線
        noFill()
        stroke(255)
        strokeWeight(2)
        ellipseMode(CENTER)
        arc(this.location.x, this.location.y, 60, 60, 0.4+this.angle, 5.883184+this.angle)
        strokeWeight(1)
        for(var i=0; i<100; i++){
            var x = this.location.x
            var y = this.location.y
            line(x+(i*10), y+(i*10)*sin(this.angle), x+(i*10+5), y+(i*10+5)*sin(this.angle))
        }

        //グロー
        fill(255, 6)
        noStroke()
        ellipseMode(CENTER)
        for(var i=0; i<20; i++){
            ellipse(this.location.x, this.location.y, 15+7*i, 15+7*i)
        }

        //攻撃範囲(20°)
        fill(255, 30)
        noStroke()
        beginShape()
            vertex(this.location.x, this.location.y)
            vertex(this.location.x+1000, this.location.y+176.3)
            vertex(this.location.x+1000, this.location.y-176.3)
        endShape(CLOSE)
    }

    /** エフェクトを作成して配列に追加する*/
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

    /** エフェクトの移動と描画を行う*/
    drawEffect(){
        for(var i=0; i<this.effect_list.length; i++){
            this.effect_list[i].draw()
        }
    }

    /** 攻撃を作成して配列に追加する*/
    addAttack(){
        if(this.attack_num > 0 && (millis() - this.attack_interval) > 200){
            const attack = new PlayerAttack(this.location.x, this.location.y, this.angle)
            this.attack_list.push(attack)
            this.attack_num--

            this.attack_interval = millis()
            if(this.attack_charge == 1){
                this.attack_charge = 0
            }
        }
    }

    /** 攻撃を描画する*/
    drawAttack(){
        for(var i=0; i<this.attack_list.length; i++){
            this.attack_list[i].draw()
        }
    }

    /** チャージ率を更新する*/
    updateCharge(){
        if(this.attack_charge < 1){
            this.attack_charge += 0.0025
        }
        if(this.attack_charge >= 1){
            this.attack_charge = 1
        }

        if(this.attack_charge == 1){
            if(this.attack_num < 9){
                this.attack_num++
                this.attack_charge = 0
            } else if(this.attack_num == 9){
                this.attack_num++
            }
        }
    }

    /** ターゲットを指定する */
    setTarget(){
        //初期化
        for(var i=0; i<enemy_list.enemy_list.length; i++){
            enemy_list.enemy_list[i].isTarget = false
        }
        this.target_no = -1
        this.angle = 0

        /** @param {number} min_distance 最も近い敵との距離 */
        var min_distance = 10000
        /** @param {Vector} location 敵の位置 */
        var location
        /** @param {number} distance 敵との距離 */
        var distance

        for(var i=0; i<enemy_list.enemy_list.length; i++){
            location = createVector(enemy_list.enemy_list[i].location.x, enemy_list.enemy_list[i].location.y)
            if(location.x <= this.location.x || 1000 <= location.x || Math.abs((this.location.y - location.y)/(this.location.x - location.x)) > 0.1745)
                continue

            distance = dist(this.location.x, this.location.y, location.x, location.y)
            if(distance < min_distance){
                this.target_no = i
                min_distance = distance
            }
        }
        if(this.target_no != -1){
            enemy_list.enemy_list[this.target_no].isTarget = true
            this.angle = (enemy_list.enemy_list[this.target_no].location.y - this.location.y)/(enemy_list.enemy_list[this.target_no].location.x - this.location.x)
        }
    }
}

/** エフェクトの情報を保持する*/
class Effect {
    /** 
     * コンストラクタ
     * @param {number} x x座標
     * @param {number} y y座標
     * */
    constructor(x, y){
        /** @param {Vector} location 位置 */
        this.location = createVector(x, y)
        /** @param {number} angle 角度 */
        this.angle = random(0, 6.28)
        /** @param {Vector} velocity 速度 */
        this.velocity = createVector(cos(this.angle)*2-5, sin(this.angle)*2)
        /** @param {number} opacity 透明度 */
        this.opacity = 150
    }

    /** drawで行う処理*/
    draw(){
        this.move()
        this.drawEffect()
    }

    /** 位置を更新する*/
    move(){
        this.location.add(this.velocity)
    }

    /** エフェクトを描画する*/
    drawEffect() {
        ellipseMode(CENTER)
        noStroke()
        fill(255, this.opacity)
        ellipse(int(this.location.x), int(this.location.y), 10, 10)
        this.opacity -= 5
        if(this.opacity <= 0)
            this.opacity = 0
    }
}

/** エネミーの情報を保持する*/
class Enemy {
    /** コンストラクタ*/
    constructor(){
        /** @param {Vector} location 位置 */
        this.location = createVector(1015, int(random(10, 490)))
        /** @param {Vector} velocity 速度 */
        this.velocity = createVector(-4, 0)
        /** @param {Array} attack_list 弾丸クラスのリスト */
        this.attack_list = []
        /** @param {number} attack_time 弾丸を発射した直近の時間 */
        this.attack_time = 0
        /** @param {number} effect_angle エフェクトの角度 */
        this.effect_angle = 0
        /** @param {boolean} isTarget 標的にされているか */
        this.isTarget = false
    }

    /** drawで行う処理*/
    draw(){
        this.move()
        this.drawEnemy()

        //攻撃の管理
        this.addAttack()
        this.drawAttack();
        
        //撃ち落されたかどうか
        this.drop()
        
        //プレイヤーとの接触
        this.collision()

        this.effect_angle++
    }

    /** 位置を更新する*/
    move(){
        //位置の更新
        this.location.add(this.velocity)
    }

    /** エネミーを描画する*/
    drawEnemy(){
        noStroke()
        fill(20, 255, 255)
        beginShape()
        for(var i=0; i<3; i++){
            vertex(this.location.x+sin(i*2.09439+4.712388)*15, this.location.y+cos(i*2.09439+4.712388)*15)
        }
        endShape(CLOSE)

        //ブラー
        fill(20, 255, 255, 15)
        rectMode(CORNER)
        for(var i=0; i<5; i++){
            rect(this.location.x+7.5, this.location.y-13, 7*i, 26)
        }

        //五角形
        noFill()
        if(this.isTarget){
            stroke(255, 10)
            for(var i=0; i<5; i++){
                strokeWeight(i*3)
                beginShape()
                for(var j=0; j<5; j++){
                    vertex(this.location.x+sin(j*1.2566 + this.effect_angle/50)*20, this.location.y+cos(j*1.2566 + this.effect_angle/50)*20)
                }
                endShape(CLOSE)
            }
            stroke(210, 250, 255)
            strokeWeight(3)
        } else {
            stroke(255)
            strokeWeight(1)
        }
        beginShape()
        for(var i=0; i<5; i++){
            vertex(this.location.x+sin(i*1.2566 + this.effect_angle/50)*20, this.location.y+cos(i*1.2566 + this.effect_angle/50)*20)
        }
        endShape(CLOSE)
    }

    /** 攻撃を作成して配列に追加する*/
    addAttack(){
        if(millis() - this.attack_time > 0){
        const attack = new EnemyAttack(this.location.x, this.location.y)
        this.attack_list.push(attack)
        this.attack_time = millis() + int(random(50, 1000))
        }
    }

    /** 攻撃を描画する*/
    drawAttack(){
        for(var i=0; i<this.attack_list.length; i++){
            this.attack_list[i].draw()
        }
    }

    /** プレイヤーの弾丸に当たると撃ち落される*/
    drop(){
        for(var i=0; i<player.attack_list.length; i++){
            if(dist(this.location.x, this.location.y, player.attack_list[i].location.x, player.attack_list[i].location.y) < 15){
                this.location.x = -50
                player.attack_list[i].location.x = 1050
                info.score += 300
            }
        }
    }

    /** プレイヤーにダメージを与える*/
    collision(){
        if(dist(player.location.x, player.location.y, this.location.x, this.location.y) < 35 ){
            this.location.x = -50
            info.damage(30)
        }
    }
}

/** 全エネミーを管理する*/
class EnemyList{
    /** コンストラクタ*/
    constructor(){
        /** @param {number} enemy_num エネミーの数 */
        this.enemy_num = 0
        /** @param {Array} enemy_list エネミーのリスト */
        this.enemy_list = []
        /** @param {number} counter エネミーを作成するまでの時間 */
        this.counter = 230
    }

    /** draw()で行う処理*/
    draw(){
        this.counter--
        if(this.counter <= 0){
            this.addEnemy()
            this.counter = int(random(30, info.level == 1 ? 60 : info.level == 2 ? 50 : 30))
        }

        this.drawEnemyList()
    }

    /** エネミーを配列に追加する*/
    addEnemy(){
        const enemy = new Enemy()
        if(this.enemy_list.length < 15){
            this.enemy_list.push(enemy)
        }
        else{
            this.enemy_list[this.enemy_num % 15] = enemy
        }
        this.enemy_num++
        if(this.enemy_num >= 15)
            this.enemy_num = 0
    }

    /** 全エネミーを描画する*/
    drawEnemyList(){  
        for(var i=0; i<this.enemy_list.length; i++){
            this.enemy_list[i].draw()
        }
    }
}

/** プレイヤーの攻撃の情報を保持する*/
class PlayerAttack {
    /** 
     * コンストラクタ
     * @param {number} x x座標
     * @param {number} y y座標
     * @param {number} angle 角度
     */
    constructor(x, y, angle){
        /** @param {number} location 位置 */
        this.location = createVector(x, y)
        /** @param {number} velocity 速度 */
        this.velocity = createVector(4, 7*sin(angle))
    }

    /** drawで行う処理*/
    draw(){
        this.move()
        this.drawAttack()
    }

    /**
     * 位置を更新する
     */
    move(){
        this.location.add(this.velocity)
    }

    /**
     * 攻撃を描画する
     */
    drawAttack(){
        noStroke()
        rectMode(CENTER)
        fill(255)
        ellipse(this.location.x, this.location.y, 5, 5)

        //攻撃の装飾
        ellipseMode(CENTER)
        for(var i=0; i<8; i++){
            ellipse(this.location.x-this.velocity.x*i/2, this.location.y-this.velocity.y*i/2, 5, 5)
        }
    }
}

/** エネミーの攻撃の情報を保持する*/
class EnemyAttack {
    /**
     * コンストラクタ
     * @param {number} x x座標
     * @param {number} y y座標
     */
    constructor(x, y){
        this.velocity = createVector(-8, 0)
        this.location = createVector(x, y)
    }

    /** drawで行う処理*/
    draw(){
        this.move()
        this.drawAttack()
        this.collision()
    }

    /** 位置を更新する*/
    move(){
        this.location.add(this.velocity)
    }

    /** 攻撃を描画する*/
    drawAttack(){
        noStroke()
        rectMode(CENTER)
        fill(20, 255, 255)
        rect(this.location.x, this.location.y, 14, 4)

        //攻撃の装飾
        fill(20, 255, 255, 30)
        rectMode(CORNER)
        for(var i=0; i<5; i++){
            rect(this.location.x+4, this.location.y-2, 5*i, 4)
        }
    }

    /** プレイヤーにダメージを与える*/
    collision(){
        if(dist(player.location.x, player.location.y, this.location.x, this.location.y) < 20 ){
            this.location.x = -10
            info.damage(15)
        }
    }
}

/** 背景の山々を描画する*/
class Background {
    /** 
     * コンストラクタ
     * @param {number} division 画面幅の分割数
     * @param {number} speed 背景の移動速度
     * @param {number} colorSet 色
     * @param {number} height 山々の高さ
     */
    constructor(division, speed, height, colorSet){
      /** @param {number} displacement 変位 */
      this.displacement = 0
      /** @param {number} speed 背景の移動速度 */
      this.speed = speed
      /** @param {number} division 画面幅の分割数 */
      this.division = division
      /** @param {number} colorSet 色 */
      this.colorSet = colorSet
      /** @param {number} height 山々の高さ */
      this.height = height
      /** @param {number} bg 山の高さの配列 */
      this.bg = []
      for(var i=0; i<100; i++){
        this.bg.push(noise(i*random(0, 0.3))*50)    
      }
    }
    
    /** drawで行う処理*/
    draw(){
      this.drawBackground()
      this.update()
    }
    
    /** 配列と変位を更新する*/
    update(){
      this.displacement -= this.speed
      
      if(this.displacement <= -1000/this.division){
        var x = this.bg[0]
        this.bg.shift()
        this.bg.push(x)
        this.displacement=0
      }
    }
    
    /** 山々を描画する*/
    drawBackground(){
      noStroke()
      fill(this.colorSet[0], this.colorSet[1], this.colorSet[2])
      beginShape()
      vertex(1000, 500)
      vertex(0, 500)
      for(var i=0; i<this.division+5; i++){
        vertex(i*(1000/this.division)+this.displacement, this.bg[i]+this.height) 
      }
      endShape(CLOSE)
    }
  }


//各キーの判定
var up, down, left, right, space;
var bg_1, bg_2, bg_3
var game_state
var opacity
var player, enemy_list, info

function setup(){
    createCanvas(1000, 500);
    textFont('Bahnschrift');
    game_state=0;
    opacity=0
    bg_1 = new Background(50, 0.3, 300, [12, 45, 79])
    bg_2 = new Background(40, 0.5, 330, [4, 29, 56])
    bg_3 = new Background(30, 1, 350, [0, 10, 27])
}

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

/** タイトル画面を描画する*/
function drawTitle() {
    background(33, 73, 104);
    noStroke()
    fill(255)
    textAlign(CENTER);
    textSize(50);
    text('LONG FLIGHT', 500, 230);
    fill(255, opacity)
    textSize(30)
    text("Press the arrow key to start.", 500, 270)
    drawArrowKey(380, 370)
    drawSpaceKey(630, 396)

    if(opacity <= 255){
        opacity+=3
    }

    if(opacity >= 255){
        //ゲームスタート
        if(right||left||up||down){
            game_state = 1;
            player = new Player()
            enemy_list = new EnemyList() 
            info = new Information()
            opacity = 0
        }
    }
}

/** ゲーム画面を描画する*/
function drawGame() {
    background(33, 73, 104);
    bg_1.draw()
    bg_2.draw()
    bg_3.draw()
    enemy_list.draw()
    player.draw()
    info.draw()
}

/** スコア画面を描画する*/
function drawScore(){
    background(33, 73, 104);
    noStroke()
    textAlign(CENTER);
    fill(255)
    textSize(40);
    text('Your score is', 500, 150);
    textSize(80)
    fill(255)
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

/**
 * 矢印キーを描画する
 * @param {number} x 
 * @param {number} y 
 */
function drawArrowKey(x, y){
    stroke(255)
    strokeWeight(1)
    fill(255, 50)
    rectMode(CENTER)
    rect(x, y-20, 40, 40)
    rect(x, y+30, 40, 40)
    rect(x-50, y+30, 40, 40)
    rect(x+50, y+30, 40, 40)

    fill(255)
    noStroke()
    beginShape()
        vertex(x,y-30)
        vertex(x-10, y-13)
        vertex(x+10, y-13)
    endShape(CLOSE)
    beginShape()
        vertex(x,y+40)
        vertex(x-10, y+23)
        vertex(x+10, y+23)
    endShape(CLOSE)
    beginShape()
        vertex(x-59,y+30)
        vertex(x-42, y+20)
        vertex(x-42, y+40)
    endShape(CLOSE)
    beginShape()
        vertex(x+59,y+30)
        vertex(x+42, y+20)
        vertex(x+42, y+40)
    endShape(CLOSE)
    textSize(20)
    textAlign(CENTER)
    text('move with arrow keys', x, y+75)
}

/**
 * スペースバーを描画する
 * @param {number} x 
 * @param {number} y 
 */
function drawSpaceKey(x, y){
    stroke(255)
    strokeWeight(1)
    fill(255, 50)
    rectMode(CENTER)
    rect(x, y+5, 150, 40)
    fill(255)
    noStroke()
    textSize(20)
    textAlign(CENTER)
    text('space bar', x, y+10)
    text('shoot with space bar', x, y+50)
}

/** キーが押されたかを判定する*/
function keyPressed() {
    if(keyCode == LEFT_ARROW) left = true;
    if(keyCode == RIGHT_ARROW) right = true;
    if(keyCode == UP_ARROW) up = true;
    if(keyCode == DOWN_ARROW) down = true;
    if(key == ' ') space = true;
}

/** キーが離されたかを判定する*/
function keyReleased(){
    if(keyCode == LEFT_ARROW) left = false;
    if(keyCode == RIGHT_ARROW) right = false;
    if(keyCode == UP_ARROW) up = false;
    if(keyCode == DOWN_ARROW) down = false;
    space = false
}