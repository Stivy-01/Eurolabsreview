# 🚀 Deployment Checklist for eurolabreviews.eu

## ✅ Pre-Deployment Tasks

### 1. **Project Cleanup** ✅
- [x] Moved development files to `/archive/` folder
- [x] Updated README with new domain
- [x] Cleaned up project structure
- [x] Updated .gitignore

### 2. **GitHub Repository Setup**
- [ ] Initialize git repository (if not already done)
- [ ] Create GitHub repository
- [ ] Push clean code to GitHub

### 3. **Environment Variables**
- [ ] Set up Supabase environment variables
- [ ] Configure hosting provider environment variables
- [ ] Test environment variables locally

## 🔧 GitHub Setup

### **Step 1: Initialize Git (if needed)**
```bash
git init
git add .
git commit -m "Initial commit: Clean project structure for eurolabreviews.eu"
```

### **Step 2: Create GitHub Repository**
1. Go to GitHub.com
2. Click "New repository"
3. Name: `eurolabreviews` or `ratemypi`
4. Make it private (recommended for now)
5. Don't initialize with README (we already have one)

### **Step 3: Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🌐 Hosting Provider Setup

### **Step 1: Connect GitHub Repository**
1. Log into your hosting provider
2. Find "Connect GitHub" or "Deploy from Git"
3. Select your repository
4. Choose the `main` branch

### **Step 2: Configure Build Settings**
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x or higher

### **Step 3: Set Environment Variables**
In your hosting provider dashboard, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Optional (for AI moderation):**
```bash
OPENAI_API_KEY=your_openai_api_key
ENABLE_LLM_MODERATION=true
```

### **Step 4: Configure Domain**
1. Add custom domain: `eurolabreviews.eu`
2. Configure DNS settings as instructed by your hosting provider
3. Set up SSL certificate (usually automatic)

## 🧪 Testing Checklist

### **Before Deployment**
- [ ] Test locally with `npm run dev`
- [ ] Test build with `npm run build`
- [ ] Verify all environment variables work
- [ ] Test form submission
- [ ] Test search functionality

### **After Deployment**
- [ ] Test homepage loads correctly
- [ ] Test review submission form
- [ ] Test search and filtering
- [ ] Test responsive design on mobile
- [ ] Verify SSL certificate works
- [ ] Test domain redirects

## 🔍 Post-Deployment

### **Monitor These Items:**
- [ ] Application logs for errors
- [ ] Database connections
- [ ] Form submissions
- [ ] Search performance
- [ ] Mobile responsiveness

### **SEO Setup**
- [ ] Add meta tags for social sharing
- [ ] Set up Google Analytics (optional)
- [ ] Submit sitemap to search engines
- [ ] Test page load speed

## 🚨 Troubleshooting

### **Common Issues:**
1. **Build Fails**: Check Node.js version and dependencies
2. **Environment Variables**: Verify all required variables are set
3. **Database Connection**: Check Supabase URL and keys
4. **Domain Issues**: Verify DNS settings and SSL certificate

### **Useful Commands:**
```bash
# Test build locally
npm run build

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# View build logs
npm run build --verbose
```

## 📞 Support

If you encounter issues:
1. Check hosting provider documentation
2. Review Next.js deployment guides
3. Verify Supabase configuration
4. Check browser console for errors

---

**🎉 Once deployed, your site will be live at: https://eurolabreviews.eu** 