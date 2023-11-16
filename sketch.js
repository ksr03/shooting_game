/** プレイヤーの情報を保持する*/
class Information {
    /** コンストラクタ*/
    constructor(){
        /** @param {number} start_time ゲーム開始時間 */
        this.start_time = millis()
        /** @param {number} hp 体力 */
        this.hp = 5
        /** @param {number} score スコア */
        this.score = 0
        /** @param {number} level レベル */
        this.level = 1
        /** @param {number} levelup_time 前回レベルアップした時間 */
        this.levelup_time = millis() - 1000
        /** @param {number} damaged_time 前回ダメージを受けた時間 */
        this.damaged_time = -1000
        /** @param {number} bonus_score ボーナススコア */
        this.bonus_score = null
    }

    /** drawで行う処理*/
    draw(){
        if(this.hp == 1){
            this.drawDying()
        }
        if((2500 < millis() - this.start_time) && (millis() - this.start_time < 5500)){
            this.drawCount()
        }
        this.update()
        this.drawInformation()
    }

    /** レベル/スコアの更新を行う*/
    update(){
        if(5500 <= millis() - this.start_time){
            this.score += this.level == 1 ? 0.5 : this.level == 2 ? 1.0 : 1.5
            if(!bgm.isPlaying()){
                bgm.loop()
                bgm.setVolume(0.2)
            }
        }
        if(this.level == 2 && this.score >= 6000){
            this.level = 3
            this.levelup_time = millis()
            se_levelup.play()
        } else if(this.level == 1 && this.score >= 3000){
            this.level = 2
            this.levelup_time = millis()
            se_levelup.play()
        }
    }

    /** 全ての情報を描画する */
    drawInformation(){
        this.drawHp()
        this.drawScore()
        this.drawLevel()
        this.drawRounds()
        if(this.bonus_score){
            this.bonus_score.draw()
        }
    }
    
    /** 体力を表示する*/
    drawHp(){
        textAlign(LEFT)
        fill(255)
        noStroke()
        textSize(25)
        text('HP :', 15, 33)
        for(var i=0; i<5; i++){
            this.drawHeart(85 + i*37, 25, [60, 60, 60, 255])
        }
        for(var i=0; i<this.hp; i++){
            this.drawHeart(85 + i*37, 25, [255, 60, 130, 255])
        }
        var t = millis() - this.damaged_time 
        if(t < 300){
            this.drawHeart(85 + this.hp*37, 25 + t/15, [255, 60, 130, 300-t])
        }
    }

    /**
     * ハートを描画する
     * @param {number} x x座標 
     * @param {number} y y座標
     * @param {Array} color 色
     */
    drawHeart(x, y, color){
        fill(color[0], color[1], color[2], color[3])
        noStroke()
        ellipseMode(CENTER)
        arc(x-7, y-5, 14, 14, 2.3, 0)
        arc(x+7, y-5, 14, 14, 3.141592, 0.841592)
        beginShape()
            vertex(x-12, y-0.3)
            vertex(x-8, y-5)
            vertex(x+8, y-5)
            vertex(x+12, y-0.3)
            vertex(x, y+13)
        endShape(CLOSE)
    }

    /** スコアを表示する*/
    drawScore(){
        textAlign(LEFT)
        fill(255)
        noStroke()
        textSize(25)
        text('SCORE : ', 15, 78);
        textSize(35)
        text(int(this.score), 115, 78)
        for(var i=0; i<5; i++){
            textSize(35)
            noFill()
            stroke(255, 20)
            strokeWeight(i*2)
            text(int(this.score), 115, 78)
        }
    }

    /** レベルを表示する*/
    drawLevel(){
        //メーターの描画
        ellipseMode(CENTER)
        this.drawMeter(61, 140, 85, 3.141592, 4.208789, [255, 163, 196], 1)
        this.drawMeter(65, 140, 88, 4.238789, 5.185987, [255, 102, 157], 2)
        this.drawMeter(69, 140, 85, 5.215987, 0, [255, 59, 130], 3)

        //針の描画
        var s = this.score/9000 * 3.141592 + 3.191592
        if(6.183184 < s){
            s = 6.183184
        }
        stroke(255)
        strokeWeight(5)
        line(65, 140, 65+cos(s)*30, 140+sin(s)*30)

        fill(255)
        noStroke()
        textSize(20)
        text('LEVEL : ', 22, 170);
        textSize(30)
        text(this.level, 95, 170)
    }

