WORLD LIFE 2.7 — HOW TO RUN ON macOS

HOW TO PLAY (easiest way first):
1. Extract this ZIP.
2. Open the extracted world-life-2 folder.
3. Double-click index.html. The game opens in your browser — no
   server, no Terminal, nothing else to run.

Your saved game data is stored by the browser's local storage. Use
the same browser and the same extracted folder when returning to
the game, and your save will still be there.

IF DOUBLE-CLICKING DOES NOT WORK (fallback — local server):
1. Double-click start-game.command.
2. If macOS blocks it, right-click start-game.command, choose Open,
   then confirm Open.
3. Keep the Terminal window open while playing. The game opens at:
   http://127.0.0.1:8765/
4. To stop the local server, return to Terminal and press Control+C.

If the server way still does not open:
- Open Terminal.
- Type: cd 
- Drag the extracted world-life-2 folder into Terminal and press Return.
- Run: python3 serve.py 8765
- Open http://127.0.0.1:8765/ in your browser.

Note: a save made by double-clicking index.html and a save made
through the local server live in different browser storage slots
(file address vs. local address), so the two ways do not share
saves. Pick one way and stick with it.
