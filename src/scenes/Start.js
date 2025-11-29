export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/LandingBackground.PNG');
        this.load.image('logo', 'assets/Abstract.PNG');
        this.load.image('play-button', 'assets/PlayButton.PNG');

        this.load.image('cloud1', 'assets/Cloud1.PNG');
        this.load.image('cloud2', 'assets/Cloud2.PNG');
        this.load.image('cloud3', 'assets/Cloud3.PNG');
    }

    create() {
        // --- Background ---
        this.background = this.add.image(640, 350, 'background');

        this.clouds = [];

        // Define evenly spaced Y positions (none above Abstract)
        const yPositions = [150, 70, 250, 390, 580, 650];

        // Define textures and speeds for each row
        const cloudTypes = [
            { texture: 'cloud1', scale: 0.5, speed: 0.25 },
            { texture: 'cloud3', scale: 0.6, speed: -0.2 },
            { texture: 'cloud2', scale: 0.45, speed: 0.15 },
            { texture: 'cloud1', scale: 0.55, speed: -0.25 },
            { texture: 'cloud1', scale: 0.4, speed: -0.15 },
            { texture: 'cloud3', scale: 0.45, speed: 0.1 },
        ];

        // --- Main larger clouds (evenly spaced but random X starting points) ---
        for (let i = 0; i < yPositions.length; i++) {
            const x = Phaser.Math.Between(100, 1180);
            const { texture, scale, speed } = cloudTypes[i % cloudTypes.length];
            const cloud = this.add.image(x, yPositions[i], texture);
            cloud.setScale(scale);
            cloud.speed = speed;
            cloud.setDepth(0);
            this.clouds.push(cloud);
        }

        // --- Additional small clouds (also evenly spaced, smaller, random X) ---
        const smallCloudYPositions = [190, 270, 350, 430, 510, 590];
        for (const y of smallCloudYPositions) {
            const x = Phaser.Math.Between(0, 1280);
            const texture = Phaser.Math.RND.pick(['cloud1', 'cloud3']);
            const cloud = this.add.image(x, y, texture);
            cloud.setScale(0.25 + Math.random() * 0.1); // smaller size
            cloud.speed = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.1);
            cloud.setDepth(0);
            this.clouds.push(cloud);
        }

        // --- Logo (Abstract) ---
        const logo = this.add.image(640, 360, 'logo');
        logo.setScale(0.7);
        logo.setDepth(1);

        // --- Play button ---
        const playbutton = this.add.image(640, 450, 'play-button').setInteractive();
        playbutton.setScale(0.2);
        playbutton.setDepth(2);

        playbutton.on('pointerdown', () => {
            this.scene.start('Map');
        });
    }

    update() {
        // --- Move clouds slowly across the screen ---
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed;

            if (cloud.speed > 0 && cloud.x > 1380) cloud.x = -100;
            if (cloud.speed < 0 && cloud.x < -100) cloud.x = 1380;
        }
    }
}