    /**
     * メーターの部品を描画する
     * @param {number} x 円の中心のx座標 
     * @param {number} y 円の中心のy座標
     * @param {number} size 円の大きさ
     * @param {number} start 弧の始まり
     * @param {number} stop 弧の終わり
     * @param {Array} color 色
     * @param {number} level レベル
     */
    drawMeter(x, y, size, start, stop, color, level){
        if(this.level == level){
            stroke(255)
            strokeWeight(3)
        }else {
            noStroke()
        }
        fill(color[0], color[1], color[2])
        arc(x, y, size, size, start, stop)
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
        var count = millis() - this.start_time - 2500
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
        
        if(0 < (millis() - this.start_time)%1000 && (millis() - this.start_time)%1000 < 500 && !se_count.isPlaying()){
            se_count.play()
        }
    }

    /** 瀕死のときに枠を表示する */
    drawDying(){
        noFill()
        stroke(255, 60, 130, 255)
        strokeWeight(10)
        rectMode(CORNER)
        rect(0, 0, 1000, 500)
        stroke(255, 60, 130, sin(millis()/300)*25)
        for(var i=0; i<10; i++){
            strokeWeight(10+i*2)
            rect(0, 0, 1000, 500)
        }
    }

    /** 体力を減らす */
    damage(){
        if(millis() - this.damaged_time >= 1500){
            this.hp -= 1
            this.damaged_time = millis()
            if(this.hp == 1){
                se_damage2.play()
            }else {
                se_damage1.play()
            }
        }
    }

    /** ボーナススコアを追加する */
    bonus(){
        this.score += 300
        this.bonus_score = new RiseText(135 + int(this.score).toString().length * 15, 63, '+300')
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
        
        /** @param {number} attack_num 残段数 */
        this.attack_num = 10;
        /** @param {Array} attack_list 弾丸クラスのリスト */
        this.attack_list = []
        /** @param {number} attack_time 弾丸を発射した直近の時間 */
        this.attack_time = 0
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

        this.drawAttack()

        //チャージ関連の処理
        this.updateCharge()
    }

