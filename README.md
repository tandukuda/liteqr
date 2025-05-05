# 🌐 LiteQR

**LiteQR** is a lightweight, privacy-focused, open-source QR Code generator — built for speed, flexibility, and full control. Generate static QR codes with customization options, error correction levels, history tracking, and light/dark themes — all without paying for premium tiers.

> 🔗 Live: [https://liteqr.vercel.app](https://liteqr.vercel.app)

---

## ✨ Features

- ✅ **Static QR Code Generator**
- 🎨 **Customizable Options**
  - Foreground and background colors
  - Size input (pixels)
  - Error correction level (L, M, Q, H)
- 🌓 **Dark Mode Support**
- 🧠 **Local History Tracking**
  - See your past generated QR codes
  - Stored safely in your browser
- 💾 **Download as PNG, JPG or SVG**
- 📱 Fully responsive design
- ⚡ Blazing fast — no backend required

---

## 📸 Preview

![LiteQR](https://github.com/user-attachments/assets/6abc5692-e7ba-4e85-bd71-0c64e0c7e7f4)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tandukuda/liteqr.git
cd liteqr
```

### 2. Install dependencies (optional — static-only)

This project is **fully static** and doesn't require a build step. Just open `index.html` or deploy it.

### 3. Deploy to Vercel

Push it to GitHub and connect the repo to [Vercel](https://vercel.com) — it just works™.

---

## 📁 Project Structure

```
LiteQR/
├── index.html                 # Main UI
├── redirect.html             # (optional) For dynamic redirection
├── css/styles.css
├── js/
│   ├── main.js               # App logic
│   ├── qr-generator.js       # QR creation logic
│   ├── history.js            # Local history handling
│   ├── theme.js              # Dark/light mode
│   └── utils.js              # Helper functions
├── assets/                   # Icons, favicon, etc.
└── vercel.json               # Optional routing config
```

---

## 📌 Planned Features / TODO

- [X] SVG export
- [X] Dynamic QR redirection (optional Firebase layer)
- [ ] Share via Web Share API
- [ ] Installable PWA support

---

## 🧑‍💻 Contributing

Pull requests are welcome! Feel free to open an issue for any bugs or feature requests.

---

## 📄 License

MIT License — do whatever you want, but don’t claim you made it 😉

---

## 💬 Credits

Made with ❤️ by [@tandukuda](https://github.com/tandukuda)  
Inspired by the frustration with "paywalled QR code features."
