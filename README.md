# CrisisNetX - Real-Time Disaster Coordination Platform

A backend-heavy MERN stack application for real-time disaster coordination with AI-powered location extraction, image verification, and interactive mapping.

## 🚀 Features

### Core Functionality
- **Real-time Disaster Reporting**: Citizens can report disasters with automatic location extraction
- **AI-Powered Analysis**: Google Gemini API for location extraction and image verification
- **Interactive Mapping**: Leaflet.js + OpenStreetMap for real-time disaster visualization
- **Resource Coordination**: Track shelters, hospitals, and relief centers
- **Live Updates**: Real-time alerts and status updates

### AI Integration
- **Location Extraction**: Automatically extract precise locations from disaster descriptions
- **Image Verification**: Verify authenticity of uploaded disaster images
- **Content Analysis**: Analyze severity and urgency of disaster reports
- **Smart Categorization**: Automatic disaster type classification

### Technical Features
- **Geospatial Queries**: PostGIS-powered location-based searches
- **Real-time Updates**: Live dashboard with automatic data refresh
- **Responsive Design**: Mobile-first design with dark theme
- **API-First Architecture**: RESTful APIs for all operations

## 🛠 Tech Stack

### Backend
- **Next.js 14**: Full-stack React framework with App Router
- **Supabase**: PostgreSQL database with PostGIS extension
- **Google Gemini API**: AI-powered content analysis
- **TypeScript**: Type-safe development

### Frontend
- **React 18**: Modern React with hooks and server components
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Leaflet.js**: Interactive mapping without API keys
- **Lucide React**: Beautiful icons

### Database
- **PostgreSQL**: Robust relational database
- **PostGIS**: Geospatial extension for location queries
- **Real-time subscriptions**: Live data updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/khushi-rathore/Disaster-Response-Coordination-Platform
cd crisisnetx
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials:
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
\`\`\`

4. **Set up the database**
- Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor
- Start with `01-crisisnetx-schema.sql` then `02-crisisnetx-seed-data.sql`

5. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `https://alertgrid.vercel.app/` to see the application.

## 📊 Database Schema

### Core Tables
- **users**: User authentication and profiles
- **disasters**: Main disaster events with geospatial data
- **disaster_reports**: Citizen reports and updates
- **resources**: Shelters, hospitals, relief centers
- **alerts**: Real-time alerts and notifications
- **social_posts**: Social media monitoring
- **response_teams**: Emergency response coordination

### Key Features
- PostGIS geospatial queries for location-based searches
- JSONB fields for flexible metadata storage
- Comprehensive indexing for performance
- Audit trails and system logging

## 🤖 AI Integration

### Google Gemini API Usage

**Location Extraction**
\`\`\`typescript
const locationResult = await geminiService.extractLocationFromText(
  "Severe flooding in Pune subway station"
);
// Returns: { location_name: "Pune, Maharashtra", confidence: 0.95 }
\`\`\`

**Image Verification**
\`\`\`typescript
const verification = await geminiService.verifyImage(
  imageUrl, 
  "Flood damage in residential area"
);
// Returns: { is_authentic: true, confidence: 0.87 }
\`\`\`

## 🗺 Mapping

### Leaflet.js Integration
- **No API Keys Required**: Uses free OpenStreetMap tiles
- **Real-time Updates**: Dynamic marker updates
- **Interactive Features**: Click markers for details
- **Responsive Design**: Works on all devices

### Map Features
- Disaster markers with severity-based colors
- Resource markers with type-based icons
- Popup information windows
- Auto-fit bounds for optimal viewing

## 📱 API Endpoints

### Disasters
- `GET /api/disasters` - List disasters with optional location filtering
- `POST /api/disasters` - Create new disaster with AI analysis

### Reports
- `GET /api/reports` - List disaster reports
- `POST /api/reports` - Submit new report with verification

### Resources
- `GET /api/resources` - List available resources
- `POST /api/resources` - Add new resource

## 🎨 Design System

### Color Palette
- **Background**: `#0F172A` (Dark Navy)
- **Primary**: `#38BDF8` (Sky Blue)
- **Alerts**: `#F43F5E` (Rose Red)
- **Text**: `#F8FAFC` (White)
- **Font**: Poppins

### Component Library
- Built with shadcn/ui components
- Consistent dark theme throughout
- Responsive design patterns
- Accessible UI elements

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
\`\`\`

## 📈 Performance

### Optimizations
- Server-side rendering with Next.js
- Efficient database queries with PostGIS
- Image optimization and lazy loading
- API response caching
- Real-time subscriptions for live updates

### Monitoring
- Error tracking and logging
- Performance metrics
- Database query optimization
- API rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent database platform
- **Google Gemini** for AI capabilities
- **Leaflet.js** for free mapping solution
- **shadcn/ui** for beautiful components
- **Vercel** for seamless deployment

## 📞 Support

For support, email support@crisisnetx.com or join our Discord community.

---

**CrisisNetX** - Empowering communities through technology in times of crisis.
