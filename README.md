# 🃏 UNO Counter

A modern, browser-based score tracking application for UNO card games. Keep track of multiple games, player scores, round history, and determine winners with ease!

[![Test and Coverage](https://github.com/mezgoodle/UnoCounter/actions/workflows/ci.yml/badge.svg)](https://github.com/mezgoodle/UnoCounter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🎮 Multi-Game Management**: Create and manage multiple UNO games simultaneously
- **👥 Player Tracking**: Add multiple players and track their individual scores
- **📊 Round-by-Round Scoring**: Record scores for each round with detailed history
- **🏆 Winner Detection**: Automatically identifies the player with the lowest score
- **💾 Local Storage**: All game data is saved locally in your browser
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎯 Game States**: Distinguish between active and finished games
- **📈 Score History**: View complete round-by-round score breakdown
- **🗑️ Game Management**: Delete games you no longer need

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Storage**: Browser LocalStorage API
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions with Codecov integration

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/mezgoodle/UnoCounter.git
   cd UnoCounter/unocounter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Creating a New Game

1. Click the **"Start New Game"** button on the home page
2. Enter player names (minimum 2 players)
3. Click **"Create Game"** to start

### Adding Round Scores

1. Open an active game by clicking on its card
2. Click **"Add Round Scores"**
3. Enter the score for each player for that round
4. Click **"Submit Round"**

### Ending a Game

1. Open the game you want to end
2. Click **"End Game"**
3. Confirm the action
4. The game will be moved to the "Finished Games" section

### Viewing Game Details

- **Current Turn**: See which round you're on
- **Total Rounds**: View how many rounds have been played
- **Player Scores**: See cumulative scores with winner indication (🏆)
- **Round History**: Review scores from all previous rounds

## 🧪 Testing

The project includes comprehensive unit tests for all major components and utilities.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov
```

### Coverage

Test coverage reports are automatically generated and uploaded to Codecov on every push to the main branch.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Generate coverage report

### Code Quality

- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library
- **CI/CD**: Automated testing on pull requests

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Maksym Zavalniuk** ([@mezgoodle](https://github.com/mezgoodle))

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons and emojis for enhanced UX

---

Made with ❤️ for UNO enthusiasts!
