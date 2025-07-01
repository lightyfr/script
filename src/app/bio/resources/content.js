// Profile data - all fields are optional
const content = {
  name: "Script AI ", // optional
  avatar: "/images/logo.png", // optional
  cover: "/images/dashb.png", // optional
  bio: "Land opportunities, not just send emails.", // optional
  links: [ // optional array
    // title, description and image are generated based on the link (if available) and not provided explicitly
    {
      title: "Script Waitlist", // optional
      description: "The waitlist to join Script AI, the ultimate research discovery tool", // optional
      url: "https://scriptoutreach.com/waitlist", // required if link object exists
      
      // children property can be used to add custom React components
      children: null,
      direction: "column",
    },
        {
      title: "Script", // optional
      description: "The waitlist to join Script AI, the ultimate research discovery tool", // optional
      url: "https://scriptoutreach.com", // required if link object exists
      
      // children property can be used to add custom React components
      children: null,
      direction: "column",
    },
  ],
};

export { content };