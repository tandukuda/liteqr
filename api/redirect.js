export default function handler(req, res) {
    const { target } = req.query;
    
    if (!target) {
      return res.status(400).send('Missing target URL parameter');
    }
    
    // Simple validation to ensure it's a URL
    let url;
    try {
      url = new URL(target);
    } catch (e) {
      // If it's not a valid URL, assume it's text and redirect to a search
      return res.redirect(302, `https://www.google.com/search?q=${encodeURIComponent(target)}`);
    }
    
    // Basic analytics - in a real app you might store this in a database
    console.log(`Redirect: ${target} at ${new Date().toISOString()}`);
    
    // Redirect to the target URL
    return res.redirect(302, target);
  }