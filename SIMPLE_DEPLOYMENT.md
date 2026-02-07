# Simple Deployment Guide with EmailJS

## 🚀 Easy Setup (No Azure Required!)

Your photobooth now uses **EmailJS** - the same service from your existing code! This means no complex Azure setup needed.

## ✅ Current Setup

I've already configured your photobooth to use:
- **Your EmailJS Public Key**: `H6_V8a7KYIVqvqpfb`
- **Your Service ID**: `service_nt7h0ek` 
- **Your Template ID**: `template_evikrle`

## 📧 EmailJS Template Setup

You may want to update your EmailJS template to handle photo sharing:

### Option 1: Use Your Existing Template
Your current template should work, but you might want to update it for photos.

### Option 2: Create New Photo Template
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. **Email Templates** → **Create New Template**
3. **Template Name**: "CS Club Photo Share"
4. **Template Content**:
```
Subject: {{subject}}

Hi there!

{{message}}

Photo Data: {{image_data}}

Best regards,
{{from_name}}
```
5. **Save** and copy the new **Template ID**
6. Update `template_evikrle` in your code to the new template ID

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Updated to use EmailJS"
git push origin main
```

### Step 2: Deploy
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. **Import** your `CSClub-photobooth` repository
4. Click **Deploy**

### Step 3: Test! 🎉
1. Visit your live site: `https://your-project.vercel.app`
2. Test photo sharing functionality
3. Check emails are received successfully

## 🔧 If You Want Your Own EmailJS Account

If you prefer to use your own EmailJS setup:

1. **Create account** at [EmailJS.com](https://emailjs.com)
2. **Set up email service** (Gmail works great)
3. **Create template** for photo sharing
4. **Update the code** with your:
   - Public Key
   - Service ID  
   - Template ID

## ✨ Benefits

✅ **No Azure required** - Perfect for student accounts
✅ **Uses your existing EmailJS** - Already working setup
✅ **Free tier generous** - 200 emails/month
✅ **Simple deployment** - Just push and deploy
✅ **No backend complexity** - Pure frontend solution

## 📝 What Changed

- ✅ **Added EmailJS integration** to `final.html`
- ✅ **Updated JavaScript** to use EmailJS instead of API
- ✅ **Removed backend files** (api/, vercel.json)
- ✅ **Simplified package.json** - No dependencies needed
- ✅ **Using your existing EmailJS setup** - Should work immediately

## 🎯 Ready for Your Spring Fair!

Your photobooth is now ready to:
- Take/upload photos ✅
- Add underwater stickers ✅  
- Share via email ✅
- Deploy to any static hosting ✅

**🎉 Perfect for the 2026 Spring Activities Fair! 🚀**
