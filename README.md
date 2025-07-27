# 🧪 RateMyPI - European Research Lab Reviews

**eurolabreviews.eu** - A platform for anonymous and identified reviews of Principal Investigators and research labs across Europe. Make informed decisions about your research career.

## 🎯 Project Status

**Current Phase:** Week 3-4 Complete ✅ | Week 5-6 In Progress 🔄
- ✅ Next.js + TypeScript + Tailwind setup
- ✅ Database schema design
- ✅ Frontend architecture with core components
- ✅ API routes for reviews and moderation
- ✅ Supabase integration
- ✅ **Search and filtering functionality**
- ✅ **Advanced form validation with real-time feedback**
- ✅ **PI profile pages with review aggregation**
- ✅ **Enhanced user experience and content moderation**

**Next:** Week 5-6 - LLM integration and enhanced moderation testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd ratemypi
npm install
```

2. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Enable AI moderation
OPENAI_API_KEY=your_openai_api_key
ENABLE_LLM_MODERATION=true
```

3. **Set up Supabase database:**
- Create a new Supabase project
- Copy the SQL from `supabase/schema.sql`
- Run it in the Supabase SQL Editor

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ratemypi/
├── src/app/              # Next.js app router pages
│   ├── page.tsx          # Homepage with search
│   ├── submit/           # Review submission
│   ├── search/           # Search results with filters
│   ├── pi/[id]/          # Individual PI profile pages
│   └── api/              # API routes
├── components/           # React components
│   ├── SearchBar.tsx     # PI/institution search
│   ├── ReviewForm.tsx    # Enhanced review submission form
│   ├── ReviewCard.tsx    # Individual review display
│   └── RecentReviews.tsx # Homepage reviews list
├── lib/                  # Utilities and config
│   └── supabase.ts       # Database client & types
└── supabase/             # Database schema
    └── schema.sql        # Tables and triggers
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Moderation:** Regex filters + Optional OpenAI API
- **Hosting:** Vercel (planned)
- **Domain:** eurolabreviews.eu

## 🚀 Deployment

### GitHub Integration
This project is configured for GitHub deployment with your hosting provider:

1. **Push to GitHub:**
```bash
git add .
git commit -m "Clean project structure for deployment"
git push origin main
```

2. **Connect to Hosting Provider:**
- Link your GitHub repository
- Set environment variables in your hosting dashboard
- Deploy automatically on push

### Environment Variables for Production
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key (optional)
ENABLE_LLM_MODERATION=true (optional)
```

## 🔧 Features

### Current (MVP+)
- ✅ **Anonymous review submission** with comprehensive form validation
- ✅ **Advanced search and filtering** by PI name, institution, position, year, rating
- ✅ **PI profile pages** with aggregated statistics and individual reviews
- ✅ **Real-time content moderation** with user feedback
- ✅ **5-point rating system** with visual sliders and descriptions
- ✅ **Mobile-friendly responsive design** with sticky navigation
- ✅ **Real-time form validation** with error highlighting
- ✅ **Review sorting** by date, rating, and other criteria
- ✅ **Content preview** and moderation status indicators

### Enhanced UX Features
- **Live character counting** for review text (50-2000 chars)
- **Real-time moderation checking** as users type
- **Progressive form validation** with immediate feedback
- **Visual rating sliders** with gradient backgrounds
- **Overall rating calculation** displayed prominently
- **Tabbed search results** (Reviews vs PIs)
- **Advanced filtering sidebar** with multiple criteria
- **Loading states and error handling** throughout the app

### Planned (v2+)
- 🔄 **Enhanced LLM moderation** (Week 5-6)
- 🔄 Admin dashboard for manual moderation (Week 7)
- 🔄 Export and analytics
- 🔄 ORCID integration
- 🔄 Email notifications
- 🔄 Report functionality for inappropriate content

## 🔒 Privacy & Legal

- **GDPR Compliant:** All data stored in EU servers
- **Anonymous:** No personal identification required
- **Moderation:** All reviews filtered for inappropriate content
- **Right to be forgotten:** Users can request review removal

## 🧪 Development

### API Endpoints

- `GET /api/reviews` - Fetch reviews (with filtering: PI name, institution, position, year range, min rating)
- `POST /api/reviews` - Submit new review with validation
- `POST /api/moderate` - Content moderation with real-time feedback
- `GET /api/pi-profiles` - Search PI profiles
- `GET /api/pi-profiles/[id]` - Individual PI profile data

### Database Schema

- `reviews` - Main review data with ratings and text
- `pi_profiles` - Aggregated PI statistics with auto-updating triggers
- `moderation_logs` - Content moderation history
- `reports` - User-reported content system

### Content Moderation

1. **Banned words filter** - Automatic rejection with user-friendly messages
2. **Length validation** - Min/max character limits (50-2000)
3. **Caps detection** - Prevent excessive shouting
4. **Real-time checking** - As users type (debounced)
5. **LLM moderation** - Optional AI review (OpenAI) with visual feedback

### Form Validation

- **Real-time validation** - Immediate feedback as users type
- **Field-specific error messages** - Clear, actionable guidance
- **Visual error states** - Red borders and icons for invalid fields
- **Progressive disclosure** - Validation only after field interaction
- **Submit prevention** - Button disabled until all errors resolved

## 📊 Current Stats (Mock Data)

- **500+ PIs Reviewed** across European institutions
- **50+ Institutions** represented
- **15+ Countries** covered
- **Average 4.2/5** rating across all reviews

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact

- **Project Issues:** [GitHub Issues](https://github.com/your-username/ratemypi/issues)
- **Project Discussions:** [GitHub Discussions](https://github.com/your-username/ratemypi/discussions)

---

**Built with ❤️ for the European research community***

*Making academic career decisions more informed, one review at a time.*
