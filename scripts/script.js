window.addEventListener('load', function(){
  // Auf canvas-Objekt referenzieren
  const canvas = document.getElementById('canvas1');
  
  const ctx = canvas.getContext('2d');
  canvas.width = 1000;
  canvas.height = 500;


  // Alle Spielereingaben behandeln
  class InputHandler {
    constructor(game){
      this.game = game;
      // Eine "Arrow Function" bewirkt, dass das "this"-Schlüsselwort darin immer das Objekt repräsentiert, in der die Arrow Function definiert wurde. So wird der Fehler behoben und das Programm weiß dauerhaft auf welche Adresse "this.game" in dem Kostruktor in der "InputHandler"-Klasse verweist. So können jetzt dem Array "keys[]" die gedrückten Tasten hinzugefügt werden.
      // Alternativ mit bindValue()-Funktion möglich.
      window.addEventListener('keydown', e => {
        // Prüfen ob ArrowUp gedrückt wurde und ob dieser noch nicht im Array ist
        // indexOf() gibt -1 zurück, wenn das gesuchte Element NICHT existiert
        if  ((
          (e.key === 'ArrowUp') ||
          (e.key === 'ArrowDown')
        ) && this.game.keys.indexOf(e.key) === -1){
          // Beim Ausführen dieser Callback Funktion,weiß das Programm nichtmehr auf welche Adresse "this.game" verweist
          this.game.keys.push(e.key);
        } else if(e.key === ' '){   // Wenn Leertaste gedrückt
          this.game.player.shootTop();  // Auf die Eigenschaften von "this.game" aus Zeile 13 Zugreifen und dort auf die Eigenschaften von der Klasse "Player" und dioe shootTop() Methode ausführen.
          // Dazu wurde in der Klasse "Game" mittels "this.player = new Player(this);" auf die Klasse "Player" referenziert (durch "this" = dynamisch)
          // DEBUG MODUS (Aktivieren mit "d")
        } else if (e.key === 'd') {
          this.game.debug = !this.game.debug;
        }
        console.log(this.game.keys);
      });
      // Event beim loslassen der Taste
      window.addEventListener('keyup', e =>{
        // Prüfen ob Array "keys" die gedrückte Taste enthält
        if(this.game.keys.indexOf(e.key) > -1){
          // Entfernt die gedrückte Taste aus dem Array, wenn diese gefunden wird
          //Syntax: splice(Elemente entfernen ab Index, Anzahl der zu entfernenden Elemente);
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
        console.log(this.game.keys);
      });
    }
  }

  class Projectile {
    // Argumente: "game" um auf die Eigenschafte des Objekts "Game" zugreifen zu können und "x, y" um auf die aktuelle Spielerposition zugreifen zu können, damit die Projektile an der richtigen Stelle erscheinen
    constructor(game, x, y){
      this.game = game;
      this.x = x; // Aktuelle X-Koordinate | Koordinaten 0-Punkt: Ecke oben links
      this.y = y; // Aktuelle Y-Koordinate
      this.width = 10;  // Projektilbreite
      this.height = 3;  // Projektilhöhe
      this.speed = 3;   // Projektilgeschwindigkeit
      this.markedForDeletion = false; // Entfernt Projektile sobald "true"
      this.image = document.getElementById('projectile');
    }
    update(){
      // Updated die Bewegung mit dem Wert aus dem Konstruktor in der Klasse "Projectile" (Z. 49)
      this.x += this.speed;
      // WENN x Koordinate 80% der Breite des Spiels erreicht hat, soll Projektil entfernt werden
      if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context){
      context.drawImage(this.image, this.x, this.y);
    }
  }

  class Particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById('gears');
      this.frameX = Math.floor(Math.random() * 3); // Zufälliges Bruchstück horizontal
      this.frameY = Math.floor(Math.random() * 3); // Zufälliges Bruchstück vertikal
      this.spriteSize = 50; // Bruchstückbreite
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX= Math.random() * 6 - 3; // Generiert zufälligen Wert zwischen -3 und 3. Bei negativem Wert bewegen sich Bruchstücke nach links, bei positivem nach rechts
      this.speedY = Math.random() * -15; // Generiert zufälligen Wert zwischen 0 und -15. Bruchstücke bewegen sich immer erst nach oben um 15px und dann vertikal nach unten
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1; // Zufällige Rotation der Bruchstücke (velocity of angle)
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random() * 80 + 60; // Partikel hüpfen zwischen 60 und 100 Pixel vom Boden aus entfernt
    }
    update() {
      this.angle += this.va; // Rotationswinkel "angle" um Wert von "va" erhöhen
      this.speedY += this.gravity;  // "speedY" um Wert von "gravity" erhöhen um Kurve in Bewegung zu bringen
      this.x -= this.speedX + this.game.speed; // Partikel Bewegung horizontal
      this.y += this.speedY; // "speedY" Wert anwenden, der von "gravity" betroffen ist, zu der vertikalen Koordinate jedes Partikels
      if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true; // Wenn der Partikel außerhalb des sichtbaren vertikalen Spielfelds ist oder das Spielfeld daran horizontal vorbeiscrollt, diesen entfernen
      if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }
    draw(context) {
      context.save(); // save() & restore() nutzen, damit sich nur 1 spezifischer Partikel der zwischen diesem Code definiert wird dreht und nicht alle
      context.translate(this.x, this.y); // Rotationspunkt: aktuelle X & Y Position des Partikels (Standard Rotationspunkt: X & Y = 0, entspricht Ecke oben links)
      context.rotate(this.angle);
      context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
      context.restore();
    }
  }

  // Referenzdatentyp (Objekt) auf die Klasse "game" mittels Konstruktor erzeugen. So werden Änderungen in der Klasse "Game" bei Änderungen dynamisch und sofort in der Klasse "Player" sichtbar

  class Player {
    // Die Konstruktoren-Methode in der Klasse "Player" benötigt das Argument "game". Daher wird in der Klasse "Game" mittels "this.player = new Player(this);" mittels dem "this" Keyword das gesamte 
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      // Standard: Keine vertikale Bewegung / Manuell anpassen für Animation
      // - Werte bewegen Rechteck hoch | 0 Werte bewegt sich nichts | + Werte bewegen Rechteck runter
      this.speedY = 0;
      this.maxSpeed = 3;
      this.projectiles = [];  // Speichert alle aktuellen Projektile
      this.image = document.getElementById('player');
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
    }
    // Position des Charakters updaten
    update(deltaTime) {
      // Spielerverhalten je nach gedrückten Tasten ändern
      // Funktioniert, da der Array "this.keys" in dem Objekt "Game" steht und die Klasse "Player" mittels "this.game = game" auf das Objekt "Game" referenziert und sich somit der Array dynamisch und automatisch anpasst, sobald eine Taste gedrückt wurde (Tasten in InputHandler-Klasse definiert)
      // indexOf() prüft ob genannter Index vorhanden ist
      // includes() prüft ob String im Array vorhanden
      if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
      // Ohne diese Anweisung bewegt sich das Objekt ohne anzuhalten
      else this.speedY = 0;
      this.y += this.speedY;
      // Vertikale Grenzen
      if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
      else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
      // Projektile behandeln
      // Für jedes Element in dem Array "projectiles" wird die "update()" Methode aus der Klasse "Projectile" aufgerufen
      // Diese Methode prüft die Position und setzt "markedForDeletion" auf "true", sobald die definierte Bildschirmposition mit dem Projektil erreicht wurde
      this.projectiles.forEach(projectile => {
        projectile.update();
      });
      // Projektile die entfernt werden sollen filtern
      // filter() erstellt einen neuen Array, der alle Elemente beinhalten, die mit der Überprüfung in den Klammern übereinstimmen ("!projectile.markedForDeletion" = alle Projektile, deren "markedForDeletion" Wert "false" ist)
      // Werte werden dann im Array "projectiles" mit allen gefilterten Werten überschrieben
      // Alle Projektile deren Wert von "markedForDeletion" auf "true" steht, werden somit entfernt
      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
      // Seepferd Spieler Animation
      if (this.frameX < this.maxFrame){
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      // Power Up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0; // Power Up Timer zurücksetzen
          this.powerUp = false; // Power Up Modus deaktivieren
          this.frameY = 0; // Player standard Animation
        } else {
          this.powerUpTimer += deltaTime; 
          this.frameY = 1; // Player leuchtend animieren (2. Reihe im Sprite)
          this.game.ammo += 0.1; // Erhöhte Munitionsgeneration
          //  Sonst PowerUp Timer hochzählen lassen
          // deltaTime wird in der "Game" Klasse erstellt und die Funktion update() in der Player-Klasse wird diese als Argument (zu erwartender Wert) hinzugefügt. deltaTime wird dann an die Klasse update()-Funktion in der Klasse "Game" übergeben
        }
      }

    }
    draw(context){
      // Erstellt Rechteck an festgelegter x & y Position mit gegebenen Maßen
      if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
      // Zeichnet jedes Projektil
      this.projectiles.forEach(projectile => {
        projectile.draw(context);
      });
      // Player zeichnen
      // Syntax: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    }
    shootTop(){
      // Erstellt Projektil nur, wenn Munition verfügbar
      if(this.game.ammo > 0){
        // Fügt die aktuellen Projektile dem Array "projectiles" hinzu
        // "new Projectile()" benötigt die Argumente, die in dem Konstruktor der Klasse "Projectile" festgelegt wurden
        // "this.x + 80" legt fest wo das Projektil auf x-Achse erstellt wird
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
        this.game.ammo--; // Nach der Erstelung eines Projektils Munition um 1 verringern
      }
      if (this.powerUp) this.shootBottom();
    }
    shootBottom(){
      if (this.game.ammo > 0) {
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
      }
    }
    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo; // Setzt Munition nur auf Max Ammo Wert, wenn dieser noch nicht erreicht wurde
    }
  }

  class Enemy {
    constructor(game){
      this.game = game; // Alle Gegner brauchen Zugriff zu dem Hauptspiel Objekt
      this.x = this.game.width; // Gegner Startkoordinaten
      this.speedX = Math.random() * -1.5 - 0.5;// Zufällige Horizontale Bewegungsgeschwindigkeit (negativ, weil von rechts nach links bewegen soll)
      this.markedForDeletion = false; // Variable zum Gegener von Canvas entfernen
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }
    update(){
      this.x += this.speedX - this.game.speed; // Horizontale Koordinate updaten für Bewegung
      if(this.x + this.width < 0) this.markedForDeletion = true;  // Gegner soll entfernt werden, wenn linke Seite des Bildschirms erreicht. "this.x + this.width" ist die aktuelle x-Koordinate + Breite des Gegners
      // Sprite Animation
      if (this.frameX < this.maxFrame){
        this.frameX++;
      } else this.frameX = 0;
    }
    draw(context){
      if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
      if (this.game.debug) {
        context.font = '20px Helvetica'
        // fillText()-Syntax:
        // fillText(text, x, y) | fillText(text, x, y, maxWidth)
        context.fillText(this.lives, this.x, this.y); // TESTAUSGABE der Leben der Gegner bei deren x und y Koordinate
      }
    }
  }

  // Unterklasse von Enemy erstellen | Vererbung | Hat Zugriff auf die Eigenschaften und Methoden der Superklasse "Enemy".
  // Wird in dieser Klasse eine Eigenschaft oder eine Methode aufgerufen, wird diese wenn Sie nicht hier definiert wird, automatisch aus der Superklasse "Enemy" übernommen.
  // Wird genutzt um Codewiederholung zu vermeiden und reduziert Fehleranfälligkeit.
  class Angler1 extends Enemy {
    constructor(game){  // Konstruktor erstellen, da Angler1 einige eigene Attribute und Methoden haben soll. Wird dieser nicht erstell, wird automatisch der Konstruktor der Klasse "Enemy" genutzt.
    // Um den die Methoden und Attribute der "Enemy"-Klasse zu übernehmen und zusätzlich Methoden und Attribute aus der "Angler1"-Klasse zu verwenden, nutzt man das "super"-Schlüsselwort. Damit referenziert man auf den Konstruktor der Elternklasse "Enemy" und der Code in dem "Enemy" Konstruktor wird ausgeführt. "super" MUSS im Konstruktor der Subklasse als ERSTES ausgeführt werden.
      super(game);
      this.width = 228; // Breite des Gegners
      this.height = 169;  // Höhe des Gegners
      this.y = Math.random() * (this.game.height * 0.95 - this.height); //  Zufälliger Bereich in dem Gegner spawned mit min. 10% Abstand zum Boden. "this.heigt" ist die Höhe des Gegners die noch von der Höhe abgezogen wird
      this.image = document.getElementById('angler1');
      this.frameY = Math.floor(Math.random() * 3); // Zeile im Sprite Sheet
      this.lives = 5;
      this.score = this.lives;  // Punkte für Gegner, basierend auf Lebenswert
    }
  }

  class Angler2 extends Enemy {
    constructor(game){ 
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('angler2');
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 6;
      this.score = this.lives;  // Punkte für Gegner, basierend auf Lebenswert
    }
  }

  class LuckyFish extends Enemy {
    constructor(game){ 
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('lucky');
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 5;
      this.score = 15;  // Punkte für Gegner, statisch
      this.type = 'lucky';
    }
  }

  class HiveWhale extends Enemy {
    constructor(game){ 
      super(game);
      this.width = 400;
      this.height = 227;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('hivewhale');
      this.frameY = 0;
      this.lives = 20;
      this.score = this.lives;  // Punkte für Gegner, statisch
      this.type = 'hive';
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  // Gegner die aus zerstörtem HiveWhale komen
  class Drone extends Enemy {
    // Mit x & y aktuelle Position des HiveWhales übergeben
    constructor(game, x, y){ 
      super(game);
      this.width = 115;
      this.height = 95;
      this.x = x;
      this.y = y;
      this.image = document.getElementById('drone');
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 3;
      this.score = this.lives;  // Punkte für Gegner, statisch
      this.type = 'drone';
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }

  // Handhabt Hintergrundlogik für jeden individuellen Hintergrund
  class Layer {
    constructor(game, image, speedModifier){  // Erwartete Parameter
      this.game = game; // Parameter in Klasseneigenschaften umwandeln
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }
    // Hintergründe bewegen
    update(){
      // Wenn x-Koordinate weniger oder gleich wie die Breite aus dieser Klasse (Heißt wenn Hintergrund einmal durchgelaufen) wird x zurück auf 0 gesetzt, damit der Hintergrund erneut durchlaufen kann
      if(this.x <= -this.width) this.x = 0;
      // Sonst soll der Hintergrund in der global definierten Spielgeschwindigkeit laufen und mit dem der Geschwindigkeit der aktuellen Hintergrundebene multipliziert werden. So kann die Geschwindigkeit für alle 4 Ebenen an einer Stelle festgelegt werden.
      this.x -= this.game.speed * this.speedModifier;
    }
    draw(context){
      // Vordefinierte drawImage()-Methode | benötigt 3 Argumente: Bild das gezeichnet werden soll, x-Position, y-Position
      context.drawImage(this.image, this.x, this.y);
      // Wiederholt den Hintergrund unendlich
      context.drawImage(this.image, this.x + this.width, this.y)
    }
  }


  // Handhabt alle Hintergründe um die Spielwelt zu generieren
  class Background {
    constructor(game){  // "game"-Objekt als Argument übergeben
      this.game = game; // Objekt in Klasseneigenschaft konvertieren
      this.image1 = document.getElementById('layer1');  // Bilder für Hintergrund mittels JS selektieren (layer1 = ID aus index.html-Datei)
      this.image2 = document.getElementById('layer2');
      this.image3 = document.getElementById('layer3');
      this.image4 = document.getElementById('layer4');
      // this.layer1-Eigenschaft wird ein Objekt sein, dass eine Instanz der Klasse "Layer" (für den Hintergrund) beinhaltet. Der Konstruktor in der Klasse "Layer" erwartet 3 Argumente. "this.game" kommt von der Klasse "Background" aus dem Konstruktor. "this.image1" auch. Das 3. Argument ist der "speedModifier" aus der Klasse Layer. speedModifiert hier anpassen um die Bewegungsgeschwindigkeit des Hintergrunds anzupassen.
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);

      // Alle Hintergrundobjekte in einem Array speichern. Sobald die einzelnen Objekte dem Array hinzugefügt werden, werden diese gezeichnet.
      this.layers = [this.layer1, this.layer2, this.layer3];
      }
      // update()-Methode soll alle Hintergrundobjekte bewegen
      update(){
        // Für jedes Element in dem Array "layers" die zugehörige update()-Methode aus der Klasse "Layer" aufrufen
        this.layers.forEach(layer => layer.update());
      }
      // draw()-Methode soll alle Hintergrundobjekte zeichnen
      // Erwartet das "context"-Argument um auszusagen, auf welchem Canvas man zeichnen möchte
      draw(context){
        // Für jedes Element in dem Array "layers" die zugehörige draw()-Methode aus der Klasse "Layer" aufrufen und den Inhalt von "context" übergeben, da die draw()-Methode aus der Klasse "Layer" das "context" Objekt als Argument erwartet
        this.layers.forEach(layer => layer.draw(context));
      }
  }

  class Explosion {
    constructor(game, x, y){
      this.game = game;
      this.frameX = 0;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
      this.fps = 20;
      this.timer = 0;
      this.interval = 1000/this.fps;
      this.markedForDeletion = false;
      this.maxFrame = 8;
    }
    update(deltaTime){
      this.x -= this.game.speed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if(this.frameX > this.maxFrame) this.markedForDeletion = true;
    }
    draw(context){
      // Explosionen zeichnen
      context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
  }

  class SmokeExplosion extends Explosion {
    constructor(game, x, y){
      super(game, x, y);
      this.image = document.getElementById('smokeExplosion');
    }
  }

  class FireExplosion extends Explosion {
    constructor(game, x, y){
      super(game, x, y);
      this.image = document.getElementById('fireExplosion');
    }
  }

  class UI {
    constructor(game){  // Erwartet Parameter "game"
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = 'Bangers';
      this.color = 'white';
    }
      // UI benötigt nur draw()-Methode und keine update()-Methode, da Aussehen statisch ist
    draw(context){
      // Speicher aktuellen Zustand des Canvas-Kontextes. Ohne diese Maßnahme würden die folgenden definierten Schatten auch auf die Zeichnungen der Klasse "Player" und "Enemy" angewandt werden. So werden die Änderungen nur auf Texte und Formen in diesem Codebereich zwischen save() und restore() angewandt
      context.save();
      // Setzt Farbe auf den Wert von "this.color" aus dieser Klasse UI
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = 'black';
      context.font = this.fontSize + 'px ' + this.fontFamily;
      // Score (Zeichnet aktuelle Punktzahl bei Koordinaten x = 20 / y = 40)
      context.fillText('Score: ' + this.game.score, 20, 40);
      // Timer fillText(text, x, y)
      // toFixed() gibt die Anzahl der Stellen nach dem Dezimalpunkt an
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      // Vorher: context.fillText('Timer: ' + this.game.gameTime, 20, 100);
      context.fillText('Timer: ' + formattedTime, 20, 100);
      // Game Over Meldung
      if(this.game.gameOver) { // Wenn "gameOver"-Attribut der Klasse "Game" gleich "true"
        context.textAlign = 'center';
        let message1;
        let message2;
        if(this.game.score > this.game.winningScore){
          message1 = 'You Win!';
          message2 = 'Good Boi!';
        } else {
          message1 = 'You lose!';
          message2 = 'Try again next time!';
        }
        context.font = '120px ' + this.fontFamily;
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);
        context.font = '60px ' + this.fontFamily;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 80); // 50px margin
      }
      // Munition zeichnen
      if(this.game.player.powerUp) context.fillStyle = '#ffffbd'; // Munitionsleiste färben während PowerUp Modus
      for(let i = 0; i < this.game.ammo; i++){
        context.fillRect(20 + 5 * i, 50, 3, 20); // Wird bei Koordinaten x = 20 & y = 50 gezeichnet mit 3px Breite und 20px Höhe (Parameter definiert in Klasse "Projectile" "context.fillRect(this.x, this.y, this.width, this.height);"
      }
      context.restore();  // Stellt zuvor gespeicherten Canvas-Kontext wieder her
    }
  }

  // Gesamte Logik des Programms muss hier implementiert werden
  // Der Gesamte Code des Konstruktors wird ausgeführt, sobald eine Instanz der Klasse "Game" erstellt wird. Wird die Instanz "Game" erstellt, soll auch automatisch eine Instanz der Klasse "Player" erstellt werden. Dadurch wird die Klasse "Player" eine Instanz-Eigenschaft der "Game"-Klasse.
  class Game {
    constructor(width, height){
      this.width = width; // Spielfeldbreite
      this.height = height; // Spielfeldhöhe
      // Instanz der Klasse "Background". Erwartet "game" als Argument, daher "(this)", weil man sich hier in der Klasse "Game" befindet
      this.background = new Background(this);
      // Führt Code des Konstruktoren in der Klasse "Player" aus.
      // this referenziert auf das Gesamte Objekt der Klasse "Game"
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this); // Übergabe des parameters Game (siehe Klasse "UI")
      // Alle gerade gedrückten Tasten in diesem Array speichern
      this.keys = []; // Gedrückte Tasten Array
      this.enemies = [];  // Alle Gegner Array
      this.particles = []; // Alle Partikel Array
      this.explosions = []; // Alle Explosionen Array
      this.enemyTimer = 0;  // Timer um Gegner periodisch erscheinen zu lassen
      this.enemyInterval = 2000;  // Gegner alle 1000ms (1sec) spawnen
      this.ammo = 20; // Verfügbare Munition
      this.maxAmmo = 50;  // Maximal tragbare Munition
      this.ammoTimer = 0; // Helfervariable um Timer nach erzeugter Munition wieder auf 0 zu setzen
      this.ammoInterval = 350;  // Intervall, nach dem eine Munition erzeugt wird
      this.gameOver = false;  // Game Over Helfervariable
      this.score = 0; // Initialer Score Wert
      this.winningScore = 100; // Benötigte Punktzahl zum Sieg
      this.gameTime = 0;  // Zeit in ms, seit Spielstart
      this.timeLimit = 30000; // Zeitlimit bis zur Niederlage
      this.speed = 0.5; // Vertikale Bewegungsgeschwindigkeit Spielfeld
      this.debug = false;  // Debug Modus Helfervariable (Standard = deaktiviert)
    }
    // Übernimmt die Eigenschaften von "this.Player" (Zeile 69), die eine Instant der Klasse "Player" beinhaltet und führt die in der Klasse "Player" definierten Funktion "update()" aus
    update(deltaTime){  // Wert deltaTime übergeben, da dieser in Z.199 als Parameter definiert wurde. deltaTime ist der Zeitunterschied in ms aus dieser Animationsschleife und der vorgherigen. Es ist also die Anzahl der ms zwischen den Frames
      if(!this.gameOver) this.gameTime += deltaTime;
      if(this.gameTime > this.timeLimit) this.gameOver = true;  // Wenn "timeLimit" erreicht = Game Over
      // update()-Methode von der Klasse "Background" aufrufen
      this.background.update();
      this.background.layer4.update();
      this.player.update(deltaTime);
      if(this.ammoTimer > this.ammoInterval){
        if(this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;  // Hier wird der deltaTime Wert genutzt
      }
      this.particles.forEach(particle => particle.update());
      this.particles = this.particles.filter(particle => !particle.markedForDeletion);
      this.explosions.forEach(explosion => explosion.update(deltaTime));
      this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);
      this.enemies.forEach(enemy => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)){
          enemy.markedForDeletion = true; // markedForDeletion wird zum entfernen des Gegners auf "true" gesetzt, wenn Spieler mit Gegner kollidiert
          this.addExplosion(enemy);
          for (let i = 0; i < enemy.score; i++) {
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
          }
          if(enemy.type === 'lucky') this.player.enterPowerUp(); // Power Up Modus aktivieren, wenn Lucky Fish eingesammelt wird | muss Strikt sein "==="
          else if (!this.gameOver) this.score--; // Bei Kollision mit anderem Gegner, Punkte verringern
        }
        // Gegner Kollision mit Projektil prüfen
        // Prüft jedes Projektil aus "projectiles"-Array mit jedem Gegner aus dem "enemies"-Array
        this.player.projectiles.forEach(projectile => {
          // WENN Projektil mit Gegner kollidiert
          if (this.checkCollision(projectile, enemy)){
            enemy.lives--;  // Gegner Leben um 1 reduzieren
            projectile.markedForDeletion = true;  // Projektil entfernen
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            if(enemy.lives <= 0) {  // WENN Gegner Leben kleiner gleich 0
              for (let i = 0; i < enemy.score; i++) {
                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
              }
              enemy.markedForDeletion = true; // Gegner entfernen
              this.addExplosion(enemy); // Explosion hinzufügen
              if (enemy.type === 'hive') {
                for(let i = 0; i < 5; i++ ) {
                  this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height * 0.5));
                }
              }
              // Punktzahl um den Punktewert des Gegners erhöhen, wenn "gameOver" gleich "false" ist
              if(!this.gameOver) this.score += enemy.score;
              // this.score++; // Punktzahl um 1 erhöhen
              // if(this.score > this.winningScore) this.gameOver = true;
            }
          }
        })
      });
      // Gegner filtern, die "markedForDeletion" Wert true haben (siehe Projektile/selbes Muster). Das ist die Gegner update-Methode.
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
      // Steuern wann neuer Gegner erscheinen soll & ob Spiel vorbei ist (dann sollen keine mehr spawnen)
      if (this.enemyTimer > this.enemyInterval && !this.gameOver){
        this.addEnemy();  // Gegner hinzufügen wenn Prüfung erfolgreich
        this.enemyTimer = 0;  // Gegner Spawn-Timer zurücksetzen
      } else {  // Wenn enemyTimer größer ist als enemyInterval
        this.enemyTimer += deltaTime; // DANN enemyTimer um deltaTime erhöhen. deltaTime wird an die update()-Methode in dieser "Game"-Klasse übergeben (Z. 212)
      }
    }
    // Reihenfolge der gezeichneten Ebenen
    // Erwartet Argument "context", da so in Klasse "Player" definiert
    draw(context){
      // draw()-Methode auf dem "Background"-Objekt aufrufen und "context" als Argument übergeben. Reihenfolge ist wichtig, zuerst der Hintergrund, dann der Spieler, damit der Hintergrund hinter dem Spieler ist.
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      this.particles.forEach(particle => particle.draw(context));
      // Jeden Gegner im Array Zeichnen
      this.enemies.forEach(enemy => {
        enemy.draw(context);
      });
      this.explosions.forEach(explosion => {
        explosion.draw(context);
      });
      this.background.layer4.draw(context); // Zeichnet Layer 4 VOR dem Spieler
    }
    // Aktive Gegner einem Array hinzufügen
    addEnemy(){
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Angler1(this));  // Angler 1 hinzufügen
      else if (randomize < 0.6) this.enemies.push(new Angler2(this)); // Angler 2 hinzufügen
      else if (randomize < 0.7) this.enemies.push(new HiveWhale(this)); // HiveWhale hinzufügen
      else this.enemies.push(new LuckyFish(this));  // LuckyFish hinzufügen
      // Erwartet "game" als Parameter (In "Enemy"-Klasse definiert). "this" referenziert auf die Klasse "Game", da der Code hier innerhalb der "Game"-Klasse steht
      // console.log(this.enemies); TESTAUSGABE ob Gegner die vom Bildschirm verschwinden auch vom Array entfernt werden
    }
    addExplosion(enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
      // console.log(this.explosions); Genutzt zum debuggen
      } else {
        this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
      }
    }
    checkCollision(rect1, rect2){
      return( rect1.x < rect2.x + rect2.width && 
              rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height &&
              rect1.height + rect1.y > rect2.y )
    }
  }
  // Erstellt Instanz der Klasse "Game"
  // Konstruktor der Klasse "Game" erwartet "(width, height)" als Argumente, daher werden "canvas.width = 1500;" und "canvas.height = 500;" übergeben (Zeile 6 + 7)

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0; // Variable zum Speichern des Timestamp-Werts der vorherigen Animationsschleife
  // Animations Schleife
    requestAnimationFrame(animate);
  // "timeStamp" ist der selbstdefinierte Variablenname
  // Die Variable erhält den Timestamp Wert der mittels "requestAnimationFrame(animate);" übergeben wurde
  // Die Variable "timeStamp" wird genutzt um den Zeitunterschied zu kalkulieren
  function animate(timeStamp){
    // Variable zum Vergleichen des Timestamp-Werts der aktuellen Animationsschleife
    // deltaTime soll den Zeitunterschied speichern
    const deltaTime = timeStamp - lastTime;
    // console.log(deltaTime);  TESTAUSGABE - ENTFERNEN NACH TESTEN
    lastTime = timeStamp; // Überschreibt den Wert von "lastTime"
    // Bereinigt Canvas von Position X & Y: 0, 0 bis zum aktuellen gezeichneten Rechteck "canvas.width, canvas.height"
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime); // deltaTime übergeben um periodische Events im Spiel einbauen zu können oder die Zeit zu messen (mit dieser Technik wird die deltaTime in ms in Echtzeit übergeben und die Reaktionen sind bei schnellen und langsamen Rechnern gleich - egal wie schnell diese die Animationen rendern können)
    // Argument übergeben, auf welchem Canvas gezeichnet werden soll (Zeile 5)
    // Weist den Browser an die Funktion "animate()" auszuführen, bevor erneut ein "Repaint" (neue Zeichnung) ausgeführt wird. Durch das Übergeben der Elternfunktion "animate()" wird eine unendliche Animationsschleife erstellt.
    // Die Methode passt die Bildschirmwiederholungsrate des Nutzers an und erstellt automatisch ein Zeitstempel-Argument, das an seine Callback-Funktion übergeben wird. (hier "animate()")
    // Die vordefinierte Funktion requestAnimationFrame() gibt automatisch einen TimeStamp Wert in ms an die Funktion, die aufgerufen wird (hier: "animate()")
    requestAnimationFrame(animate);
  }
  // Erstellt die Animation. Aktuell statisch und kann in Zeile 33 unter "this.speedY" manuell angepasst werden
  animate(0); // 0 = Erster Zeitstempel Wert
});
