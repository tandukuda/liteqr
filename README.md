# 🌐 LiteQR

**LiteQR** is a fast, privacy-friendly QR code generator built for simplicity and utility. It supports both **static** and **dynamic** QR codes — all with no tracking, no paywalls, and no unnecessary clutter.

> 🔗 Live: [https://liteqr.vercel.app](https://liteqr.vercel.app)

---

## ✨ Features

* 🧩 **Static & Dynamic QR codes**</br>
Generate regular QR codes or use dynamic mode to update destination links without changing the code.

* 🎨 **Customization**</br>
  Choose your size, color, background, and error correction level.

* 🖼️ **Multiple export formats**</br>
  Export your QR code as **PNG**, **JPG**, or **SVG**.

* 📜 **Local history**</br>
  Automatically saves your recent QR codes locally — no sign-in needed.

* 🌐 **Mobile-friendly UI**</br>
  Works great on all devices with a responsive layout.

* 🧭 **Redirect page**</br>
  Built-in redirect handling for dynamic QR codes using a simple `redirect.html` route.

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
└── assets/                   # Icons, favicon, etc.
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
