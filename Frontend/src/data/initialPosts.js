// Initial pinned posts for the Community page.
// Images can be set to imports later (e.g. `import flood1 from '../assets/community/flood1.jpg'`).
import flood1 from "../assets/community/flood1.jpeg";
import flood2 from "../assets/community/flood2.jpeg";
import flood3 from "../assets/community/flood3.jpeg";
import flood4 from "../assets/community/flood4.jpeg";
import flood5 from "../assets/community/flood5.jpeg";

export const INITIAL_POSTS = [
  {
    id: "101",
    author: "Safety Insights Admin",
    timestamp: "2 hours ago",
    location: "Global Awareness",
    category: "flood",
    title: "Understanding Floods",
    description:
      "A flood occurs when water overflows from a river or water channel, inundating normally dry land. While floods can be beneficial (like enriching floodplains), Flash Floods resulting from short, heavy rainfall are often catastrophic, causing severe damage to life and property.",
    image: flood1,
    likes: 15,
    comments: [],
  },
  {
    id: "102",
    author: "Weather Alert System",
    timestamp: "1 day ago",
    location: "Wadi Flash Zone",
    category: "flood",
    title: "Warning: Flash Floods",
    description:
      "A flash flood is a sudden, rapid flow of turbulent, muddy water rushing down wadis or valleys. They are caused by intense rainfall or rapid snowmelt, and waters typically rise and fall within a few hours or days. The resulting walls of water can be powerful enough to destroy roads and bridges. Always be prepared!",
    image: flood2,
    likes: 22,
    comments: [
      {
        id: "1",
        author: "UserA",
        content: "Very important!",
        timestamp: "1 day ago",
      },
    ],
  },
  {
    id: "103",
    author: "Infrastructure Planning",
    timestamp: "2 days ago",
    location: "Urban Control",
    category: "flood",
    title: "Controlling Floods",
    description:
      "Flood control measures include channel improvements, building protective levees/dams, and implementing programs to maintain soil and vegetation cover to slow and absorb runoff water. As an individual, do not build in floodplains and follow civil defense warnings closely.",
    image: flood3,
    likes: 8,
    comments: [],
  },
  {
    id: "104",
    author: "NOAA NSSL Facts",
    timestamp: "5 days ago",
    location: "Road Safety",
    category: "flood",
    title: "Turn Around, Don't Drown!",
    description:
      "It takes only six inches of moving water to sweep a person off their feet, and two feet (24 inches) to sweep away most vehicles, including SUVs and pickup trucks! The majority of flood fatalities occur when people drive into flooded roads. NEVER drive or walk through floodwaters. Remember: Turn Around, Don't Drown.",
    image: flood4,
    likes: 12,
    comments: [
      {
        id: "1",
        author: "Driver",
        content: "Safety first!",
        timestamp: "2 days ago",
      },
    ],
  },
  {
    id: "105",
    author: "Hydrology Experts",
    timestamp: "6 days ago",
    location: "River Basins",
    category: "flood",
    title: "River Flooding Causes",
    description:
      "The primary cause of riverine floods is heavy rainfall over large areas for an extended period, or rapid melting of deep snow. These conditions increase the volume of water flowing into the river channel faster than it can be safely carried away. This often leads to the river exceeding its bankfull capacity and spilling into the surrounding floodplain.",
    image: flood5,
    likes: 12,
    comments: [],
  },
];

export default INITIAL_POSTS;
