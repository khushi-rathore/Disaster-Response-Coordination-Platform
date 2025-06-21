export class OfficialUpdatesService {
  async fetchFEMAUpdates(): Promise<any[]> {
    try {
      // Mock FEMA updates since we can't actually scrape in this environment
      return [
        {
          id: "1",
          title: "Federal Disaster Declaration for New York Flooding",
          content:
            "President declares federal disaster for New York State due to severe flooding. Federal aid now available for affected residents.",
          source: "FEMA",
          url: "https://www.fema.gov/disaster/current",
          publishedAt: new Date().toISOString(),
          category: "declaration",
        },
        {
          id: "2",
          title: "Emergency Shelter Locations Updated",
          content:
            "New emergency shelters opened in Manhattan and Brooklyn. Capacity increased to accommodate additional evacuees.",
          source: "NYC Emergency Management",
          url: "https://www1.nyc.gov/site/em/index.page",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          category: "shelter",
        },
        {
          id: "3",
          title: "Transportation Service Disruptions",
          content: "Multiple subway lines suspended due to flooding. Alternative transportation being coordinated.",
          source: "MTA",
          url: "https://new.mta.info/alerts",
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          category: "transportation",
        },
      ]
    } catch (error) {
      console.error("Error fetching official updates:", error)
      return []
    }
  }

  async fetchRedCrossUpdates(): Promise<any[]> {
    try {
      // Mock Red Cross updates
      return [
        {
          id: "4",
          title: "Emergency Relief Operations Expanded",
          content: "Red Cross has deployed additional emergency response vehicles and volunteers to affected areas.",
          source: "American Red Cross",
          url: "https://www.redcross.org/about-us/news-and-events",
          publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          category: "relief",
        },
        {
          id: "5",
          title: "Donation Centers Accepting Supplies",
          content:
            "Local donation centers are accepting non-perishable food, water, blankets, and clothing for disaster victims.",
          source: "American Red Cross",
          url: "https://www.redcross.org/get-help/disaster-relief-and-recovery-services",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          category: "donations",
        },
      ]
    } catch (error) {
      console.error("Error fetching Red Cross updates:", error)
      return []
    }
  }

  async getAllUpdates(): Promise<any[]> {
    const [femaUpdates, redCrossUpdates] = await Promise.all([this.fetchFEMAUpdates(), this.fetchRedCrossUpdates()])

    return [...femaUpdates, ...redCrossUpdates].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
  }
}

export const officialUpdates = new OfficialUpdatesService()
