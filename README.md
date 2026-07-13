Minecraft Learning Bot

Version: 0.0.1
Author: AmiRus-C (Nicshuz_)

An advanced bot for Minecraft version 1.16.5 with self-learning capabilities, personality-driven behavior, and world interaction.

Features

Personality System

· Fully customizable personality — name, description, character traits
· 4 speech styles — friendly, formal, casual, mystical
· Emotion system — happiness, fear, excitement, curiosity, irritation
· Event memory — the bot remembers its experiences
· Evolving preferences — favorite and disliked actions

Learning System

· Q-Learning — reinforcement learning algorithm
· Adaptive exploration — bot starts with exploration, gradually shifting to knowledge exploitation
· Persisting Knowledge — all learned data is saved between sessions
· Learning statistics — progress tracking

World Interaction

· Movement and navigation — the bot can walk around the world
· Attack — interaction with mobs
· Block breaking — resource gathering
· Block placement — building
· Item collection — auto-collect dropped items

Chat System

· Dynamic messages — responses depend on the bot's personality
· Emotional communication — messages reflect the bot's mood
· Reactive behavior — responses to player messages
· Status reports — state notifications

Installation

Requirements

· Node.js 16 or higher
· Minecraft Server version 1.16.5 (local server recommended)

Steps

```bash
# Navigate to project directory
cd MinecraftBot

# Install dependencies
npm install

# Ensure Minecraft server is running on localhost:25565
# For local server:
java -Xmx1024M -Xms1024M -jar server.jar nogui
```

Usage

Basic Start

```bash
npm start
```

Development Mode (auto-restart)

```bash
npm run dev
```

Configuration

Connection Settings

Edit config/botConfig.js:

```javascript
export const botConfig = {
  connection: {
    host: 'localhost',   // Server IP
    port: 25565,         // Server port
    username: 'MinecraftAI', // Bot name
    version: '1.16.5'    // Minecraft version
  }
};
```

Personality Setup

Edit src/bot.js (in the main() function):

```javascript
bot.setPersonality({
  personality_name: 'Alex',
  personality_description: 'Experienced explorer',
  speech_style: 'friendly',
  traits: {
    friendliness: 0.8,
    curiosity: 0.9,
    confidence: 0.7,
    cautiousness: 0.4,
    creativity: 0.6
  }
});
```

Available Speech Styles:

· friendly — friendly, enthusiastic
· formal — formal, professional
· casual — casual, laid-back
· mysterious — mysterious, mystical

Project Structure

```
MinecraftBot/
├── src/
│   ├── bot.js                    # Main bot file
│   ├── systems/
│   │   ├── PersonalitySystem.js  # Personality management
│   │   ├── ChatSystem.js         # Communication system
│   │   └── WorldInteractionSystem.js # World interaction
│   ├── ai/
│   │   └── LearningSystem.js     # Q-Learning algorithm
│   └── utils/
│       └── Logger.js             # Logging
├── config/
│   └── botConfig.js              # Configuration
├── data/
│   ├── personality.db            # Personality database
│   └── learning.db               # Knowledge database
├── logs/
│   └── bot.log                   # Log file
└── package.json
```

Key Components

PersonalitySystem

Manages the bot's personality, emotions, and memory.

```javascript
const personality = new PersonalitySystem();
personality.updateEmotion('happiness', 0.1); // Increase happiness by 10%
personality.addMemory({ type: 'event', ... }); // Save an event
personality.addFavoriteActivity('mining'); // Add a favorite action
```

LearningSystem

Implements reinforcement learning.

```javascript
const learning = new LearningSystem();
const action = learning.chooseAction(state, possibleActions);
learning.recordExperience(state, action, reward, nextState, nextActions);
```

WorldInteractionSystem

Manages world interaction.

```javascript
const world = new WorldInteractionSystem(bot, learning, personality);
await world.moveTo(target);
await world.attackEntity(entity);
await world.breakBlock(block);
const state = world.getWorldState();
```

ChatSystem

Generates chat messages.

```javascript
const chat = new ChatSystem(personality);
chat.sendChat(bot, chat.generateGreeting());
chat.sendChat(bot, chat.generateEmotionalMessage());
```

Logging

All events are logged to logs/bot.log and the console:

```
[10:30:45] [INFO] Initializing Minecraft bot...
[10:30:46] [SUCCESS] Systems initialized
[10:30:47] [SUCCESS] Bot connected as MinecraftAI
[10:31:00] [INFO] [CHAT] Player: Hello!
```

Skill Development

The bot learns automatically during gameplay:

1. Exploration (20% random actions) — bot tries new actions
2. Learning (80% best actions) — uses learned strategies
3. Saving — periodically saves knowledge to the database
4. Adaptation — gradually reduces exploration, becoming more efficient over time

Chat Commands

Players can interact with the bot in chat:

· /say Hello! → Bot responds with a greeting
· /say how are you? → Bot reports its status
· /say thank you → Bot expresses gratitude

Usage Examples

Example 1: Friendly Bot

```javascript
bot.setPersonality({
  personality_name: 'Friendly Alex',
  personality_description: 'Very friendly helper',
  speech_style: 'friendly',
  traits: {
    friendliness: 0.95,
    curiosity: 0.7,
    confidence: 0.5,
    cautiousness: 0.6,
    creativity: 0.5
  }
});
```

Example 2: Serious Bot

```javascript
bot.setPersonality({
  personality_name: 'Commander',
  personality_description: 'Experienced expedition commander',
  speech_style: 'formal',
  traits: {
    friendliness: 0.3,
    curiosity: 0.8,
    confidence: 0.95,
    cautiousness: 0.8,
    creativity: 0.4
  }
});
```

Debugging

Enable Debug Mode

In config/botConfig.js:

```javascript
logging: {
  debug: true,
  logFile: './logs/bot.log'
}
```

Check Bot Status

The bot outputs a full status every 100 ticks (100 seconds):

```
STATUS: Health=20.0, Hunger=20, Emotions=happiness: 55%, excitement: 45%
LEARNING: States=45, Records=892, Exploration=8.5%
```

Limitations and Known Issues

1. Navigation — simple algorithm, may get stuck on obstacles
2. Combat Skills — basic attack system
3. Building — simple block placement logic
4. Memory — limited to 1000 records for performance

Possible Improvements

· Improved navigation with pathfinding
· Goal and planning system
· Teamwork with other bots
· Recipe system
· More advanced combat skills
· GUI interaction (chests, crafting tables)
· Bed spawning
· Trading system

License

MIT
Copyright (c) 2025 AmiRus-C (Nicshuz_)

Support and Profile

For questions or suggestions:

· Author profile: https://github.com/AmiRus-C
· Nickname: Nicshuz_
· Please create an issue in the repository

---

Enjoy playing with your bot!
