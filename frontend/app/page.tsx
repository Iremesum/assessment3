export default function Home() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome</h2>
      <p className="mb-2">
        This is Assessment 2: the RSS Server now has a real backend — a
        database, CRUD API, and Docker deployment. This frontend (the RSS
        Client) connects to that live backend to display feed content.
      </p>
      <p>Visit the Feeds page to see live data from the RSS Server.</p>
    </div>
  );
}