# 🚢 Ship Fighter

A little naval battle game for **two players sharing one phone, tablet, or computer**. Hide your fleet, take turns choosing targets, and sink your opponent’s ships before they sink yours.

**[▶ Play Ship Fighter](https://mahahmadi360.github.io/MAH.ShipFighter/)** — no account, download, or setup needed.

## A quick note about this project

**This project is 100% vibe-coded.** I supplied the ideas, prompts, and feedback; AI generated all of the application code. None of the application code was handwritten by me.

I made it for fun, to play with friends and family, and to experiment with what AI tools can build. This repository is **not a portfolio piece or a demonstration of my professional coding style, software design, or engineering standards**. It is a small, playful experiment—not a programming tutorial or a production-ready reference.

If you enjoy playing it, it has done its job. 🙂

## How to play

### 1. Place your ships

Enter a name on each player’s ready screen (or leave it blank to use Player 1 / Player 2). Names appear on the boards and in the winner announcement.

Player 1 arranges their fleet on a **10 × 10** grid, then presses **Confirm fleet**. Pass the device to Player 2, who does the same. Keep your setup hidden from the other player!

Each player has **five ships**, covering **17 cells** altogether:

| Ship | Length |
| --- | --- |
| Carrier | 5 cells |
| Battleship | 4 cells |
| Cruiser | 3 cells |
| Submarine | 3 cells |
| Destroyer | 2 cells |

Drag a ship to move it. Tap it to rotate it 90° through all four directions. During setup, ships may overlap or extend outside the grid, as long as at least one cell stays inside so you can drag them back. Conflicting ships are highlighted and **Confirm fleet** stays disabled until every ship is entirely inside the grid with no overlaps. The shuffle button gives you a random arrangement.

### 2. Take turns firing

Player 1 starts. Select an unmarked cell on your active grid, then press **Confirm shot** between the two boards. Selecting a cell alone does not fire; you can change your target before confirming.

- **Red with an explosion:** you hit an enemy ship.
- **White with waves:** your shot landed in the water.
- Every confirmed shot ends the turn, whether it hits or misses.

Both grids stay visible and show each player’s shots at the opposing fleet. They sit beside each other on a large screen and stack vertically on a phone. The active player’s grid grows larger, and the page background turns **blue for Player 1** or **red for Player 2**. Unhit enemy ships stay hidden.

### 3. Sink the whole fleet

The first player to hit **all 17 cells** of the opposing fleet wins. Choose **View results** to reveal both opposing fleets on the targeting grids, including the cells the losing player never found. Each complete hull keeps its outline and length label; pale markings inside the hull show which individual cells were hit. Want a rematch? Press **New Game** and confirm the restart.

## Play it your way

- **Sound:** gentle sea ambience, an explosion for a hit, and a splash for a miss. Use the speaker button to turn audio on or off. Browsers may need your first tap before sound can start.
- **Pick up where you left off:** the game saves progress in the same browser on the same device.
- **Install on your phone:** open the game in your browser and choose **Install app / Add to Home Screen**. On iPhone, use Safari → Share → Add to Home Screen.
- **Play offline:** after the online app has loaded and cached successfully, you can play without a connection.

Built with **Angular**, entirely in the browser. There is no backend, login, or remote multiplayer: bring a second player and share a device.

Audio credits and licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

**[Ready? Take the helm.](https://mahahmadi360.github.io/MAH.ShipFighter/)**
