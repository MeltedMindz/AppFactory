<p align="center">
  <img src="./AppFactory.png" alt="App Factory" width="800" />
</p>

# App Factory

**Build market-ready mobile apps — from research to React Native code — in one command.**

App Factory is an agent-native workflow that designs, validates, and builds mobile apps with product, monetization, UX, ASO, and launch strategy baked in.

No prompts. No hand-holding. Artifacts on disk or it didn't happen.

## What You Get

✅ Market research with evidence  
✅ 10 validated app ideas per run  
✅ Full product specs for each idea  
✅ UX flows, IA, and accessibility guidance  
✅ Monetization strategy (subscriptions, pricing, trials)  
✅ Technical architecture decisions  
✅ Brand identity & positioning  
✅ ASO package (App Store title/subtitle/keywords + screenshot plan)  
✅ Release planning  
✅ A real Expo / React Native app (when you build)  

**Everything is written to disk. Everything is validated. Everything is reproducible.**

## The Two Core Commands

**Open Claude in this repository and type:**

```
run app factory (batch specs)
```
*Generates complete specifications for 10 validated app ideas*

```
build app <IDEA_NAME>
```  
*Builds a complete Expo React Native app for your selected idea*

## The Two Core Commands

**Open Claude in this repository and type:**

### Generate Complete Specifications
```
run app factory
```
*Generates complete specifications for 10 validated app ideas automatically*

- **Input**: Market signals and user constraints  
- **Output**: 80 specification files (8 stages × 10 ideas)
- **Duration**: ~3 hours (fully automated)
- **Result**: 10 store-ready app concepts with complete product specs

### Build Selected App  
```
build app <IDEA_NAME>
```  
*Builds a complete Expo React Native app for your selected idea*

- **Input**: One idea from your batch specs run
- **Output**: Complete React Native app in `builds/` directory  
- **Duration**: ~45 minutes (fully automated)
- **Result**: Store-ready mobile application

### Example Workflow
```bash
# Step 1: Generate 10 complete app specifications
run app factory

# Step 2: Pick your favorite idea and build it
build app "FocusFlow AI"

# Result: Complete mobile app ready for App Store submission
```

## Why This Is Different

**Connected Decisions, Not Isolated Templates**

Most AI tools generate disconnected outputs. App Factory ensures every specification connects:

- Market research **directly informs** product features
- Product features **directly inform** UX wireframes  
- UX wireframes **directly inform** technical architecture
- Technical architecture **directly informs** the actual React Native code
- Monetization strategy **directly informs** RevenueCat integration
- Brand identity **directly informs** UI theme and styling

**Result**: Every line of generated code traces back to market evidence.

## Truth Enforcement

**Success is files-on-disk.** No stubs, no placeholders, no false success claims.

✅ All 80+ JSON outputs validate against schemas  
✅ All execution steps documented in logs  
✅ All specifications rendered to markdown  
✅ Mobile app (when built) is complete and runnable  
✅ Every constraint maps to actual implementation  

**If it's not written to disk with binding proof, it didn't happen.**

## Tech Stack

**Modern, Proven, Store-Ready**

- **Framework**: React Native + Expo (latest stable)
- **Navigation**: Expo Router (file-based)
- **Monetization**: RevenueCat (subscription-first)
- **Storage**: AsyncStorage + SQLite
- **Auth**: Guest-first, optional accounts
- **Platforms**: iOS + Android simultaneously

**Why These Choices**: Each technology decision traces back to market research and monetization strategy from your specifications.

## Getting Started

**Prerequisites**: Claude subscription + this repository

```bash
# 1. Clone the repository
git clone <this-repo>
cd app-factory

# 2. Open Claude and point it to this directory  
# (Claude will automatically read CLAUDE.md constitution)

# 3. Generate complete specifications for 10 app ideas
run app factory

# 4. Build your favorite idea into a complete app
build app "Your Chosen Idea Name"

# 5. Your app is ready in builds/ directory
cd builds/01_your_idea__idea_id_001
npm install
npm start
```

**That's it.** No configuration, no prompts, no hand-holding.

## Who This Is For

**Builders who want outcomes, not processes:**

✅ **Indie developers** - Generate validated app ideas + complete implementations  
✅ **Agencies** - Deliver complete mobile apps with full documentation  
✅ **Product managers** - Get market-backed specifications for any app concept  
✅ **Entrepreneurs** - Turn market research into store-ready applications  
✅ **Technical founders** - Skip months of specification work  

**Not for**: Teams that enjoy writing specifications manually, or developers who prefer building everything from scratch.

**Perfect for**: Anyone who wants to ship mobile apps faster with market validation baked in.

## Output Structure

After running batch specs, you get:

```
runs/YYYY-MM-DD/your-run-name/
├── ideas/
│   ├── 01_focusflow_ai__focus_ai_001/     # Idea pack 1
│   │   ├── stages/                           # 8 JSON specs (02-09)
│   │   ├── spec/                             # Human-readable markdown
│   │   └── meta/                             # Idea metadata & isolation
│   ├── 02_mindful_habits__habits_002/     # Idea pack 2
│   └── ...                               # 8 more idea packs
└── meta/
    └── idea_index.json                   # Master index of all 10 ideas

builds/
└── 01_focusflow_ai__focus_ai_001/        # Built app (after build command)
    ├── package.json                      # Complete Expo config
    ├── src/screens/                      # All app screens
    ├── src/services/purchases.js         # RevenueCat integration
    └── README.md                         # Setup instructions
```

## Repository Hygiene

**Generated outputs** (`runs/` and `builds/`) are ignored by git and never committed:

- **`runs/`** - All pipeline execution outputs and specifications
- **`builds/`** - Complete React Native apps built from selected ideas

**Clean repository**: `scripts/clean_repo.sh`  
**Check ship-readiness**: `scripts/ship_check.sh`

All builds go to `builds/<idea_dir>/` - never a fixed location.

---

## Contributing

**Key Principles:**
- Agent-native execution (Claude is the primary runner)
- Filesystem as source of truth (no false success claims)
- Schema-validated outputs (everything validates)
- Connected specifications (every decision traces to market research)

**Ways to Contribute:**
- 🐛 Report bugs and issues
- 💡 Suggest new pipeline stages or improvements  
- 📝 Improve documentation and templates
- 🧪 Add validation and quality checks
- 🔧 Submit pull requests

## License

**MIT License** - This project is open source and free to use. See LICENSE file for details.

## Support Open Source Development

App Factory is developed and maintained as an **open source project**. If this tool helps you build better mobile applications faster, please consider supporting its continued development.

### ⭐ Ways to Support

- **Star this repository** - Help others discover App Factory
- **Share the project** - Tell other developers about agent-native app generation
- **Contribute code** - Submit improvements and new features
- **Report issues** - Help us improve reliability and usability
- **Sponsor development** - Support ongoing maintenance and new features

### 💖 Become a Sponsor

Your sponsorship helps:
- 🚀 **Add new pipeline stages** for advanced app features
- 🔧 **Improve validation** and error handling
- 📱 **Support new frameworks** beyond React Native
- 🌐 **Enhance signal sources** for better market research
- 📚 **Create tutorials** and documentation
- 🐛 **Fix bugs** and performance issues

[**Sponsor App Factory on GitHub →**](https://github.com/sponsors/MeltedMindz)

Every contribution, whether code or financial, helps make App Factory better for the entire developer community. Thank you for supporting open source! 🙏

---

**App Factory: From market research to React Native code — in two commands.**