    /** 位置を更新する*/
    move(){
        //速度の更新
        this.velocity.x = (mouseX - this.location.x)/15
        this.velocity.y = (mouseY - this.location.y)/15
        this.velocity.limit(10)

        //位置の更新
        this.location.add(this.velocity)
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
        if(millis() - info.damaged_time >= 1500)
            fill(255)
        else if(int(millis()/130) % 2 == 0){
            fill(250, 255, 80, 230)
        } else
            fill(250, 255, 80, 130)
        rect(this.location.x, this.location.y, 30, 30)

        //射線
        noFill()
        strokeWeight(2)
        ellipseMode(CENTER)
        if(millis() - info.damaged_time >= 1500)
            stroke(255)
        else if(int(millis()/130) % 2 == 0){
            stroke(250, 255, 80, 230)
        } else
            stroke(250, 255, 80, 130)
        arc(this.location.x, this.location.y, 60, 60, 0.4+this.angle, 5.883184+this.angle)
        strokeWeight(1)
        stroke(255)
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
        const effect = new PlayerEffect(this.location)
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
        if(this.attack_num > 0 && (millis() - this.attack_time) > 200){
            const attack = new Attack(createVector(this.location.x, this.location.y), createVector(4, 7*sin(this.angle)),  1)
            this.attack_list.push(attack)
            this.attack_num--

            this.attack_time = millis()
            if(this.attack_charge == 1){
                this.attack_charge = 0
            }
            
            se_attack.play()
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
                this.attack_charge = 2
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
            if(location.x <= this.location.x || 1000 <= location.x || Math.abs((this.location.y - location.y)/(this.location.x - location.x)) > 0.1745){
                continue
            }
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
class PlayerEffect {
    /** 
     * コンストラクタ
     * @param {Vector} location 位置
     * */
    constructor(location){
        /** @param {Vector} location 位置 */
        this.location = createVector(location.x, location.y)
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
    constructor(type){
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
        /** @param {Array} effect_list エフェクトを保持する配列 */
        this.effect_list = []
        /** @param {number} type 敵の種類 */
        this.type = type
        /** @param {color} color 色 */
        this.color = color(20, 255, 255)
    }

    /** drawで行う処理*/
    draw(){
        this.move()
        if(this.type == 1){
            this.drawEnemy_1()
        }else if(this.type == 2){
            this.drawEnemy_2()
        }else{
            this.drawEnemy_3()
        }

        //攻撃の管理
        this.addAttack()
        this.drawAttack();
        
        //撃ち落されたかどうか
        this.drop()
        
        //プレイヤーとの接触
        this.collision()

        this.effect_angle++

        this.drawEffect()
    }

    /** 位置を更新する*/
    move(){
        this.location.add(this.velocity)
    }

    /** エネミー1を描画する*/
    drawEnemy_1(){
        noStroke()
        fill(this.color)
        beginShape()
        for(var i=0; i<3; i++){
            vertex(this.location.x+sin(i*2.09439+4.712388)*15, this.location.y+cos(i*2.09439+4.712388)*15)
        }
        endShape(CLOSE)

        //ブラー
        fill(red(this.color), green(this.color), blue(this.color), 15)
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

    /** エネミー2を描画する */
    drawEnemy_2(){
        //本体
        noStroke()
        fill(this.color)
        beginShape()
        for(var i=0; i<4; i++){
            vertex(this.location.x+sin(i*1.570796)*15, this.location.y+cos(i*1.570796)*15)
            vertex(this.location.x+sin(i*1.570796+0.785398)*7, this.location.y+cos(i*1.570796+0.785398)*7)
        }
        endShape(CLOSE)

        //グロー
        for(var i=0; i<4; i++){
            noFill()
            stroke(red(this.color), green(this.color), blue(this.color), 25)
            strokeWeight((i+1)*2)
            beginShape()
            for(var j=0; j<4; j++){
                vertex(this.location.x+sin(j*1.570796)*15, this.location.y+cos(j*1.570796)*15)
                vertex(this.location.x+sin(j*1.570796+0.785398)*7, this.location.y+cos(j*1.570796+0.785398)*7)
            }
            endShape(CLOSE)
        }

        //六芒星
        noFill()
        if(this.isTarget){
            stroke(255, 10)
            for(var i=0; i<4; i++){
                strokeWeight((i+1)*3)
                beginShape()
                for(var i=0; i<6; i++){
                    vertex(this.location.x+sin(i*1.0472 + this.effect_angle/50)*20, this.location.y+cos(i*1.0472 + this.effect_angle/50)*20)
                    vertex(this.location.x+sin(i*1.0472 + 0.5236 + this.effect_angle/50)*15, this.location.y+cos(i*1.0472 + 0.5236 + this.effect_angle/50)*15)
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
        for(var i=0; i<6; i++){
            vertex(this.location.x+sin(i*1.0472 + this.effect_angle/50)*20, this.location.y+cos(i*1.0472 + this.effect_angle/50)*20)
            vertex(this.location.x+sin(i*1.0472 + 0.5236 + this.effect_angle/50)*15, this.location.y+cos(i*1.0472 + 0.5236 + this.effect_angle/50)*15)
        }
        endShape(CLOSE)
    }

    /** エネミー3を描画する */
    drawEnemy_3(){
        //本体
        noStroke()
        fill(this.color)
        beginShape()
        for(var i=0; i<6; i++){
            vertex(this.location.x+sin(i*1.0472 - this.effect_angle/50)*15, this.location.y+cos(i*1.0472 - this.effect_angle/50)*15)
            vertex(this.location.x+sin(i*1.0472 + 0.5236 - this.effect_angle/50)*10, this.location.y+cos(i*1.0472 + 0.5236 - this.effect_angle/50)*10)
        }
        endShape(CLOSE)

        //グロー
        for(var i=0; i<4; i++){
            noFill()
            stroke(red(this.color), green(this.color), blue(this.color), 30)
            strokeWeight((i+1)*2)
            beginShape()
            for(var j=0; j<6; j++){
                vertex(this.location.x+sin(j*1.0472 - this.effect_angle/50)*15, this.location.y+cos(j*1.0472 - this.effect_angle/50)*15)
                vertex(this.location.x+sin(j*1.0472 + 0.5236 - this.effect_angle/50)*10, this.location.y+cos(j*1.0472 + 0.5236 - this.effect_angle/50)*10)
            }
            endShape(CLOSE)
        }

        //六角形
        noFill()
        if(this.isTarget){
            stroke(255, 10)
            for(var i=0; i<4; i++){
                strokeWeight((i+1)*3)
                beginShape()
                for(var i=0; i<6; i++){
                    vertex(this.location.x+sin(i*1.0472 + this.effect_angle/50)*20, this.location.y+cos(i*1.0472 + this.effect_angle/50)*20)
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
        for(var i=0; i<6; i++){
            vertex(this.location.x+sin(i*1.0472 + this.effect_angle/50)*20, this.location.y+cos(i*1.0472 + this.effect_angle/50)*20)
        }
        endShape(CLOSE)
    }

    /** 攻撃を作成して配列に追加する*/
    addAttack(){
        if(millis() - this.attack_time > 0 && 0 < this.location.x){
            if(this.type == 1){
                var attack = new Attack(createVector(this.location.x, this.location.y), createVector(-8, 0), 2)
                this.attack_list.push(attack)
                this.attack_time = millis() + int(random(50, 1000))
            }else if(this.type == 2){
                var velocity = createVector(player.location.x - this.location.x, player.location.y - this.location.y).normalize()
                var attack = new Attack(createVector(this.location.x, this.location.y), createVector(velocity.x*8, velocity.y*8), 2)
                this.attack_list.push(attack)
                this.attack_time = millis() + 5000
            }else {
                var attack = new Attack(createVector(this.location.x, this.location.y), createVector(-8, 1), 2)
                this.attack_list.push(attack)
                var attack = new Attack(createVector(this.location.x, this.location.y), createVector(-8, -1), 2)
                this.attack_list.push(attack)
                this.attack_time = millis() + 3000
            }
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
                for(var j=0; j<10; j++){
                    this.effect_list.push(new ScoreEffect(this.location, [-5, 5], [-5, 5], [random(20, 255), 255, 255]))
                }
                this.location.x = -50
                player.attack_list[i].location.x = 1050
                info.bonus()

                se_drop.play()
                se_drop.setVolume(0.5)
            }
        }
    }

    /** プレイヤーにダメージを与える*/
    collision(){
        if(dist(player.location.x, player.location.y, this.location.x, this.location.y) < 35 ){
            info.damage()
        }
    }

    /** エフェクトの移動と描画を行う*/
    drawEffect(){
        for(var i=0; i<this.effect_list.length; i++){
            this.effect_list[i].draw()
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
        this.counter = 380
    }

    /** draw()で行う処理*/
    draw(){
        this.counter--
        if(this.counter <= 0){
            this.addEnemy()
            this.counter = int(random(30, info.level == 1 ? 60 : info.level == 2 ? 45 : 31))
        }

        this.drawEnemyList()
    }

    /** エネミーを配列に追加する*/
    addEnemy(){
        //エネミーの生成
        var enemy
        var rand = 1
        if(info.level == 2){
            rand = int(random(1, 3))
        }
        if(info.level == 3){
            rand = int(random(1, 4))
        }
        enemy = new Enemy(rand)

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

/** 攻撃の情報を保持する */
class Attack {
    /** 
     * コンストラクタ
     * @param {Vector} location 位置
     * @param {Vector} velocity 速度
     * @param {number} type 種類（プレイヤーなら1、敵なら2）
     */
    constructor(location, velocity, type){
        /** @param {Vector} location 位置 */
        this.location = location
        /** @param {Vector} velocity 速度 */
        this.velocity = velocity
        /** @param {number} type 種類 */
        this.type = type
    }

    /** draw()で行う関数 */
    draw(){
        this.move()
        this.drawAttack()
        if(this.type == 2){
            this.collision()
        }
    }

    /** 位置を更新する */
    move(){
        this.location.add(this.velocity)
    }

    /** 攻撃を描画する */
    drawAttack(){
        noStroke()
        rectMode(CENTER)
        if(this.type == 1){
            fill(255)
        }else{
            fill(20, 255, 255)
        }
        ellipse(this.location.x, this.location.y, 5, 5)

        //攻撃の装飾
        var n = 8
        if(this.type == 2){
            n = 4
        }
        ellipseMode(CENTER)
        for(var i=0; i<n; i++){
            ellipse(this.location.x-this.velocity.x*i/4, this.location.y-this.velocity.y*i/2, 5, 5)
        }
    }

    /** プレイヤーにダメージを与える*/
    collision(){
        if(dist(player.location.x, player.location.y, this.location.x, this.location.y) < 20 ){
            info.damage(this.location)
        }
    }
}

/** 背景の山々を描画する*/
class Background {
    /** 
     * コンストラクタ
     * @param {number} division 画面幅の分割数
     * @param {number} speed 背景の移動速度
     * @param {Array} color_set 色
     * @param {number} height 山々の高さ
     */
    constructor(division, speed, height, color_set){
      /** @param {number} displacement 変位 */
      this.displacement = 0
      /** @param {number} speed 背景の移動速度 */
      this.speed = speed
      /** @param {number} division 画面幅の分割数 */
      this.division = division
      /** @param {Array} color_set 色 */
      this.color_set = color_set
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
    
    /** メンバ変数を更新する*/
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
      if(info.level == 1){
        fill(this.color_set[0])
      }else if(info.level == 2){
        fill(lerpColor(this.color_set[0], this.color_set[1], (millis() - info.levelup_time) / 1000))
      }else {
        fill(lerpColor(this.color_set[1], this.color_set[2], (millis() - info.levelup_time) / 1000))
      }
      beginShape()
      vertex(1000, 500)
      vertex(0, 500)
      for(var i=0; i<this.division+5; i++){
        vertex(i*(1000/this.division)+this.displacement, this.bg[i]+this.height) 
      }
      endShape(CLOSE)
    }
  }

/** 空を描画する */
class Sky {
    /** 
     * コンストラクタ
     * @param {Array} color_set 昼・晩・夜の空の色
     * @param {Array} stars 星の情報を持つ配列
     */
    constructor(){
        /** @param {Array} color_set 空の色 */
        this.color_set = [[color(98, 152, 160), color(157, 183, 187)], [color(225, 123, 90), color(229, 187, 123)], [color(43, 71, 97), color(55, 125, 161)]]
        this.stars = []
        for(var i=0; i<30; i++){
            this.stars.push(new Star())
        }
    }

    /** drawで行う処理 */
    draw(){
        this.drawSky()
    }

    /** 空を描画する */
    drawSky(){
        noStroke()
        rectMode(CORNER)
        ellipseMode(CENTER)
        if(info.level == 1){
            for(var i=0; i<80; i++){
                fill(lerpColor(this.color_set[0][0], this.color_set[0][1], i/80))
                rect(0, i*500/80, 1000, 500/70)
            }
            fill(226, 224, 214)
            noStroke()
            ellipse(800, 100, 50, 50)
        }else if(info.level == 2){
            for(var i=0; i<80; i++){
                fill(lerpColor(lerpColor(this.color_set[0][0], this.color_set[1][0], (millis() - info.levelup_time) / 1000), lerpColor(this.color_set[0][1], this.color_set[1][1], (millis() - info.levelup_time) / 1000), i/80))
                rect(0, i*500/80, 1000, 500/70)
            }
            
            fill(226, 224, 214, 255 - (millis() - info.levelup_time) / 4)
            noStroke()
            ellipse(800, 100, 50, 50)

            fill(225, 226, 123, (millis() - info.levelup_time) / 4)
            noStroke()
            ellipse(900, 250, 50, 50)
        }else {
            for(var i=0; i<80; i++){
                fill(lerpColor(lerpColor(this.color_set[1][0], this.color_set[2][0], (millis() - info.levelup_time) / 1000), lerpColor(this.color_set[1][1], this.color_set[2][1], (millis() - info.levelup_time) / 1000), i/80))
                rect(0, i*500/80, 1000, 500/70)
            }

            fill(225, 226, 123, 255 - (millis() - info.levelup_time) / 4)
            noStroke()
            ellipse(900, 250, 50, 50)

            fill(201, 253, 255, (millis() - info.levelup_time) / 4)
            for(var i=0; i<this.stars.length; i++){
                this.stars[i].draw()
            }
        }
    }
}

/** 星の情報を保持する */
class Star {
    /** 
     * コンストラクタ
     * @param {Vector} location 位置
     * @param {number} size 大きさ 
     */
    constructor(){
        this.location = createVector(random(1, 1000), random(1, 500))
        this.size = random(1, 5)
    }

    /** draw()で行う処理 */
    draw(){
        this.drawStar()
    }

    /** 星を描画する */
    drawStar(){
        noStroke()
        ellipseMode(CENTER)
        ellipse(this.location.x, this.location.y, this.size, this.size)
    }
}

/** エフェクトの情報を保持する */
class ScoreEffect {
    /** 
     * コンストラクタ
     * @param {Vector} location 位置
     * @param {Array} range_x x方向の範囲
     * @param {Array} range_y y方向の範囲
     * @param {color} color 色
     */
    constructor(location, range_x, range_y, color){
        /** @param {Vector} location 位置 */
        this.location = createVector(location.x, location.y)
        /** @param {Vector} velocity 速度 */
        this.velocity = createVector(random(range_x[0], range_x[1]), random(range_y[0], range_y[1]))
      
        /** @param {number} shape 形 */
        this.shape = int(random(0, 2))
        /** @param {number} size 大きさ */
        this.size = random(5, 10)
        /** @param {number} color 色 */
        this.color = color
      
        /** @param {number} angle 角度 */
        this.angle = 0
        /** @param {number} angular_velocity 角速度 */
        this.angular_velocity = random(-0.1, 0.1)
      
        /** @param {number} opacity 透明度 */
        this.opacity = random(250, 400)
    }

    /** draw()で行う処理 */
    draw(){
        this.update()
        this.drawEffect()
    }

    /** エフェクトを描画する */
    drawEffect(){
        noFill()
        stroke(this.color[0], this.color[1], this.color[2], this.opacity)
        strokeWeight(2)
        if(this.shape == 0){
            ellipseMode(CENTER)
            ellipse(this.location.x, this.location.y, this.size, this.size)
            
        }else{
            beginShape();
            for(var i=0; i<3; i++){
            vertex(this.location.x+cos(this.angle+i*2.0944)*this.size, this.location.y+sin(this.angle+i*2.0944)*this.size)
            }
            endShape(CLOSE);
        }
    }

    /** 情報を更新する */
    update(){
        this.location.add(this.velocity)
        this.velocity.x /= 1.05
        this.velocity.y /= 1.05
        this.velocity.y += 0.02

        this.angle += this.angular_velocity

        this.opacity -= 1.5
    }
}

/** テキストを表示する */
class RiseText {
    /**
     * コンストラクタ
     * @param {number} x x座標 
     * @param {number} y y座標
     * @param {string} text テキスト 
     */
    constructor(x, y, text){
        /** @param {Vector} location 位置 */
        this.location = createVector(x, y)
        /** @param {string} text テキスト */
        this.text = text
        /** @param {number} opacity 透明度 */
        this.opacity = 400
    }

    /** draw()で行う処理 */
    draw(){
        this.drawText()
        this.update()

    }

    /** テキストを描画する */
    drawText(){
        noStroke()
        fill(255, this.opacity)
        textSize(15)
        textAlign(LEFT)
        text(this.text, this.location.x, this.location.y)
    }

    /** メンバ変数を更新する */
    update(){
        this.opacity -= 3
    }
}

/** タイトル表示を行う */
class Title {
    /** コンストラクタ */
    constructor(){
        /** @param {number} opacity 透明度 */
        this.opacity = 0
        /** @param {boolean} in_transition 遷移中かどうか */
        this.in_transition = false
        /** @param {Image} image タイトル画面の背景 */
        this.image = loadImage('title.jpg')
    }

    /** draw()で行う処理 */
    draw(){
        this.update()
        this.transition()
        if(this.in_transition){
            this.drawTitle2()
        }else {
            this.drawTitle1()
        }
    }

    /** タイトル画面を描画する */
    drawTitle1(){
        background(33, 73, 104);
        image(this.image, 0, 0)
        noStroke()
        fill(255)
        textAlign(CENTER);
        textSize(50);
        text('LONG FLIGHT', 500, 230);
        fill(255, this.opacity)
        textSize(30)
        text("Click to start.", 500, 270)
        this.drawHowTo(375, 330)
    }

    /** クリック後の画面を描画する */
    drawTitle2(){
        background(0, this.opacity);
        noStroke()
        fill(20, 255, 255, this.opacity)
        textAlign(CENTER);
        textSize(50);
        text('LONG FLIGHT', 500, 230);
        textSize(30)
        text("start", 551, 270)
    }

    /** 操作方法を描画する */
    drawHowTo(x, y){
        noFill()
        stroke(255)
        strokeWeight(3)
        rectMode(CORNER)
        rect(x-20, y-10, 300, 100)

        this.drawCursor(x + 230, y + 30)

        noStroke()
        fill(255)
        textSize(20)
        textAlign(LEFT)
        text('・move with the mouse', x, y+30)
        text('・click to attack', x, y+60)
    }

    /** カーソルを描画する */
    drawCursor(x, y){
        noStroke()
        fill(255)
        beginShape()
            vertex(x, y)
            vertex(x, y+30)
            vertex(x+10, y+25)
            vertex(x+15, y+35)
            vertex(x+20, y+32)
            vertex(x+15, y+23)
            vertex(x+25, y+18)
        endShape(CLOSE)
    }

    /** メンバ変数を更新する */
    update(){
        if(!this.in_transition){
            if(this.opacity < 255){
                this.opacity+=3
            }
            if(this.opacity >= 255){
                this.opacity = 450
            }
        }else {
            this.opacity -= 3
        }
    }

    /** game_stateの更新を行う */
    transition(){
        if(this.in_transition){
            gameClass.draw();
            player.location.x = 500
            player.location.y = 250
            if(this.opacity == 0){
                game_state = 1
            }
        }
    }

    /** ゲームスタート */
    click(){
        if(!this.in_transition && this.opacity >= 255){
            gameClass = new Game()
            this.in_transition = true
            se_start.play()
        }
    }
}

/** ゲーム画面を描画する*/
class Game {
    /** コンストラクタ */
    constructor(){
        player = new Player()
        enemy_list = new EnemyList() 
        info = new Information()
        this.sky = new Sky()
        /** @param {number} end_time ゲーム終了時間 */
        this.end_time = millis()
        /** @param {boolean} in_transition 遷移中かどうか */
        this.in_transition = false
        /** @param {number} opacity 透明度 */
        this.opacity = -1200
    }

    /** draw()で行う処理 */
    draw(){
        this.update()
        //ゲーム終了後の表示
        if(this.in_transition){
            this.drawGame2()
        }
        //ゲームプレイ時の表示
        else{
            this.drawGame1()
        }
    }

    /** ゲームプレイ時の画面を描画する */
    drawGame1(){
        if(millis() - info.damaged_time > 300){
            this.sky.draw()
            bg_1.draw()
            bg_2.draw()
            bg_3.draw()
            enemy_list.draw()
            player.draw()
            info.draw()
        }
        //ダメージを受けた時の描画
        else {
            this.drawDamagedPlayer(true)
        }
    }

    /** ゲーム終了時の画面を描画する */
    drawGame2(){
        if(millis() - this.end_time < 400){
            this.drawDamagedPlayer(true)
        }else{
            this.drawDamagedPlayer(false)
        }

        fill(11, 23, 37, this.opacity)
        rectMode(CORNER)
        noStroke()
        rect(0, 0, 1000, 500)
    }

    /** メンバ変数を更新する */
    update(){
        if(!this.in_transition && info.hp <= 0){
            this.in_transition = true
            this.end_time = millis()
            bgm.stop()
        }
        if(this.in_transition){
            this.opacity += 20
            if(millis() - this.end_time > 1500){
                scoreClass = new Score()
                game_state = 2
            }
        }
    }

    /** ダメージを受けた時の描画を行う */
    drawDamagedPlayer(isShaking){
        this.sky.drawSky()
        bg_1.drawBackground()
        bg_2.drawBackground()
        bg_3.drawBackground()
        info.drawInformation()
        
        fill(11, 23, 37, 150)
        rectMode(CORNER)
        noStroke()
        rect(0, 0, 1000, 5000)

        if(isShaking){
            translate(random(-5, 5), random(-5, 5))
        }
        player.drawPlayer()
        resetMatrix()
    }

    /** プレイヤーの攻撃の追加を行う */
    click(){
        player.addAttack()
    }
}

/** スコア表示を行う */
class Score {
    /** コンストラクタ */
    constructor(){
        /** @param {number} opacity 透明度 */
        this.opacity = 0
        /** @param {number} score_counter スコアのカウンタ */
        this.score_counter = 0
        /** @param {number} time_counter 時間のカウンタ */
        this.time_counter = 0
        /** @param {Array} effect_list エフェクトを保持する配列 */
        this.effect_list = []
        /** @param {Image} image スコア表示画面の背景 */
        this.image = loadImage('score.png')
    }

    /** draw()で行う処理 */
    draw(){
        background(11, 23, 37);
        tint(255, (this.score_counter/info.score)*1275)
        image(this.image, 0, 0)
        this.drawEffect()
        this.update()
        this.drawScore()
    }

    /** スコアを描画する */
    drawScore(){
        noStroke()
        textAlign(CENTER);
        fill(255, this.opacity)
        textSize(40);
        text('Your score is', 500, 150);

        textSize(80)
        fill(255)
        text(int(this.score_counter), 500, 250)

        textSize(45)
        fill(255, this.time_counter)
        text('Thank you for playing!', 500, 330)
    }

    /** メンバ変数を更新する */
    update(){
        this.opacity += 7
        if(this.score_counter < info.score){
            this.score_counter += info.score / 90
            this.score_counter = Math.min(this.score_counter, info.score)
        }

        if(this.score_counter == info.score && this.time_counter <= 255){
            this.time_counter+=3
        }
    }

    /** エフェクトの移動と描画を行う*/
    drawEffect(){
        if(this.score_counter == info.score && this.effect_list.length == 0){
            for(var i=0; i<50; i++){
                this.effect_list.push(new ScoreEffect(createVector(500, 250), [-20, 20], [-10, 3], [255, 255, random(100, 255)]))
            }
            se_score.play()
            se_score.setVolume(0.5)
        }
        for(var i=0; i<this.effect_list.length; i++){
            this.effect_list[i].draw()
        }
    }

    /** game_stateの更新を行う */
    click(){
        if(this.time_counter >= 255){
            game_state = 0;
            titleClass = new Title()
            se_start.play()
        }
    }
}

var bg_1, bg_2, bg_3
var game_state
var player, enemy_list, info
var titleClass, gameClass, scoreClass
var bgm
var se_count, se_start, se_attack, se_drop, se_levelup, se_damage1, se_damage2, se_score

function setup(){
    createCanvas(1000, 500);
    textFont('Bahnschrift');
    game_state=0;
    titleClass = new Title()
    bg_1 = new Background(50, 0.3, 300, [color(97, 147, 165), color(69, 104, 120), color(12, 45, 79)])
    bg_2 = new Background(40, 0.5, 330, [color(86, 130, 146), color(39, 76, 97), color(4, 29, 56)])
    bg_3 = new Background(30, 1, 350, [color(66, 106, 124), color(1, 38, 63), color(0, 10, 27)])
    bgm = loadSound('sounds/bgm.mp3')
    se_start = loadSound('sounds/se_start.mp3')
    se_count = loadSound('sounds/se_count.mp3')
    se_attack = loadSound('sounds/se_attack.mp3')
    se_drop = loadSound('sounds/se_drop.mp3')
    se_levelup = loadSound('sounds/se_levelup.mp3')
    se_damage1 = loadSound('sounds/se_damage1.mp3')
    se_damage2 = loadSound('sounds/se_damage2.mp3')
    se_score = loadSound('sounds/se_score.mp3')
}

function draw(){
    background(0);
    fill(255);
    switch(game_state) {
        case 0:
            titleClass.draw()
            break;
        case 1:
            gameClass.draw();
            break;
        case 2:
            scoreClass.draw()
            break;
    }
}

function mouseClicked(){
    switch(game_state){
        case 0:
            titleClass.click()
            break
        case 1:
            gameClass.click()
            break
        case 2:
            scoreClass.click()
            break
    }
}